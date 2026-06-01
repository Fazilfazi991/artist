import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdmin, requireAuth } from '@/lib/services/auth';
import type { ActorRole, StandardOrderStatus } from '@/lib/types/order-fulfilment';

const readyFlow: StandardOrderStatus[] = ['pending_payment','paid','seller_confirmed','ready_to_ship','dispatched','delivered','completed'];
const customFlow: StandardOrderStatus[] = ['pending_payment','paid','seller_confirmed','in_production','ready_to_ship','dispatched','delivered','completed'];
const timestampByStatus: Partial<Record<StandardOrderStatus, string>> = {
  seller_confirmed: 'seller_confirmed_at',
  in_production: 'production_started_at',
  ready_to_ship: 'ready_to_ship_at',
  dispatched: 'dispatched_at',
  delivered: 'delivered_at',
  completed: 'completed_at',
  cancelled: 'cancelled_at'
};

export function orderHasCustomizedProduct(order: any) {
  return (order.order_items || []).some((item: any) => item.product_snapshot?.product_type === 'customized');
}

export function getAllowedOrderTransitions(order: any, role: ActorRole): StandardOrderStatus[] {
  const current = order.status as StandardOrderStatus;
  const flow = orderHasCustomizedProduct(order) ? customFlow : readyFlow;
  if (role === 'admin') return ['paid','seller_confirmed','in_production','ready_to_ship','dispatched','delivered','completed','cancelled'];
  if (role === 'seller') {
    if (current === 'paid') return ['seller_confirmed'];
    if (current === 'seller_confirmed') return orderHasCustomizedProduct(order) ? ['in_production'] : ['ready_to_ship'];
    if (current === 'in_production') return ['ready_to_ship'];
    if (current === 'ready_to_ship') return ['dispatched'];
  }
  if (role === 'buyer' && current === 'dispatched') return ['delivered'];
  const index = flow.indexOf(current);
  return index >= 0 ? flow.slice(index + 1, index + 2) : [];
}

export function validateOrderTransition(order: any, nextStatus: StandardOrderStatus, role: ActorRole) {
  if (!getAllowedOrderTransitions(order, role).includes(nextStatus)) {
    throw new Error(`Cannot move order from ${order.status} to ${nextStatus}.`);
  }
}

export async function getOrderTimeline(orderId: string) {
  const service = createServiceRoleClient();
  const [{ data: history }, { data: updates }, { data: issues }] = await Promise.all([
    service.from('order_status_history').select('*, profiles(full_name,email)').eq('order_id', orderId).order('created_at'),
    service.from('order_progress_updates').select('*').eq('order_id', orderId).order('created_at'),
    service.from('order_issues').select('*').eq('order_id', orderId).order('created_at')
  ]);
  return { history: history || [], updates: updates || [], issues: issues || [] };
}

export async function updateOrderStatus(args: { orderId: string; nextStatus: StandardOrderStatus; actorId: string; role: ActorRole; note: string; values?: Record<string, unknown> }) {
  const service = createServiceRoleClient();
  const { data: order, error } = await service.from('orders').select('*, order_items(*)').eq('id', args.orderId).single();
  if (error || !order) throw new Error('Order not found.');
  validateOrderTransition(order, args.nextStatus, args.role);
  const payload: Record<string, unknown> = { status: args.nextStatus, ...(args.values || {}) };
  const stamp = timestampByStatus[args.nextStatus];
  if (stamp) payload[stamp] = new Date().toISOString();
  const { data: updated, error: updateError } = await service.from('orders').update(payload).eq('id', args.orderId).select('*, seller_profiles(user_id, store_name), profiles!orders_buyer_id_fkey(email, full_name)').single();
  if (updateError) throw new Error(updateError.message);
  const { data: latestHistory } = await service.from('order_status_history').select('id').eq('order_id', args.orderId).eq('status', args.nextStatus).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (latestHistory?.id) {
    await service.from('order_status_history').update({ note: args.note, changed_by: args.actorId }).eq('id', latestHistory.id);
  } else {
    await service.from('order_status_history').insert({ order_id: args.orderId, status: args.nextStatus, note: args.note, changed_by: args.actorId });
  }
  return updated;
}

export async function simulateOrderPaidAsAdmin(orderId: string) {
  const admin = await requireAdmin();
  if (process.env.ENABLE_DEV_PAYMENT_SIMULATION !== 'true') throw new Error('Development payment simulation is disabled.');
  const order = await updateOrderStatus({
    orderId,
    nextStatus: 'paid',
    actorId: admin.id,
    role: 'admin',
    note: 'Payment marked as paid using development simulation.',
    values: { payment_reference: `DEV-SIMULATED-${Date.now()}` }
  });
  await notifyOrderParticipants(order, 'Payment confirmed', `Your payment for order ${order.order_number} has been confirmed.`, 'New paid order', `You have a new order ready for confirmation: ${order.order_number}.`);
  return order;
}

export async function confirmOrderAsSeller(orderId: string) {
  const { user, seller, order } = await requireSellerOrder(orderId);
  const updated = await updateOrderStatus({ orderId, nextStatus: 'seller_confirmed', actorId: user.id, role: 'seller', note: 'Order confirmed by seller.' });
  await notifyBuyer(updated, 'Order confirmed', `Your order ${updated.order_number} has been confirmed by the artisan.`);
  return { seller, order: updated };
}

export async function startProductionAsSeller(orderId: string) {
  const { user } = await requireSellerOrder(orderId);
  const updated = await updateOrderStatus({ orderId, nextStatus: 'in_production', actorId: user.id, role: 'seller', note: 'Production started by seller.' });
  await notifyBuyer(updated, 'Production started', `Work has started on your customized order ${updated.order_number}.`);
  return updated;
}

export async function markReadyToShipAsSeller(orderId: string) {
  const { user } = await requireSellerOrder(orderId);
  const updated = await updateOrderStatus({ orderId, nextStatus: 'ready_to_ship', actorId: user.id, role: 'seller', note: 'Marked ready to ship by seller.' });
  await notifyBuyer(updated, 'Ready to ship', `Your order ${updated.order_number} is ready for dispatch.`);
  return updated;
}

export async function dispatchOrderAsSeller(orderId: string, values: { courierName: string; trackingNumber: string; trackingUrl?: string }) {
  const { user } = await requireSellerOrder(orderId);
  if (!values.courierName || !values.trackingNumber) throw new Error('Courier and tracking number are required.');
  const updated = await updateOrderStatus({
    orderId,
    nextStatus: 'dispatched',
    actorId: user.id,
    role: 'seller',
    note: 'Dispatched through courier.',
    values: { courier_name: values.courierName, tracking_number: values.trackingNumber, tracking_url: values.trackingUrl || null }
  });
  await notifyBuyer(updated, 'Order dispatched', `Your order ${updated.order_number} has been dispatched.`);
  return updated;
}

export async function markDeliveredAsBuyer(orderId: string) {
  const { user, order } = await requireBuyerOrder(orderId);
  const updated = await updateOrderStatus({
    orderId,
    nextStatus: 'delivered',
    actorId: user.id,
    role: 'buyer',
    note: 'Delivery confirmed by buyer.',
    values: { buyer_delivery_confirmed_at: new Date().toISOString() }
  });
  await notifySeller(updated, 'Delivery confirmed', `The buyer confirmed delivery for order ${updated.order_number}.`);
  return updated;
}

export async function completeOrderAsAdminOrSystem(orderId: string) {
  const admin = await requireAdmin();
  return updateOrderStatus({ orderId, nextStatus: 'completed', actorId: admin.id, role: 'admin', note: 'Order marked completed by admin.' });
}

export async function overrideOrderStatusAsAdmin(orderId: string, status: StandardOrderStatus, reason: string) {
  const admin = await requireAdmin();
  return updateOrderStatus({ orderId, nextStatus: status, actorId: admin.id, role: 'admin', note: `Status overridden by admin: ${reason}` });
}

export async function createOrderProgressUpdate(formData: FormData) {
  const { user, seller, order } = await requireSellerOrder(String(formData.get('order_id') || ''));
  const service = createServiceRoleClient();
  const title = String(formData.get('title') || '').trim();
  if (title.length < 3) throw new Error('Progress title is required.');
  const files = formData.getAll('files').filter((item): item is File => item instanceof File && item.size > 0).slice(0, 6);
  const imagePaths = await uploadFiles('order-progress-files', `${seller.id}/${order.id}`, files);
  const { data, error } = await service.from('order_progress_updates').insert({
    order_id: order.id,
    seller_id: seller.id,
    title,
    message: String(formData.get('message') || '').trim() || null,
    image_paths: imagePaths,
    is_visible_to_buyer: formData.get('is_visible_to_buyer') === 'on',
    created_by: user.id
  }).select('*').single();
  if (error) throw new Error(error.message);
  if (data.is_visible_to_buyer) await notifyBuyer(order, 'New order update', `There is a new update for your order ${order.order_number}.`);
  return data;
}

export async function createOrderIssue(formData: FormData) {
  const { user, order } = await requireBuyerOrder(String(formData.get('order_id') || ''));
  const service = createServiceRoleClient();
  const files = formData.getAll('files').filter((item): item is File => item instanceof File && item.size > 0).slice(0, 6);
  const imagePaths = await uploadFiles('order-issue-files', `${user.id}/${order.id}`, files);
  const { data, error } = await service.from('order_issues').insert({
    order_id: order.id,
    reported_by: user.id,
    issue_type: String(formData.get('issue_type') || 'other'),
    subject: String(formData.get('subject') || '').trim(),
    description: String(formData.get('description') || '').trim(),
    image_paths: imagePaths
  }).select('*').single();
  if (error) throw new Error(error.message);
  await service.from('orders').update({ issue_reported_at: new Date().toISOString() }).eq('id', order.id).is('issue_reported_at', null);
  await notifySeller(order, 'Issue reported', `An issue was reported for order ${order.order_number}.`);
  await notifyAdmins('Issue reported', `An issue was reported for order ${order.order_number}.`, `/admin/orders/${order.id}`);
  return data;
}

export async function requireSellerOrder(orderId: string) {
  const user = await requireAuth();
  const service = createServiceRoleClient();
  const { data: seller } = await service.from('seller_profiles').select('*').eq('user_id', user.id).eq('status', 'approved').single();
  if (!seller) throw new Error('Seller profile not found.');
  const { data: order } = await service.from('orders').select('*, order_items(*), seller_profiles(user_id, store_name), profiles!orders_buyer_id_fkey(email, full_name)').eq('id', orderId).eq('seller_id', seller.id).single();
  if (!order) throw new Error('Order not found.');
  return { user, seller, order };
}

export async function requireBuyerOrder(orderId: string) {
  const user = await requireAuth();
  const service = createServiceRoleClient();
  const { data: order } = await service.from('orders').select('*, order_items(*), seller_profiles(user_id, store_name, store_slug)').eq('id', orderId).eq('buyer_id', user.id).single();
  if (!order) throw new Error('Order not found.');
  return { user, order };
}

async function uploadFiles(bucket: string, folder: string, files: File[]) {
  const service = createServiceRoleClient();
  const paths: string[] = [];
  for (const file of files) {
    if (!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)) throw new Error('Files must be JPG, PNG, WEBP, or PDF.');
    if (file.size > 5 * 1024 * 1024) throw new Error('Files must be under 5 MB.');
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
    const path = `${folder}/${Date.now()}-${safeName}`;
    const { error } = await service.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type });
    if (error) throw new Error(error.message);
    paths.push(path);
  }
  return paths;
}

async function notifyBuyer(order: any, title: string, message: string) {
  const service = createServiceRoleClient();
  await service.from('notifications').insert({ user_id: order.buyer_id, title, message, link: `/account/orders/${order.id}` });
}

async function notifySeller(order: any, title: string, message: string) {
  const sellerUserId = order.seller_profiles?.user_id;
  if (!sellerUserId) return;
  const service = createServiceRoleClient();
  await service.from('notifications').insert({ user_id: sellerUserId, title, message, link: `/seller/orders/${order.id}` });
}

async function notifyOrderParticipants(order: any, buyerTitle: string, buyerMessage: string, sellerTitle: string, sellerMessage: string) {
  await Promise.all([notifyBuyer(order, buyerTitle, buyerMessage), notifySeller(order, sellerTitle, sellerMessage)]);
}

async function notifyAdmins(title: string, message: string, link: string) {
  const service = createServiceRoleClient();
  const { data: admins } = await service.from('profiles').select('id').eq('role', 'admin');
  if (admins?.length) await service.from('notifications').insert(admins.map((admin: any) => ({ user_id: admin.id, title, message, link })));
}
