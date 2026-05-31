import { SectionHeading } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { requireApprovedSeller } from '@/lib/services/auth';
import { ProductForm } from '../product-form';

export const dynamic = 'force-dynamic';

export default async function NewProductPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  await requireApprovedSeller();
  const params = await searchParams;
  const supabase = await createClient();
  const { data: categories } = await supabase.from('categories').select('id,name,slug').eq('is_active', true).order('display_order').order('name');
  return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"><SectionHeading eyebrow="New product" title="Add a handmade product" copy="Create a draft listing with images, variants, customization fields, and review details." />{params.error ? <p className="mb-4 rounded-lg border border-rust/30 bg-rust/10 p-3 text-rust">{params.error}</p> : null}<ProductForm categories={categories || []}/></main>;
}