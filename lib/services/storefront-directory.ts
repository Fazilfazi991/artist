import { createServiceRoleClient } from '@/lib/supabase/server';

export type StorefrontDirectoryFilters = {
  q?: string;
  category?: string;
  state?: string;
  city?: string;
  customOrders?: string;
  productType?: string;
  sort?: string;
};

export type StorefrontCard = {
  sellerId: string;
  storeSlug: string;
  storeName: string;
  artisanName: string;
  city: string;
  state: string;
  category: string;
  categorySlug: string;
  shortBio: string;
  coverImage: string;
  logoImage: string;
  heroTitle: string;
  customOrdersEnabled: boolean;
  customOrderCtaText: string;
  productCount: number;
  collectionCount: number;
  supportsReadyToShip: boolean;
  supportsCustomized: boolean;
  supportsBespoke: boolean;
  createdAt: string;
};

export type StorefrontFilterOptions = {
  categories: { slug: string; name: string }[];
  states: string[];
  cities: string[];
};

const image = (value?: string | null) => value || '/artisan-hero.png';

function text(value: unknown) {
  return String(value || '').trim().toLowerCase();
}

function matchesSearch(storefront: StorefrontCard, query?: string) {
  const needle = text(query);
  if (!needle) return true;
  return [
    storefront.storeName,
    storefront.artisanName,
    storefront.city,
    storefront.state,
    storefront.category,
    storefront.shortBio
  ].some((value) => text(value).includes(needle));
}

function matchesProductType(storefront: StorefrontCard, productType?: string) {
  if (!productType || productType === 'all') return true;
  if (productType === 'ready') return storefront.supportsReadyToShip;
  if (productType === 'customized') return storefront.supportsCustomized;
  if (productType === 'bespoke') return storefront.supportsBespoke;
  return true;
}

async function getPublishedRows() {
  const supabase = createServiceRoleClient();
  const { data: settings, error } = await supabase
    .from('storefront_settings')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getPublishedStorefronts', error.message);
    return [];
  }

  const sellerIds = [...new Set((settings || []).map((row: any) => row.seller_id).filter(Boolean))];
  if (!sellerIds.length) return [];

  const [{ data: sellers }, { data: products }, { data: collections }] = await Promise.all([
    supabase
      .from('seller_profiles')
      .select('*, profiles!seller_profiles_user_id_fkey(full_name,email), categories!seller_primary_category_fk(name,slug)')
      .in('id', sellerIds)
      .eq('status', 'approved'),
    supabase
      .from('products')
      .select('id,seller_id,product_type,status')
      .in('seller_id', sellerIds)
      .eq('status', 'active'),
    supabase
      .from('seller_collections')
      .select('id,seller_id,is_active')
      .in('seller_id', sellerIds)
      .eq('is_active', true)
  ]);

  const sellerById = new Map((sellers || []).map((seller: any) => [seller.id, seller]));
  const productCounts = new Map<string, number>();
  const collectionCounts = new Map<string, number>();
  for (const product of products || []) productCounts.set(product.seller_id, (productCounts.get(product.seller_id) || 0) + 1);
  for (const collection of collections || []) collectionCounts.set(collection.seller_id, (collectionCounts.get(collection.seller_id) || 0) + 1);

  return (settings || [])
    .map((setting: any): StorefrontCard | null => {
      const seller: any = sellerById.get(setting.seller_id);
      if (!seller) return null;
      return {
        sellerId: seller.id,
        storeSlug: seller.store_slug,
        storeName: seller.store_name,
        artisanName: seller.profiles?.full_name || seller.store_name,
        city: seller.city || '',
        state: seller.state || '',
        category: seller.categories?.name || 'Handmade',
        categorySlug: seller.categories?.slug || '',
        shortBio: seller.short_bio || setting.hero_subtitle || '',
        coverImage: image(setting.hero_image_url || seller.cover_image_url),
        logoImage: image(setting.logo_url || seller.profile_image_url),
        heroTitle: setting.hero_title || seller.store_name,
        customOrdersEnabled: setting.custom_orders_enabled !== false && Boolean(seller.supports_bespoke || seller.supports_customized),
        customOrderCtaText: setting.custom_order_cta_text || 'Request Custom Order',
        productCount: productCounts.get(seller.id) || 0,
        collectionCount: collectionCounts.get(seller.id) || 0,
        supportsReadyToShip: Boolean(seller.supports_ready_to_ship),
        supportsCustomized: Boolean(seller.supports_customized),
        supportsBespoke: Boolean(seller.supports_bespoke),
        createdAt: setting.created_at || seller.created_at || ''
      };
    })
    .filter(Boolean) as StorefrontCard[];
}

export async function getPublishedStorefronts(filters: StorefrontDirectoryFilters = {}) {
  let storefronts = await getPublishedRows();
  storefronts = storefronts.filter((storefront) => {
    if (!matchesSearch(storefront, filters.q)) return false;
    if (filters.category && filters.category !== 'all' && storefront.categorySlug !== filters.category) return false;
    if (filters.state && filters.state !== 'all' && storefront.state !== filters.state) return false;
    if (filters.city && filters.city !== 'all' && storefront.city !== filters.city) return false;
    if (filters.customOrders === 'yes' && !storefront.customOrdersEnabled) return false;
    if (!matchesProductType(storefront, filters.productType)) return false;
    return true;
  });

  if (filters.sort === 'alphabetical') storefronts.sort((a, b) => a.storeName.localeCompare(b.storeName));
  else if (filters.sort === 'newest') storefronts.sort((a, b) => text(b.createdAt).localeCompare(text(a.createdAt)));
  else storefronts.sort((a, b) => (b.productCount + b.collectionCount) - (a.productCount + a.collectionCount) || a.storeName.localeCompare(b.storeName));

  return storefronts;
}

export async function getFeaturedStorefronts(limit = 4) {
  const storefronts = await getPublishedStorefronts({ sort: 'featured' });
  return storefronts.slice(0, limit);
}

export async function getStorefrontDirectoryFilters(): Promise<StorefrontFilterOptions> {
  const storefronts = await getPublishedRows();
  const categoryMap = new Map<string, string>();
  const states = new Set<string>();
  const cities = new Set<string>();
  for (const storefront of storefronts) {
    if (storefront.categorySlug) categoryMap.set(storefront.categorySlug, storefront.category);
    if (storefront.state) states.add(storefront.state);
    if (storefront.city) cities.add(storefront.city);
  }
  return {
    categories: [...categoryMap.entries()].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name)),
    states: [...states].sort(),
    cities: [...cities].sort()
  };
}

export async function getPublishedStorefrontBySlug(storeSlug: string) {
  const storefronts = await getPublishedStorefronts();
  return storefronts.find((storefront) => storefront.storeSlug === storeSlug) || null;
}
