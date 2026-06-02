import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StorefrontRenderer } from '@/components/storefront/storefront-renderer';
import { getStorefrontContext } from '@/lib/storefront/get-storefront-context';
import { STOREFRONT_TEMPLATES } from '@/lib/storefront/template-registry';
import { publishStorefrontAction } from '../actions';
import { requireApprovedSeller } from '@/lib/services/auth';

export const dynamic = 'force-dynamic';

export default async function StorefrontPreviewPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const params = await searchParams;
  const seller = await requireApprovedSeller();
  const context = await getStorefrontContext(seller.store_slug, { preview: true });
  if (!context) notFound();
  const previewTemplate = STOREFRONT_TEMPLATES.some((template) => template.key === params.template) ? params.template : null;
  const renderedContext = previewTemplate ? { ...context, settings: { ...context.settings, template_key: previewTemplate } } : context;
  return <main><div className="sticky top-0 z-50 border-b border-line bg-gold/95 px-4 py-3 text-center font-black text-ink">This is your private storefront preview. Buyers cannot access unpublished changes. <Link href="/seller/storefront" className="ml-3 underline">Back to editor</Link><form action={publishStorefrontAction} className="ml-3 inline"><input type="hidden" name="publish" value={context.settings.is_published ? 'false' : 'true'}/><button className="underline">{context.settings.is_published ? 'Unpublish' : 'Publish storefront'}</button></form></div><StorefrontRenderer context={renderedContext}/></main>;
}
