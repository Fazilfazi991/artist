'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireApprovedSeller } from '@/lib/services/auth';
import { isValidSubdomain } from '@/lib/storefront/get-hostname';
import { STOREFRONT_TEMPLATES } from '@/lib/storefront/template-registry';

function text(formData: FormData, key: string) { return String(formData.get(key) || '').trim(); }
function fail(path: string, message: string) { redirect(`${path}?error=${encodeURIComponent(message)}`); }
function color(formData: FormData, key: string, fallback: string) {
  const value = text(formData, key) || fallback;
  return /^#[0-9A-Fa-f]{6}$/.test(value) ? value : fallback;
}
function choice(formData: FormData, key: string, allowed: string[], fallback: string) {
  const value = text(formData, key);
  return allowed.includes(value) ? value : fallback;
}
function revalidateStorefront(seller: any) {
  revalidatePath('/seller/storefront');
  revalidatePath('/seller/storefront/branding');
  revalidatePath('/seller/storefront/content');
  revalidatePath('/seller/storefront/template');
  revalidatePath('/seller/storefront/preview');
  revalidatePath(`/artisan/${seller.store_slug}`);
  revalidatePath(`/artisan/${seller.store_slug}/products`);
  revalidatePath(`/artisan/${seller.store_slug}/collections`);
}
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
  const { error } = await supabase.from('storefront_settings').update({ template_key: key, draft_updated_at: new Date().toISOString() }).eq('seller_id', seller.id);
  if (error) fail('/seller/storefront/template', error.message);
  revalidateStorefront(seller);
  redirect('/seller/storefront/template?saved=1');
}

export async function saveStorefrontBuilderAction(formData: FormData) {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  await ensureSettings(supabase, seller);
  const templateKey = text(formData, 'template_key') || 'warm-editorial';
  if (!STOREFRONT_TEMPLATES.some((template) => template.key === templateKey)) fail('/seller/storefront', 'Choose a valid template.');
  const customSubdomain = text(formData, 'custom_subdomain') || seller.store_slug;
  if (!isValidSubdomain(customSubdomain)) fail('/seller/storefront', 'Choose a valid non-reserved subdomain.');
  const now = new Date().toISOString();
  const payload: Record<string, any> = {
    template_key: templateKey,
    custom_subdomain: customSubdomain,
    announcement_text: text(formData, 'announcement_text') || null,
    accent_color: color(formData, 'accent_color', '#69296A'),
    secondary_color: color(formData, 'secondary_color', '#F38FA4'),
    background_color: color(formData, 'background_color', '#FFFFFF'),
    text_color: color(formData, 'text_color', '#241124'),
    button_style: choice(formData, 'button_style', ['rounded', 'pill', 'soft-square'], 'rounded'),
    font_pairing: choice(formData, 'font_pairing', ['friendly', 'editorial', 'minimal'], 'friendly'),
    hero_title: text(formData, 'hero_title') || seller.store_name,
    hero_subtitle: text(formData, 'hero_subtitle') || seller.short_bio || null,
    custom_orders_enabled: formData.get('custom_orders_enabled') === 'on',
    custom_order_cta_text: text(formData, 'custom_order_cta_text') || 'Request a custom piece',
    draft_updated_at: now
  };
  try {
    const logo = await uploadAsset(supabase, seller.id, formData.get('logo') as File | null, 'storefront-logos', 2);
    const hero = await uploadAsset(supabase, seller.id, formData.get('hero_image') as File | null, 'storefront-heroes', 5);
    if (logo) payload.logo_url = logo;
    if (hero) payload.hero_image_url = hero;
  } catch (error: any) { fail('/seller/storefront', error.message); }
  const { error } = await supabase.from('storefront_settings').update(payload).eq('seller_id', seller.id);
  if (error) fail('/seller/storefront', error.message);
  revalidateStorefront(seller);
  redirect('/seller/storefront?saved=1');
}

export async function saveBrandingAction(formData: FormData) {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  await ensureSettings(supabase, seller);
  const customSubdomain = text(formData, 'custom_subdomain') || seller.store_slug;
  if (!isValidSubdomain(customSubdomain)) fail('/seller/storefront/branding', 'Choose a valid non-reserved subdomain.');
  const payload: Record<string, any> = { custom_subdomain: customSubdomain, announcement_text: text(formData, 'announcement_text') || null, accent_color: color(formData, 'accent_color', '#69296A'), draft_updated_at: new Date().toISOString() };
  try {
    const logo = await uploadAsset(supabase, seller.id, formData.get('logo') as File | null, 'storefront-logos', 2);
    const hero = await uploadAsset(supabase, seller.id, formData.get('hero_image') as File | null, 'storefront-heroes', 5);
    if (logo) payload.logo_url = logo;
    if (hero) payload.hero_image_url = hero;
  } catch (error: any) { fail('/seller/storefront/branding', error.message); }
  const { error } = await supabase.from('storefront_settings').update(payload).eq('seller_id', seller.id);
  if (error) fail('/seller/storefront/branding', error.message);
  revalidateStorefront(seller);
  redirect('/seller/storefront/branding?saved=1');
}

export async function saveContentAction(formData: FormData) {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  await ensureSettings(supabase, seller);
  const { error } = await supabase.from('storefront_settings').update({ hero_title: text(formData, 'hero_title'), hero_subtitle: text(formData, 'hero_subtitle'), about_title: text(formData, 'about_title'), about_content: text(formData, 'about_content'), artisan_story: text(formData, 'artisan_story'), craft_process_content: text(formData, 'craft_process_content'), contact_email: text(formData, 'contact_email') || null, instagram_url: text(formData, 'instagram_url') || null, whatsapp_number: text(formData, 'whatsapp_number') || null, custom_orders_enabled: formData.get('custom_orders_enabled') === 'on', custom_order_cta_text: text(formData, 'custom_order_cta_text'), draft_updated_at: new Date().toISOString() }).eq('seller_id', seller.id);
  if (error) fail('/seller/storefront/content', error.message);
  await supabase.from('storefront_social_links').delete().eq('seller_id', seller.id);
  for (const [platform, url] of [['Instagram', text(formData, 'instagram_url')], ['WhatsApp', text(formData, 'whatsapp_number')]]) {
    if (url) await supabase.from('storefront_social_links').insert({ seller_id: seller.id, platform, url, display_order: platform === 'Instagram' ? 0 : 1 });
  }
  revalidateStorefront(seller);
  redirect('/seller/storefront/content?saved=1');
}

export async function savePoliciesAction(formData: FormData) {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  await ensureSettings(supabase, seller);
  const { error } = await supabase.from('storefront_settings').update({ shipping_policy: text(formData, 'shipping_policy'), return_policy: text(formData, 'return_policy'), production_timeline_note: text(formData, 'production_timeline_note'), custom_order_policy_note: text(formData, 'custom_order_policy_note'), draft_updated_at: new Date().toISOString() }).eq('seller_id', seller.id);
  if (error) fail('/seller/storefront/policies', error.message);
  revalidateStorefront(seller);
  redirect('/seller/storefront/policies?saved=1');
}

export async function publishStorefrontAction(formData: FormData) {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  await ensureSettings(supabase, seller);
  const publish = text(formData, 'publish') === 'true';
  await supabase.from('storefront_settings').update({ is_published: publish, published_at: publish ? new Date().toISOString() : null }).eq('seller_id', seller.id);
  revalidateStorefront(seller);
  redirect('/seller/storefront?saved=1');
}
