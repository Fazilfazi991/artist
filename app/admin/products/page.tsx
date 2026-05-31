import Link from 'next/link';
import { SectionHeading, Badge } from '@/components/ui';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/services/auth';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const status = params.status || 'pending_review';
  const supabase = createAdminClient();
  let query = supabase.from('products').select('*, categories(name), seller_profiles(store_name, store_slug), product_images(*)').order('updated_at', { ascending: false });
  if (status !== 'all') query = query.eq('status', status);
  if (params.q) query = query.ilike('name', `%${params.q}%`);
  const { data: products } = await query;
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><SectionHeading eyebrow="Admin" title="Product moderation" copy="Review seller submissions before they become visible in the marketplace." /><div className="mb-5 flex flex-wrap gap-2">{['pending_review','active','rejected','hidden','archived','draft','all'].map((item) => <Link key={item} href={`/admin/products?status=${item}`} className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-black">{item}</Link>)}</div><form className="mb-5 grid gap-3 rounded-lg border border-line bg-white p-4 md:grid-cols-[1fr_auto]"><input name="q" placeholder="Search products" defaultValue={params.q || ''} className="rounded-lg border border-line px-4 py-3"/><button className="rounded-lg bg-ink px-5 py-3 font-black text-white">Search</button></form><div className="grid gap-3">{(products || []).map((product: any) => <Link key={product.id} href={`/admin/products/${product.id}`} className="grid gap-4 rounded-xl border border-line bg-white p-4 md:grid-cols-[80px_1fr_auto]"><img src={product.product_images?.[0]?.image_url || '/artisan-hero.png'} alt={product.name} className="h-20 w-20 rounded-lg object-cover"/><div><h2 className="font-black">{product.name}</h2><p className="text-sm text-muted">{product.seller_profiles?.store_name || 'Seller'} - {product.categories?.name || 'No category'} - {product.product_type}</p><p className="text-xs text-muted">Submitted: {product.submitted_at ? new Date(product.submitted_at).toLocaleDateString() : 'Not recorded'}</p></div><Badge>{product.status}</Badge></Link>)}</div>{!products?.length ? <div className="rounded-xl border border-line bg-white p-10 text-center text-muted">No products found for this filter.</div> : null}</main>;
}