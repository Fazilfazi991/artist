'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireApprovedSeller } from '@/lib/services/auth';
import { isValidSubdomain } from '@/lib/storefront/get-hostname';
import { STOREFRONT_TEMPLATES } from '@/lib/storefront/template-registry';

function text(formData: FormData, key: string) { return String(formData.get(key) || '').trim(); }
function fail(path: string, message: string) { redirect(`${path}?error=${encodeURIComponent(message)}`); }
async function ensureSettings(supabase: any, seller: any) {
  const { data } = await supabase.from('storefront_settings').select('*').eq('seller_id', seller.id).maybeSingle();
  if (data) return data;
  const inserted = await supabase.from('storefront_settings').insert({ seller_id: seller.id, template_key: 'warm-editorial', custom_subdomain: seller.store_slug, hero_title: seller.store_name, hero_subtitle: seller.short_bio, is_published: false }).select('*').single();
  return inserted.data;
}
async function uploadAsset(supabase: any, sellerId: string, file: File | null, bucket: string, maxMb: number) {
  if (!file || file.size === 0) return null;
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Images must be JPG, PNG, or WebP.');
  if (file.size > maxMb * 1024 * 1024) throw new Error(`Image must be under ${maxMb} MB.`);
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
  const path = `${sellerId}/${Date.now()}-${safeName}`;
  const upload = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (upload.error) throw new Error(upload.error.message);
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function saveTemplateAction(formData: FormData) {
  const seller = await requireApprovedSeller();
  const key = text(formData, 'template_key');
  if (!STOREFRONT_TEMPLATES.some((template) => template.key === key)) fail('/seller/storefront/template', 'Choose a valid template.');
  const supabase = await createClient();
  await ensureSettings(supabase, seller);
  const { error } = await supabase.from('storefront_settings').update({ template_key: key }).eq('seller_id', seller.id);
  if (error) fail('/seller/storefront/template', error.message);
  revalidatePath('/seller/storefront');
  revalidatePath('/seller/storefront/template');
  revalidatePath('/seller/storefront/preview');
  revalidatePath(`/artisan/${seller.store_slug}`);
  revalidatePath(`/artisan/${seller.store_slug}/products`);
  revalidatePath(`/artisan/${seller.store_slug}/collections`);
  redirect('/seller/storefront/template?saved=1');
}

export async function saveBrandingAction(formData: FormData) {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  await ensureSettings(supabase, seller);
  const customSubdomain = text(formData, 'custom_subdomain') || seller.store_slug;
  if (!isValidSubdomain(customSubdomain)) fail('/seller/storefront/branding', 'Choose a valid non-reserved subdomain.');
  const payload: Record<string, any> = { custom_subdomain: customSubdomain, announcement_text: text(formData, 'announcement_text') || null, accent_color: text(formData, 'accent_color') || null };
  try {
    const logo = await uploadAsset(supabase, seller.id, formData.get('logo') as File | null, 'storefront-logos', 2);
    const hero = await uploadAsset(supabase, seller.id, formData.get('hero_image') as File | null, 'storefront-heroes', 5);
    if (logo) payload.logo_url = logo;
    if (hero) payload.hero_image_url = hero;
  } catch (error: any) { fail('/seller/storefront/branding', error.message); }
  const { error } = await supabase.from('storefront_settings').update(payload).eq('seller_id', seller.id);
  if (error) fail('/seller/storefront/branding', error.message);
  redirect('/seller/storefront/branding?saved=1');
}

export async function saveContentAction(formData: FormData) {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  await ensureSettings(supabase, seller);
  const { error } = await supabase.from('storefront_settings').update({ hero_title: text(formData, 'hero_title'), hero_subtitle: text(formData, 'hero_subtitle'), about_title: text(formData, 'about_title'), about_content: text(formData, 'about_content'), artisan_story: text(formData, 'artisan_story'), craft_process_content: text(formData, 'craft_process_content'), contact_email: text(formData, 'contact_email') || null, instagram_url: text(formData, 'instagram_url') || null, whatsapp_number: text(formData, 'whatsapp_number') || null, custom_orders_enabled: formData.get('custom_orders_enabled') === 'on', custom_order_cta_text: text(formData, 'custom_order_cta_text') }).eq('seller_id', seller.id);
  if (error) fail('/seller/storefront/content', error.message);
  await supabase.from('storefront_social_links').delete().eq('seller_id', seller.id);
  for (const [platform, url] of [['Instagram', text(formData, 'instagram_url')], ['WhatsApp', text(formData, 'whatsapp_number')]]) {
    if (url) await supabase.from('storefront_social_links').insert({ seller_id: seller.id, platform, url, display_order: platform === 'Instagram' ? 0 : 1 });
  }
  redirect('/seller/storefront/content?saved=1');
}

export async function savePoliciesAction(formData: FormData) {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  await ensureSettings(supabase, seller);
  const { error } = await supabase.from('storefront_settings').update({ shipping_policy: text(formData, 'shipping_policy'), return_policy: text(formData, 'return_policy'), production_timeline_note: text(formData, 'production_timeline_note'), custom_order_policy_note: text(formData, 'custom_order_policy_note') }).eq('seller_id', seller.id);
  if (error) fail('/seller/storefront/policies', error.message);
  redirect('/seller/storefront/policies?saved=1');
}

export async function publishStorefrontAction(formData: FormData) {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  await ensureSettings(supabase, seller);
  await supabase.from('storefront_settings').update({ is_published: text(formData, 'publish') === 'true' }).eq('seller_id', seller.id);
  revalidatePath(`/artisan/${seller.store_slug}`);
  redirect('/seller/storefront?saved=1');
}
