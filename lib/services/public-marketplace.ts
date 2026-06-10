import { categories as fallbackCategories, products as fallbackProducts, artisans as fallbackArtisans } from '@/lib/seed';
import type { Artisan, Category, Product } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

const isDev = process.env.NODE_ENV !== 'production';
const img = (value?: string | null) => value || '/artisan-hero.png';
const money = (value: number | null | undefined) => value == null ? 'Quote required' : `Rs. ${Number(value).toLocaleString('en-IN')}`;
const productType = (value: string): Product['type'] => value === 'ready_to_ship' ? 'ready' : value === 'customized' ? 'customized' : 'bespoke';

function fallback<T>(items: T[]): T[] { return isDev ? items : []; }

export function mapCategory(row: any): Category {
  return { slug: row.slug, name: row.name, description: row.description || '', accent: 'bg-rust', image: { src: img(row.image_url), alt: row.name, position: 'center' } };
}

export function mapArtisan(row: any): Artisan {
  const category = row.categories?.name || row.primary_category?.name || 'Handmade';
  return {
    storeSlug: row.store_slug,
    storeName: row.store_name,
    ownerName: row.profiles?.full_name || row.store_name,
    city: row.city || '',
    state: row.state || '',
    category,
    bio: row.short_bio || '',
    story: row.full_story || row.short_bio || '',
    quote: row.full_story || row.short_bio || '',
    process: `Average production timeline: ${row.average_production_days || 7} days`,
    materials: category,
    yearsExperience: row.years_experience || 0,
    rating: 4.8,
    reviews: 0,
    followers: 0,
    completedOrders: 0,
    status: row.status,
    avatar: { src: img(row.profile_image_url), alt: `${row.store_name} profile`, position: 'center' },
    cover: { src: img(row.cover_image_url), alt: `${row.store_name} cover`, position: 'center' }
  };
}

export function mapProduct(row: any): Product {
  const seller = row.seller_profiles;
  const primary = row.product_images?.[0];
  return {
    id: row.id,
    slug: row.slug,
    title: row.name,
    artisanSlug: seller?.store_slug || '',
    categorySlug: row.categories?.slug || '',
    type: productType(row.product_type),
    price: row.base_price == null ? null : Number(row.base_price),
    priceLabel: row.base_price == null ? 'Quote required' : money(row.base_price),
    description: row.short_description || row.description || '',
    story: row.description || row.short_description || '',
    materials: row.materials || 'Handmade materials',
    care: row.care_instructions || 'Care guide included with order.',
    timeline: row.product_type === 'ready_to_ship' ? `Dispatches in ${row.dispatch_days || 3} days` : row.product_type === 'customized' ? `Production in ${row.production_days || 7} days` : `Quote in ${row.production_days || 7} days`,
    occasion: 'Handmade gifting',
    customizable: Boolean(row.is_customizable),
    stock: row.stock_quantity,
    colors: ['#69296A', '#F38FA4'],
    features: [row.product_type, row.status, seller?.store_name].filter(Boolean),
    images: [{ src: img(primary?.image_url), alt: primary?.alt_text || row.name, position: 'center' }],
    rating: 4.8,
    reviewCount: 0
  };
}

const productSelect = '*, categories!products_category_id_fkey!inner(*), seller_profiles!inner(*, profiles!seller_profiles_user_id_fkey(*)), product_images(*), product_variants(*), product_customization_fields(*)';
const sellerSelect = '*, profiles!seller_profiles_user_id_fkey(*), categories!seller_primary_category_fk(*)';

export async function getFeaturedCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('categories').select('*').eq('is_active', true).order('display_order', { ascending: true }).order('name', { ascending: true }).limit(6);
  if (error) { console.error('getFeaturedCategories', error.message); return fallback(fallbackCategories); }
  return (data || []).map(mapCategory);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('products').select(productSelect).eq('status', 'active').eq('seller_profiles.status', 'approved').order('is_featured', { ascending: false }).order('created_at', { ascending: false }).limit(limit);
  if (error) { console.error('getFeaturedProducts', error.message); return fallback(fallbackProducts.slice(0, limit)); }
  return (data || []).map(mapProduct);
}

export async function getProducts(filters: { search?: string; category?: string; type?: string; sort?: string } = {}): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase.from('products').select(productSelect).eq('status', 'active').eq('seller_profiles.status', 'approved');
  if (filters.category && filters.category !== 'all') query = query.eq('categories.slug', filters.category);
  if (filters.type && filters.type !== 'all') query = query.eq('product_type', filters.type === 'ready' ? 'ready_to_ship' : filters.type);
  if (filters.search) query = query.or(`name.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`);
  if (filters.sort === 'price-asc') query = query.order('base_price', { ascending: true, nullsFirst: false });
  else if (filters.sort === 'price-desc') query = query.order('base_price', { ascending: false, nullsFirst: false });
  else query = query.order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error) { console.error('getProducts', error.message); return fallback(fallbackProducts); }
  return (data || []).map(mapProduct);
}

export async function getProductsByCategorySlug(slug: string): Promise<{ category: Category | null; products: Product[] }> {
  const categories = await getFeaturedCategories();
  const category = categories.find((item) => item.slug === slug) || null;
  const items = await getProducts({ category: slug });
  return { category, products: items };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('products').select(productSelect).eq('slug', slug).eq('status', 'active').eq('seller_profiles.status', 'approved').single();
  if (error) { console.error('getProductBySlug', error.message); return fallbackProducts.find((item) => item.slug === slug) || null; }
  return mapProduct(data);
}

export async function getFeaturedArtisans(limit = 3): Promise<Artisan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('seller_profiles').select(sellerSelect).eq('status', 'approved').order('created_at', { ascending: false }).limit(limit);
  if (error) { console.error('getFeaturedArtisans', error.message); return fallback(fallbackArtisans.slice(0, limit)); }
  return (data || []).map(mapArtisan);
}

export async function getApprovedArtisans(): Promise<Artisan[]> { return getFeaturedArtisans(50); }
export async function getArtisanStorefrontBySlug(storeSlug: string): Promise<Artisan | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('seller_profiles').select(sellerSelect).eq('store_slug', storeSlug).eq('status', 'approved').single();
  if (error) { console.error('getArtisanStorefrontBySlug', error.message); return fallbackArtisans.find((item) => item.storeSlug === storeSlug) || null; }
  return mapArtisan(data);
}
export async function getProductsByArtisanSlug(storeSlug: string): Promise<Product[]> { return getProducts({}).then((items) => items.filter((item) => item.artisanSlug === storeSlug)); }
export async function getRelatedProducts(productIdOrSlug: string, categorySlug: string, limit = 4): Promise<Product[]> { return getProducts({ category: categorySlug }).then((items) => items.filter((item) => item.slug !== productIdOrSlug).slice(0, limit)); }
