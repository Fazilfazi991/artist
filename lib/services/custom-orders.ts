import { randomUUID } from 'crypto';
import { redirect } from 'next/navigation';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdmin, requireApprovedSeller, requireAuth } from '@/lib/services/auth';
import { customOrderMilestoneSchema, customOrderQuoteSchema, customOrderRequestSchema } from '@/lib/validators/custom-orders';
import type { BespokeOrderStatus } from '@/lib/types/custom-orders';

const requestSelect = '*, seller_profiles(store_name, store_slug, user_id), profiles!custom_order_requests_buyer_id_fkey(email, full_name, phone), products(name, slug, product_type, base_price, product_images(*)), custom_order_quotes(*), custom_order_milestones(*), custom_order_payment_records(*), custom_order_status_history(*)';
const allowedFileTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4', 'video/webm', 'video/quicktime']);
const maxFileSize = 50 * 1024 * 1024;

export async function getCustomOrderEntryContext(storeSlug: string, productSlug?: string) {
  const service = createServiceRoleClient();
  const { data: seller, error } = await service.from('seller_profiles').select('*, storefront_settings(*)').eq('store_slug', storeSlug).eq('status', 'approved').maybeSingle();
  if (error || !seller) return null;
  let product = null;
  if (productSlug) {
    const result = await service.from('products').select('*, product_images(*)').eq('seller_id', seller.id).eq('slug', productSlug).eq('status', 'active').maybeSingle();
    product = result.data;
  }
  return { seller, product };
}

export async function createCustomOrderRequest(formData: FormData) {
  const user = await requireAuth();
  const parsed = customOrderRequestSchema.parse({
    seller_id: text(formData, 'seller_id'),
    product_id: text(formData, 'product_id') || undefined,
    title: text(formData, 'title'),
    description: text(formData, 'description'),
    budget_min: optionalNumber(formData, 'budget_min'),
    budget_max: optionalNumber(formData, 'budget_max'),
    quantity: optionalNumber(formData, 'quantity'),
    deadline: text(formData, 'deadline') || undefined,
    delivery_location: text(formData, 'delivery_location') || undefined,
    buyer_notes: text(formData, 'buyer_notes') || undefined,
    reference_links: linksFromText(text(formData, 'reference_links'))
  });
  const service = createServiceRoleClient();
  const { data: seller } = await service.from('seller_profiles').select('id, store_name, user_id, status').eq('id', parsed.seller_id).eq('status', 'approved').single();
  if (!seller) throw new Error('Choose an approved artisan.');
  const { data: request, error } = await service.from('custom_order_requests').insert({
    ...parsed,
    buyer_id: user.id,
    reference_files: [],
    reference_links: parsed.reference_links
  }).select('*').single();
  if (error) throw new Error(error.message);
  const referenceFiles = await uploadFiles(service, formData, 'reference_files', 'custom-order-files', `${user.id}/${request.id}`);
  if (referenceFiles.length) await service.from('custom_order_requests').update({ reference_files: referenceFiles }).eq('id', request.id);
  await notify(service, seller.user_id, 'New custom-order request', `You received a new custom-order enquiry: ${request.request_number}.`, `/seller/custom-requests/${request.id}`);
  return request;
}

export async function getBuyerCustomOrderRequests(userId: string) {
  const service = createServiceRoleClient();
  const { data, error } = await service.from('custom_order_requests').select(requestSelect).eq('buyer_id', userId).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getBuyerCustomOrderRequestById(id: string, userId: string) {
  const service = createServiceRoleClient();
  const { data, error } = await service.from('custom_order_requests').select(requestSelect).eq('id', id).eq('buyer_id', userId).single();
  if (error) return null;
  return normalizeRequest(data, 'buyer');
}

export async function getSellerCustomOrderRequests(userId: string) {
  const service = createServiceRoleClient();
  const { data: seller } = await service.from('seller_profiles').select('*').eq('user_id', userId).eq('status', 'approved').maybeSingle();
  if (!seller) return { seller: null, requests: [] };
  const { data, error } = await service.from('custom_order_requests').select(requestSelect).eq('seller_id', seller.id).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return { seller, requests: data || [] };
}

export async function getSellerCustomOrderRequestById(id: string, userId: string) {
  const service = createServiceRoleClient();
  const { data: seller } = await service.from('seller_profiles').select('*').eq('user_id', userId).eq('status', 'approved').maybeSingle();
  if (!seller) return null;
  const { data, error } = await service.from('custom_order_requests').select(requestSelect).eq('id', id).eq('seller_id', seller.id).single();
  if (error) return null;
  return normalizeRequest(data, 'seller');
}

export async function getAdminCustomOrderRequests() {
  await requireAdmin();
  const service = createServiceRoleClient();
  const { data, error } = await service.from('custom_order_requests').select(requestSelect).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map((item: any) => normalizeRequest(item, 'admin'));
}

export async function getAdminCustomOrderRequestById(id: string) {
  await requireAdmin();
  const service = createServiceRoleClient();
  const { data, error } = await service.from('custom_order_requests').select(requestSelect).eq('id', id).single();
  if (error) return null;
  return normalizeRequest(data, 'admin');
}

export async function markRequestReviewingAsSeller(id: string) {
  const { request, seller, service } = await getSellerOwnedRequest(id);
  requireStatus(request.status, ['request_submitted']);
  await transition(service, request, 'seller_reviewing', 'Review started by artisan.', seller.user_id);
  await notify(service, request.buyer_id, 'Your request is being reviewed', `The artisan has started reviewing ${request.request_number}.`, `/account/custom-orders/${request.id}`);
}

export async function createQuoteAsSeller(formData: FormData) {
  const seller = await requireApprovedSeller();
  const parsed = customOrderQuoteSchema.parse({
    request_id: text(formData, 'request_id'),
    quote_amount: optionalNumber(formData, 'quote_amount') ?? 0,
    deposit_amount: optionalNumber(formData, 'deposit_amount') ?? 0,
    final_amount: optionalNumber(formData, 'final_amount') ?? 0,
    estimated_completion_date: text(formData, 'estimated_completion_date') || undefined,
    quote_notes: text(formData, 'quote_notes') || undefined,
    inclusions: listFromText(text(formData, 'inclusions')),
    exclusions: listFromText(text(formData, 'exclusions'))
  });
  const service = createServiceRoleClient();
  const { data: request } = await service.from('custom_order_requests').select('*').eq('id', parsed.request_id).eq('seller_id', seller.id).single();
  if (!request) throw new Error('Request not found.');
  requireStatus(request.status, ['seller_reviewing', 'revision_requested']);
  const { data: existing } = await service.from('custom_order_quotes').select('*').eq('request_id', request.id).order('quote_version', { ascending: false });
  const nextVersion = existing?.length ? Number(existing[0].quote_version || 1) + 1 : 1;
  await service.from('custom_order_quotes').update({ status: 'superseded' }).eq('request_id', request.id).in('status', ['sent', 'revision_requested']);
  const { data: quote, error } = await service.from('custom_order_quotes').insert({ ...parsed, seller_id: seller.id, quote_version: nextVersion, status: 'sent' }).select('*').single();
  if (error) throw new Error(error.message);
  await transition(service, request, 'quote_sent', 'Quotation sent by artisan.', seller.user_id);
  await notify(service, request.buyer_id, 'Quotation received', `You received a quotation for ${request.request_number}.`, `/account/custom-orders/${request.id}`);
  return quote;
}

export async function reviseQuoteAsSeller(formData: FormData) {
  return createQuoteAsSeller(formData);
}

export async function acceptQuoteAsBuyer(id: string) {
  const user = await requireAuth();
  const service = createServiceRoleClient();
  const request = await getRequestForBuyer(service, id, user.id);
  requireStatus(request.status, ['quote_sent']);
  const quote = latestQuote(request);
  if (!quote || quote.status !== 'sent') throw new Error('No active quote is available.');
  await service.from('custom_order_quotes').update({ status: 'accepted', is_accepted: true, accepted_at: new Date().toISOString() }).eq('id', quote.id);
  await service.from('custom_order_payment_records').insert([
    { request_id: request.id, payment_type: 'deposit', amount: quote.deposit_amount, status: 'pending' },
    { request_id: request.id, payment_type: 'final_payment', amount: quote.final_amount, status: 'pending' }
  ]);
  await transition(service, request, 'quote_approved', 'Quotation accepted by buyer.', user.id);
  await notify(service, request.seller_profiles.user_id, 'Quotation accepted', `The buyer accepted your quotation for ${request.request_number}.`, `/seller/custom-requests/${request.id}`);
}

export async function declineQuoteAsBuyer(id: string) {
  const user = await requireAuth();
  const service = createServiceRoleClient();
  const request = await getRequestForBuyer(service, id, user.id);
  requireStatus(request.status, ['quote_sent']);
  const quote = latestQuote(request);
  if (quote) await service.from('custom_order_quotes').update({ status: 'declined', is_accepted: false, declined_at: new Date().toISOString() }).eq('id', quote.id);
  await transition(service, request, 'quote_declined', 'Quotation declined by buyer.', user.id);
}

export async function requestQuoteRevisionAsBuyer(id: string, note?: string) {
  const user = await requireAuth();
  const service = createServiceRoleClient();
  const request = await getRequestForBuyer(service, id, user.id);
  requireStatus(request.status, ['quote_sent']);
  const quote = latestQuote(request);
  if (quote) await service.from('custom_order_quotes').update({ status: 'revision_requested' }).eq('id', quote.id);
  await transition(service, request, 'revision_requested', note || 'Quote revision requested by buyer.', user.id);
  await notify(service, request.seller_profiles.user_id, 'Quote revision requested', `The buyer requested an updated quotation for ${request.request_number}.`, `/seller/custom-requests/${request.id}`);
}

export async function markDepositPaidAsAdminForTesting(id: string) {
  await requireAdmin();
  if (process.env.ENABLE_DEV_PAYMENT_SIMULATION !== 'true') throw new Error('Development payment simulation is disabled.');
  const service = createServiceRoleClient();
  const request = await getRequestById(service, id);
  requireStatus(request.status, ['quote_approved']);
  await service.from('custom_order_payment_records').update({ status: 'marked_paid', payment_reference: 'DEV-DEPOSIT', notes: 'Development-only payment confirmation.' }).eq('request_id', id).eq('payment_type', 'deposit');
  await transition(service, request, 'deposit_paid', 'Deposit marked paid by admin for testing.', null);
  await notify(service, request.seller_profiles.user_id, 'Deposit confirmed', `The deposit for ${request.request_number} has been confirmed.`, `/seller/custom-requests/${request.id}`);
}

export async function startCustomOrderProductionAsSeller(id: string) {
  const { request, seller, service } = await getSellerOwnedRequest(id);
  requireStatus(request.status, ['deposit_paid']);
  await transition(service, request, 'in_progress', 'Production started by artisan.', seller.user_id);
  await notify(service, request.buyer_id, 'Work has started', `The artisan started working on ${request.request_number}.`, `/account/custom-orders/${request.id}`);
}

export async function addMilestoneAsSeller(formData: FormData) {
  const seller = await requireApprovedSeller();
  const parsed = customOrderMilestoneSchema.parse({
    request_id: text(formData, 'request_id'),
    title: text(formData, 'title'),
    description: text(formData, 'description') || undefined,
    display_order: optionalNumber(formData, 'display_order') ?? 0,
    status: text(formData, 'status') || 'pending',
    is_visible_to_buyer: formData.get('is_visible_to_buyer') === 'on'
  });
  const service = createServiceRoleClient();
  const { data: request } = await service.from('custom_order_requests').select('*, seller_profiles(user_id)').eq('id', parsed.request_id).eq('seller_id', seller.id).single();
  if (!request) throw new Error('Request not found.');
  requireStatus(request.status, ['in_progress', 'final_payment_pending', 'fully_paid']);
  const { data: milestone, error } = await service.from('custom_order_milestones').insert({ ...parsed, created_by: seller.user_id }).select('*').single();
  if (error) throw new Error(error.message);
  const imagePaths = await uploadFiles(service, formData, 'milestone_files', 'custom-order-milestone-files', `${seller.id}/${request.id}`);
  if (imagePaths.length) await service.from('custom_order_milestones').update({ image_paths: imagePaths }).eq('id', milestone.id);
  if (parsed.is_visible_to_buyer) await notify(service, request.buyer_id, 'New project update', `There is a new milestone update for ${request.request_number}.`, `/account/custom-orders/${request.id}`);
  return milestone;
}

export async function updateMilestoneAsSeller(formData: FormData) {
  const seller = await requireApprovedSeller();
  const id = text(formData, 'milestone_id');
  const service = createServiceRoleClient();
  const { data: milestone } = await service.from('custom_order_milestones').select('*, custom_order_requests!inner(id, seller_id)').eq('id', id).single();
  if (!milestone || milestone.custom_order_requests.seller_id !== seller.id) throw new Error('Milestone not found.');
  const status = text(formData, 'status') || milestone.status;
  const { error } = await service.from('custom_order_milestones').update({
    title: text(formData, 'title') || milestone.title,
    description: text(formData, 'description') || milestone.description,
    display_order: optionalNumber(formData, 'display_order') ?? milestone.display_order,
    status,
    is_visible_to_buyer: formData.get('is_visible_to_buyer') === 'on',
    completed_at: status === 'completed' ? new Date().toISOString() : milestone.completed_at
  }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function markFinalPaymentPendingAsSeller(id: string) {
  const { request, seller, service } = await getSellerOwnedRequest(id);
  requireStatus(request.status, ['in_progress']);
  await transition(service, request, 'final_payment_pending', 'Final payment requested by artisan.', seller.user_id);
  await notify(service, request.buyer_id, 'Final payment pending', `The final payment for ${request.request_number} is ready for confirmation.`, `/account/custom-orders/${request.id}`);
}

export async function markFinalPaymentPaidAsAdminForTesting(id: string) {
  await requireAdmin();
  if (process.env.ENABLE_DEV_PAYMENT_SIMULATION !== 'true') throw new Error('Development payment simulation is disabled.');
  const service = createServiceRoleClient();
  const request = await getRequestById(service, id);
  requireStatus(request.status, ['final_payment_pending']);
  await service.from('custom_order_payment_records').update({ status: 'marked_paid', payment_reference: 'DEV-FINAL', notes: 'Development-only final payment confirmation.' }).eq('request_id', id).eq('payment_type', 'final_payment');
  await transition(service, request, 'fully_paid', 'Final payment marked paid by admin for testing.', null);
}

export async function markReadyForDeliveryAsSeller(id: string) {
  const { request, seller, service } = await getSellerOwnedRequest(id);
  requireStatus(request.status, ['fully_paid']);
  await transition(service, request, 'ready_for_delivery', 'Custom order marked ready for delivery.', seller.user_id);
  await notify(service, request.buyer_id, 'Custom order ready', `Your custom order ${request.request_number} is ready for delivery.`, `/account/custom-orders/${request.id}`);
}

export async function completeCustomOrderAsAdminOrSeller(id: string) {
  const user = await requireAuth();
  const service = createServiceRoleClient();
  const request = await getRequestById(service, id);
  const isSeller = request.seller_profiles?.user_id === user.id;
  const { data: profile } = await service.from('profiles').select('role').eq('id', user.id).single();
  if (!isSeller && profile?.role !== 'admin') throw new Error('Not allowed.');
  requireStatus(request.status, ['ready_for_delivery']);
  await transition(service, request, 'completed', 'Custom order completed.', user.id);
}

export async function cancelCustomOrder(id: string, note: string) {
  const user = await requireAuth();
  const service = createServiceRoleClient();
  const request = await getRequestById(service, id);
  const isBuyer = request.buyer_id === user.id;
  const isSeller = request.seller_profiles?.user_id === user.id;
  const { data: profile } = await service.from('profiles').select('role').eq('id', user.id).single();
  if (!isBuyer && !isSeller && profile?.role !== 'admin') throw new Error('Not allowed.');
  if (!note || note.length < 5) throw new Error('Cancellation note is required.');
  requireStatus(request.status, ['request_submitted', 'seller_reviewing', 'quote_sent', 'revision_requested', 'quote_approved']);
  await transition(service, request, 'cancelled', note, user.id);
}

export async function adminOverrideCustomOrderStatus(id: string, status: BespokeOrderStatus, note: string) {
  await requireAdmin();
  if (!note || note.length < 5) throw new Error('Override reason is required.');
  const service = createServiceRoleClient();
  const request = await getRequestById(service, id);
  await transition(service, request, status, note, null);
}

export async function getCustomOrderTimeline(id: string) {
  const service = createServiceRoleClient();
  const { data } = await service.from('custom_order_status_history').select('*').eq('request_id', id).order('created_at');
  return data || [];
}

async function getSellerOwnedRequest(id: string) {
  const seller = await requireApprovedSeller();
  const service = createServiceRoleClient();
  const { data: request, error } = await service.from('custom_order_requests').select('*, seller_profiles(store_name, store_slug, user_id)').eq('id', id).eq('seller_id', seller.id).single();
  if (error || !request) throw new Error('Request not found.');
  return { request, seller, service };
}

async function getRequestForBuyer(service: any, id: string, userId: string) {
  const { data, error } = await service.from('custom_order_requests').select(requestSelect).eq('id', id).eq('buyer_id', userId).single();
  if (error || !data) throw new Error('Request not found.');
  return normalizeRequest(data, 'buyer');
}

async function getRequestById(service: any, id: string) {
  const { data, error } = await service.from('custom_order_requests').select(requestSelect).eq('id', id).single();
  if (error || !data) throw new Error('Request not found.');
  return normalizeRequest(data, 'admin');
}

async function transition(service: any, request: any, status: BespokeOrderStatus, note: string, changedBy: string | null) {
  const { error } = await service.from('custom_order_requests').update({ status }).eq('id', request.id);
  if (error) throw new Error(error.message);
  await service.from('custom_order_status_history').insert({ request_id: request.id, status, note, changed_by: changedBy });
}

async function uploadFiles(service: any, formData: FormData, fieldName: string, bucket: string, folder: string) {
  const files = formData.getAll(fieldName).filter((item): item is File => typeof item === 'object' && item instanceof File && item.size > 0);
  const uploaded: any[] = [];
  for (const file of files) {
    if (!allowedFileTypes.has(file.type)) throw new Error('Only JPG, PNG, WEBP, PDF, MP4, WEBM, and MOV files are supported.');
    if (file.size > maxFileSize) throw new Error('Each file must be 50 MB or smaller.');
    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'file';
    const path = `${folder}/${randomUUID()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error } = await service.storage.from(bucket).upload(path, bytes, { contentType: file.type, upsert: false });
    if (error) throw new Error(error.message);
    uploaded.push({ name: file.name, size: file.size, type: file.type, storagePath: path, bucket });
  }
  return uploaded;
}

async function notify(service: any, userId: string | null | undefined, title: string, message: string, link: string) {
  if (!userId) return;
  await service.from('notifications').insert({ user_id: userId, title, message, link });
}

function requireStatus(current: string, allowed: string[]) {
  if (!allowed.includes(current)) throw new Error(`Invalid status transition from ${current}.`);
}

function normalizeRequest(request: any, viewer: 'buyer' | 'seller' | 'admin') {
  const quotes = [...(request.custom_order_quotes || [])].sort((a: any, b: any) => Number(b.quote_version || 0) - Number(a.quote_version || 0));
  const milestones = [...(request.custom_order_milestones || [])]
    .filter((item: any) => viewer !== 'buyer' || item.is_visible_to_buyer)
    .sort((a: any, b: any) => Number(a.display_order || 0) - Number(b.display_order || 0));
  const history = [...(request.custom_order_status_history || [])].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return { ...request, custom_order_quotes: quotes, custom_order_milestones: milestones, custom_order_status_history: history };
}

function latestQuote(request: any) {
  const quotes = request.custom_order_quotes || [];
  return quotes.find((quote: any) => ['sent', 'revision_requested'].includes(quote.status)) || quotes[0];
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) || '').trim();
}

function optionalNumber(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function listFromText(value: string) {
  return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

function linksFromText(value: string) {
  return listFromText(value).slice(0, 10);
}

export async function createCustomOrderQuote(values: Record<string, unknown>) {
  const supabase = await createClient();
  return supabase.from('custom_order_quotes').insert(values).select('*').single();
}

export function redirectToLogin(next: string): never {
  redirect(`/login?next=${encodeURIComponent(next)}`);
}
