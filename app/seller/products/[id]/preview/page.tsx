import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, SectionHeading } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { requireApprovedSeller } from '@/lib/services/auth';

export const dynamic = 'force-dynamic';

export default async function ProductPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const seller = await requireApprovedSeller();
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('*, categories(*), product_images(*), product_variants(*), product_customization_fields(*)').eq('id', id).eq('seller_id', seller.id).single();
  if (!product) notFound();
  return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-5 rounded-lg border border-gold/30 bg-gold/10 p-4 font-bold">This is a private preview. Buyers cannot see this product yet.</div><SectionHeading eyebrow="Product preview" title={product.name} copy={product.short_description || 'Preview your product listing before review.'} action={<Link href={`/seller/products/${product.id}/edit`} className="rounded-lg border border-line px-5 py-3 font-black">Return to edit</Link>} /><div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]"><div className="grid gap-3 sm:grid-cols-2">{(product.product_images?.length ? product.product_images : [{ image_url: '/artisan-hero.png', id: 'fallback' }]).map((image: any) => <img key={image.id} src={image.image_url} alt={image.alt_text || product.name} className="aspect-square w-full rounded-xl border border-line object-cover"/>)}</div><section className="rounded-xl border border-line bg-white p-6"><Badge>{product.status}</Badge><h1 className="mt-4 font-serif text-4xl">{product.name}</h1><p className="mt-3 text-muted">{product.description || product.short_description}</p><p className="mt-5 text-3xl font-black">{product.base_price == null ? 'Quote required' : `Rs. ${Number(product.base_price).toLocaleString('en-IN')}`}</p><div className="mt-5 grid gap-2 text-sm text-muted"><span>Category: {product.categories?.name || 'No category'}</span><span>Type: {product.product_type}</span><span>Stock: {product.stock_quantity ?? 'N/A'}</span><span>Timeline: {product.production_days || product.dispatch_days || 0} days</span></div><h2 className="mt-6 font-black">Variants</h2><div className="mt-2 grid gap-2">{(product.product_variants || []).map((variant: any) => <p key={variant.id} className="rounded bg-paper p-2 text-sm">{variant.name}: {variant.value}</p>)}</div><h2 className="mt-6 font-black">Customization</h2><div className="mt-2 grid gap-2">{(product.product_customization_fields || []).map((field: any) => <p key={field.id} className="rounded bg-paper p-2 text-sm">{field.label} ({field.field_type})</p>)}</div></section></div></main>;
}