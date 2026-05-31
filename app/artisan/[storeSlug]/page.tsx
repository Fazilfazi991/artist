import { notFound } from 'next/navigation';
import { StorefrontRenderer } from '@/components/storefront/storefront-renderer';
import { getStorefrontContext } from '@/lib/storefront/get-storefront-context';

export const dynamic = 'force-dynamic';

export default async function ArtisanStorefrontPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params;
  const context = await getStorefrontContext(storeSlug);
  if (!context) notFound();
  return <StorefrontRenderer context={context}/>;
}