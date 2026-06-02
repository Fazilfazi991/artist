import { StorefrontDirectory } from '@/components/storefront-directory';
import { getPublishedStorefronts, getStorefrontDirectoryFilters } from '@/lib/services/storefront-directory';

export const dynamic = 'force-dynamic';

export default async function StorefrontsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const filters = {
    q: params.q,
    category: params.category,
    state: params.state,
    city: params.city,
    customOrders: params.customOrders,
    productType: params.productType,
    sort: params.sort || 'featured'
  };
  const [storefronts, filterOptions] = await Promise.all([
    getPublishedStorefronts(filters),
    getStorefrontDirectoryFilters()
  ]);
  return <StorefrontDirectory storefronts={storefronts} filterOptions={filterOptions} filters={filters} />;
}
