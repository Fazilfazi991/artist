'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireApprovedSeller } from '@/lib/services/auth';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const productInput = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).max(100).regex(slugPattern),
  category_id: z.string().uuid(),
  product_type: z.enum(['ready_to_ship', 'customized', 'bespoke']),
  short_description: z.string().max(240).optional(),
  description: z.string().optional(),
  base_price: z.number().min(0).nullable(),
  compare_at_price: z.number().min(0).nullable(),
  stock_quantity: z.number().int().min(0).nullable(),
  sku: z.string().optional(),
  dispatch_days: z.number().int().min(0).nullable(),
  production_days: z.number().int().min(0).nullable(),
  shipping_fee: z.number().min(0),
  materials: z.string().optional(),
  care_instructions: z.string().optional(),
  is_customizable: z.boolean()
}).superRefine((value, ctx) => {
  if (value.product_type === 'ready_to_ship' && value.stock_quantity == null) ctx.addIssue({ code: 'custom', path: ['stock_quantity'], message: 'Ready-to-ship products require stock.' });
  if (value.product_type === 'ready_to_ship' && value.dispatch_days == null) ctx.addIssue({ code: 'custom', path: ['dispatch_days'], message: 'Ready-to-ship products require dispatch days.' });
  if (value.product_type === 'customized' && value.production_days == null) ctx.addIssue({ code: 'custom', path: ['production_days'], message: 'Customized products require production days.' });
  if (value.product_type !== 'bespoke' && value.base_price == null) ctx.addIssue({ code: 'custom', path: ['base_price'], message: 'Base price is required.' });
});

function text(formData: FormData, key: string) { return String(formData.get(key) || '').trim(); }
function numberOrNull(formData: FormData, key: string) { const value = text(formData, key); return value === '' ? null : Number(value); }
function fail(path: string, message: string) { redirect(`${path}?error=${encodeURIComponent(message)}`); }
function productPath(productId?: string) { return productId ? `/seller/products/${productId}/edit` : '/seller/products/new'; }
function parseInput(formData: FormData) {
  return productInput.parse({
    name: text(formData, 'name'),
    slug: text(formData, 'slug'),
    category_id: text(formData, 'category_id'),
    product_type: text(formData, 'product_type'),
    short_description: text(formData, 'short_description') || undefined,
    description: text(formData, 'description') || undefined,
    base_price: numberOrNull(formData, 'base_price'),
    compare_at_price: numberOrNull(formData, 'compare_at_price'),
    stock_quantity: numberOrNull(formData, 'stock_quantity'),
    sku: text(formData, 'sku') || undefined,
    dispatch_days: numberOrNull(formData, 'dispatch_days'),
    production_days: numberOrNull(formData, 'production_days'),
    shipping_fee: Number(text(formData, 'shipping_fee') || 0),
    materials: text(formData, 'materials') || undefined,
    care_instructions: text(formData, 'care_instructions') || undefined,
    is_customizable: formData.get('is_customizable') === 'on'
  });
}
function parseVariantRows(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const [name = '', variantValue = '', price = '0', stock = ''] = line.split('|').map((part) => part.trim());
    return { name, value: variantValue, price_adjustment: Number(price || 0), stock_quantity: stock === '' ? null : Number(stock) };
  }).filter((row) => row.name && row.value);
}
function parseCustomizationRows(value: string) {
  const allowed = new Set(['text','textarea','select','color','date','file','number']);
  return value.split(/\r?\n/).map((line, index) => line.trim()).filter(Boolean).map((line, index) => {
    const [label = '', type = 'text', required = 'false', options = '', placeholder = ''] = line.split('|').map((part) => part.trim());
    const fieldType = allowed.has(type) ? type : 'text';
    return { label, field_type: fieldType, is_required: ['true','yes','required','1'].includes(required.toLowerCase()), options: options ? options.split(',').map((item) => item.trim()).filter(Boolean) : null, placeholder: placeholder || null, display_order: index };
  }).filter((row) => row.label);
}
async function assertOwnProduct(supabase: any, sellerId: string, productId: string) {
  const { data: product } = await supabase.from('products').select('*').eq('id', productId).eq('seller_id', sellerId).single();
  if (!product) redirect('/seller/products?error=Product not found');
  return product;
}
async function syncProductChildren(supabase: any, productId: string, formData: FormData) {
  const variants = parseVariantRows(text(formData, 'variants'));
  await supabase.from('product_variants').delete().eq('product_id', productId);
  if (variants.length) await supabase.from('product_variants').insert(variants.map((row) => ({ ...row, product_id: productId })));

  const fields = parseCustomizationRows(text(formData, 'customization_fields'));
  await supabase.from('product_customization_fields').delete().eq('product_id', productId);
  if (fields.length) await supabase.from('product_customization_fields').insert(fields.map((row) => ({ ...row, product_id: productId })));
}
async function uploadImages(supabase: any, sellerId: string, productId: string, formData: FormData) {
  const files = formData.getAll('images').filter((item): item is File => item instanceof File && item.size > 0).slice(0, 8);
  let order = 0;
  for (const file of files) {
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) fail(`/seller/products/${productId}/edit`, 'Images must be JPG, PNG, or WebP.');
    if (file.size > 5 * 1024 * 1024) fail(`/seller/products/${productId}/edit`, 'Each image must be under 5 MB.');
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
    const path = `${sellerId}/${productId}/${Date.now()}-${order}-${safeName}`;
    const upload = await supabase.storage.from('product-images').upload(path, file, { upsert: false });
    if (upload.error) fail(`/seller/products/${productId}/edit`, upload.error.message);
    const { data: publicUrl } = supabase.storage.from('product-images').getPublicUrl(path);
    await supabase.from('product_images').insert({ product_id: productId, image_url: publicUrl.publicUrl, alt_text: text(formData, 'image_alt') || safeName, display_order: order, is_primary: order === 0 });
    order += 1;
  }
}

export async function saveProductAction(formData: FormData) {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  const productId = text(formData, 'product_id');
  const intent = text(formData, 'intent') || 'draft';
  let parsed;
  try { parsed = parseInput(formData); } catch (error: any) { fail(productPath(productId), error.errors?.[0]?.message || 'Check product details.'); }

  const status = intent === 'submit' ? 'pending_review' : 'draft';
  const payload = { ...parsed, seller_id: seller.id, status };
  let product;
  if (productId) {
    const existing = await assertOwnProduct(supabase, seller.id, productId);
    if (existing.status === 'pending_review') fail(productPath(productId), 'Pending-review products are read-only.');
    const nextStatus = intent === 'submit' || existing.status === 'active' ? 'pending_review' : status;
    const { data, error } = await supabase.from('products').update({ ...payload, status: nextStatus }).eq('id', productId).select('*').single();
    if (error) fail(productPath(productId), error.message);
    product = data;
  } else {
    const { data, error } = await supabase.from('products').insert(payload).select('*').single();
    if (error) fail('/seller/products/new', error.message);
    product = data;
  }
  await syncProductChildren(supabase, product.id, formData);
  await uploadImages(supabase, seller.id, product.id, formData);
  revalidatePath('/seller/products');
  revalidatePath(`/seller/products/${product.id}/edit`);
  if (intent === 'preview') redirect(`/seller/products/${product.id}/preview`);
  redirect(intent === 'submit' ? '/seller/products?submitted=1' : `/seller/products/${product.id}/edit?saved=1`);
}

export async function submitProductForReviewAction(formData: FormData) {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  const productId = text(formData, 'product_id');
  await assertOwnProduct(supabase, seller.id, productId);
  const { error } = await supabase.from('products').update({ status: 'pending_review' }).eq('id', productId);
  if (error) redirect(`/seller/products?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/seller/products');
  redirect('/seller/products?submitted=1');
}

export async function archiveProductAction(formData: FormData) {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  const productId = text(formData, 'product_id');
  await assertOwnProduct(supabase, seller.id, productId);
  await supabase.from('products').update({ status: 'archived' }).eq('id', productId);
  revalidatePath('/seller/products');
  redirect('/seller/products?archived=1');
}

export async function deleteProductImageAction(formData: FormData) {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  const productId = text(formData, 'product_id');
  const imageId = text(formData, 'image_id');
  await assertOwnProduct(supabase, seller.id, productId);
  await supabase.from('product_images').delete().eq('id', imageId).eq('product_id', productId);
  revalidatePath(`/seller/products/${productId}/edit`);
}