'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireApprovedSeller } from '@/lib/services/auth';

function text(formData: FormData, key: string) { return String(formData.get(key) || '').trim(); }
function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
function fail(path: string, message: string) { redirect(`${path}?error=${encodeURIComponent(message)}`); }

export async function saveCollectionAction(formData: FormData) {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  const id = text(formData, 'collection_id');
  const name = text(formData, 'name');
  const slug = slugify(text(formData, 'slug') || name);
  if (!name || !slug) fail(id ? `/seller/collections/${id}/edit` : '/seller/collections/new', 'Collection name is required.');
  const payload = { seller_id: seller.id, name, slug, description: text(formData, 'description') || null, is_featured: formData.get('is_featured') === 'on', is_active: formData.get('is_active') !== 'off' };
  const result = id ? await supabase.from('seller_collections').update(payload).eq('id', id).eq('seller_id', seller.id).select('*').single() : await supabase.from('seller_collections').insert(payload).select('*').single();
  if (result.error) fail(id ? `/seller/collections/${id}/edit` : '/seller/collections/new', result.error.message);
  const collectionId = result.data.id;
  await supabase.from('seller_collection_products').delete().eq('collection_id', collectionId);
  for (const productId of formData.getAll('product_ids').map(String)) {
    await supabase.from('seller_collection_products').insert({ collection_id: collectionId, product_id: productId });
  }
  revalidatePath('/seller/collections');
  redirect('/seller/collections?saved=1');
}

export async function deleteCollectionAction(formData: FormData) {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  const id = text(formData, 'collection_id');
  await supabase.from('seller_collections').delete().eq('id', id).eq('seller_id', seller.id);
  revalidatePath('/seller/collections');
  redirect('/seller/collections?deleted=1');
}