import { createClient } from '@/lib/supabase/server';

export async function createProductDraft(values: Record<string, unknown>) {
  const supabase = await createClient();
  return supabase.from('products').insert({ ...values, status: 'draft' }).select('*').single();
}

export async function updateProduct(productId: string, values: Record<string, unknown>) {
  const supabase = await createClient();
  return supabase.from('products').update(values).eq('id', productId).select('*').single();
}

export async function archiveProduct(productId: string) {
  return updateProduct(productId, { status: 'archived' });
}

export async function requestProductPublication(productId: string) {
  return updateProduct(productId, { status: 'pending_review' });
}

export async function listPublicProducts() {
  const supabase = await createClient();
  return supabase.from('products').select('*, seller_profiles(store_name, store_slug), categories(name, slug)').eq('status', 'active').order('created_at', { ascending: false });
}

export async function getPublicProductBySlug(slug: string) {
  const supabase = await createClient();
  return supabase.from('products').select('*, product_images(*), product_variants(*), product_customization_fields(*), seller_profiles(store_name, store_slug), categories(name, slug)').eq('slug', slug).eq('status', 'active').single();
}

export async function listProductsBySellerStorefront(storeSlug: string) {
  const supabase = await createClient();
  return supabase.from('products').select('*, seller_profiles!inner(store_slug, store_name)').eq('seller_profiles.store_slug', storeSlug).eq('status', 'active');
}
