import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StorefrontRenderer } from '@/components/storefront/storefront-renderer';
import { getStorefrontContext } from '@/lib/storefront/get-storefront-context';
import { publishStorefrontAction } from '../actions';
import { requireApprovedSeller } from '@/lib/services/auth';

export const dynamic = 'force-dynamic';

export default async function StorefrontPreviewPage() {
  const seller = await requireApprovedSeller();
  const context = await getStorefrontContext(seller.store_slug, { preview: true });
  if (!context) notFound();
  return <main><div className="sticky top-0 z-50 border-b border-line bg-gold/95 px-4 py-3 text-center font-black text-ink">This is your private storefront preview. Buyers cannot access unpublished changes. <Link href="/seller/storefront" className="ml-3 underline">Back to editor</Link><form action={publishStorefrontAction} className="ml-3 inline"><input type="hidden" name="publish" value={context.settings.is_published ? 'false' : 'true'}/><button className="underline">{context.settings.is_published ? 'Unpublish' : 'Publish storefront'}</button></form></div><StorefrontRenderer context={context}/></main>;
}