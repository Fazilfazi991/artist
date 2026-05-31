import { createClient } from '@/lib/supabase/server';
import type { StorefrontContext } from './storefront-types';

export async function getStorefrontContext(storeSlug: string, options: { preview?: boolean } = {}): Promise<StorefrontContext | null> {
  const supabase = await createClient();
  const sellerQuery = supabase.from('seller_profiles').select('*, profiles(*), categories(*)').eq('store_slug', storeSlug).eq('status', 'approved').single();
  const { data: seller, error } = await sellerQuery;
  if (error || !seller) return null;
  const [{ data: settings }, { data: products }, { data: collections }, { data: socialLinks }, { data: sections }] = await Promise.all([
    supabase.from('storefront_settings').select('*').eq('seller_id', seller.id).maybeSingle(),
    supabase.from('products').select('*, categories(*), product_images(*), product_variants(*), product_customization_fields(*)').eq('seller_id', seller.id).eq('status', 'active').order('is_featured', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('seller_collections').select('*, seller_collection_products(product_id, display_order)').eq('seller_id', seller.id).eq('is_active', true).order('display_order', { ascending: true }),
    supabase.from('storefront_social_links').select('*').eq('seller_id', seller.id).order('display_order', { ascending: true }),
    supabase.from('storefront_sections').select('*').eq('seller_id', seller.id).eq('is_visible', true).order('display_order', { ascending: true })
  ]);
  const defaultSettings = {
    template_key: 'warm-editorial',
    hero_title: seller.store_name,
    hero_subtitle: seller.short_bio,
    about_title: `About ${seller.store_name}`,
    about_content: seller.full_story || seller.short_bio,
    artisan_story: seller.full_story || seller.short_bio,
    craft_process_content: 'Each piece is made in small batches with careful materials and a patient process.',
    custom_orders_enabled: true,
    custom_order_cta_text: 'Request a custom piece',
    is_published: false
  };
  const mergedSettings = { ...defaultSettings, ...(settings || {}) };
  if (!options.preview && !mergedSettings.is_published) return null;
  return { seller, settings: mergedSettings, products: products || [], collections: collections || [], socialLinks: socialLinks || [], sections: sections || [], preview: options.preview };
}