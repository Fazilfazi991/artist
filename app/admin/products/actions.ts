'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/services/auth';

function text(formData: FormData, key: string) { return String(formData.get(key) || '').trim(); }
async function updateProductStatus(productId: string, values: Record<string, unknown>) {
  const supabase = createAdminClient();
  let result = await supabase.from('products').update(values).eq('id', productId).select('*, seller_profiles(user_id)').single();
  if (result.error && /column .* does not exist/i.test(result.error.message)) {
    const fallback: Record<string, unknown> = { status: values.status };
    if ('rejection_reason' in values) fallback.rejection_reason = values.rejection_reason;
    result = await supabase.from('products').update(fallback).eq('id', productId).select('*, seller_profiles(user_id)').single();
  }
  return result;
}
async function notifySeller(product: any, title: string, body: string) {
  const userId = product?.seller_profiles?.user_id;
  if (!userId) return;
  const supabase = createAdminClient();
  await supabase.from('notifications').insert({ user_id: userId, title, body, link_url: `/seller/products/${product.id}/edit` });
}

export async function approveProductAction(formData: FormData) {
  const admin = await requireAdmin();
  const productId = text(formData, 'product_id');
  const { data: product, error } = await updateProductStatus(productId, { status: 'active', reviewed_by: admin.id, reviewed_at: new Date().toISOString(), rejection_reason: null });
  if (error) redirect(`/admin/products/${productId}?error=${encodeURIComponent(error.message)}`);
  await notifySeller(product, 'Product approved', `Your product '${product.name}' is now live in the marketplace.`);
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath('/shop');
  redirect(`/admin/products/${productId}?approved=1`);
}

export async function rejectProductAction(formData: FormData) {
  const admin = await requireAdmin();
  const productId = text(formData, 'product_id');
  const reason = text(formData, 'reason');
  if (!reason) redirect(`/admin/products/${productId}?error=Rejection reason is required`);
  const { data: product, error } = await updateProductStatus(productId, { status: 'rejected', rejection_reason: reason, reviewed_by: admin.id, reviewed_at: new Date().toISOString() });
  if (error) redirect(`/admin/products/${productId}?error=${encodeURIComponent(error.message)}`);
  await notifySeller(product, 'Product changes required', `Your product '${product.name}' needs updates before it can be published.`);
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${productId}`);
  redirect(`/admin/products/${productId}?rejected=1`);
}

export async function hideProductAction(formData: FormData) {
  await requireAdmin();
  const productId = text(formData, 'product_id');
  const { error } = await updateProductStatus(productId, { status: 'hidden' });
  if (error) redirect(`/admin/products/${productId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin/products');
  redirect(`/admin/products/${productId}?hidden=1`);
}

export async function archiveProductAsAdminAction(formData: FormData) {
  await requireAdmin();
  const productId = text(formData, 'product_id');
  const { error } = await updateProductStatus(productId, { status: 'archived' });
  if (error) redirect(`/admin/products/${productId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin/products');
  redirect('/admin/products?archived=1');
}