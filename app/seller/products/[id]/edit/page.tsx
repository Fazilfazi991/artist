import { notFound } from 'next/navigation';
import { SectionHeading } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { requireApprovedSeller } from '@/lib/services/auth';
import { ProductForm } from '../../product-form';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string,string|undefined>> }) {
  const seller = await requireApprovedSeller();
  const query = await searchParams;
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*, product_images(*), product_variants(*), product_customization_fields(*)').eq('id', id).eq('seller_id', seller.id).single(),
    supabase.from('categories').select('id,name,slug').eq('is_active', true).order('display_order').order('name')
  ]);
  if (!product) notFound();
  return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"><SectionHeading eyebrow="Edit product" title={product.name} copy="Draft and rejected products are editable. Active edits are sent back to review for this MVP." />{query.error ? <p className="mb-4 rounded-lg border border-rust/30 bg-rust/10 p-3 text-rust">{query.error}</p> : null}{query.saved ? <p className="mb-4 rounded-lg border border-success/30 bg-sage/10 p-3 text-success">Product saved.</p> : null}<ProductForm product={product} categories={categories || []}/></main>;
}