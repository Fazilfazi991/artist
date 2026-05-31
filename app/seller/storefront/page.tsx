import Link from 'next/link';
import { SectionHeading, Badge } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { requireApprovedSeller } from '@/lib/services/auth';
import { getTemplateMeta } from '@/lib/storefront/template-registry';
import { publishStorefrontAction } from './actions';

export const dynamic = 'force-dynamic';

const nav = [['Overview','/seller/storefront'],['Template','/seller/storefront/template'],['Branding','/seller/storefront/branding'],['Content','/seller/storefront/content'],['Policies','/seller/storefront/policies'],['Collections','/seller/collections'],['Preview','/seller/storefront/preview']];
export default async function SellerStorefrontPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const params = await searchParams;
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  let { data: settings } = await supabase.from('storefront_settings').select('*').eq('seller_id', seller.id).maybeSingle();
  if (!settings) {
    const inserted = await supabase.from('storefront_settings').insert({ seller_id: seller.id, template_key: 'warm-editorial', custom_subdomain: seller.store_slug, hero_title: seller.store_name, hero_subtitle: seller.short_bio }).select('*').single();
    settings = inserted.data;
  }
  const [{ count: productCount }, { count: collectionCount }] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('seller_id', seller.id).eq('status', 'active'),
    supabase.from('seller_collections').select('id', { count: 'exact', head: true }).eq('seller_id', seller.id)
  ]);
  const template = getTemplateMeta(settings?.template_key);
  const checklist = [Boolean(settings?.template_key), Boolean(settings?.logo_url), Boolean(settings?.hero_image_url), Boolean(settings?.hero_title), Boolean(settings?.about_content), Boolean(settings?.artisan_story), Boolean(settings?.shipping_policy && settings?.return_policy), Boolean(collectionCount), Boolean(productCount), Boolean(settings?.is_published)];
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><SectionHeading eyebrow="Storefront" title="Mini-site dashboard" copy="Customize, preview, and publish your artisan storefront." />{params.saved ? <p className="mb-4 rounded-lg border border-success/30 bg-sage/10 p-3 text-success">Storefront updated.</p> : null}<Nav/><div className="grid gap-5 lg:grid-cols-[1fr_360px]"><section className="grid gap-4 md:grid-cols-2"><Card label="Status" value={settings?.is_published ? 'Published' : 'Unpublished'} /><Card label="Template" value={template.name} /><Card label="Products" value={String(productCount || 0)} /><Card label="Collections" value={String(collectionCount || 0)} /></section><aside className="rounded-xl border border-line bg-white p-6"><Badge>{settings?.is_published ? 'Live' : 'Private draft'}</Badge><h2 className="mt-3 font-black">Share URL</h2><p className="mt-2 break-all text-sm text-muted">/artisan/{seller.store_slug}</p><div className="mt-4 flex flex-wrap gap-2"><Link href="/seller/storefront/preview" className="rounded-lg border border-line px-4 py-3 font-black">Preview</Link><form action={publishStorefrontAction}><input type="hidden" name="publish" value={settings?.is_published ? 'false' : 'true'}/><button className="rounded-lg bg-rust px-4 py-3 font-black text-white">{settings?.is_published ? 'Unpublish' : 'Publish'}</button></form></div></aside></div><section className="mt-6 rounded-xl border border-line bg-white p-6"><h2 className="font-black">Setup checklist</h2><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{['Choose template','Add logo','Add hero image','Add hero title','Complete about','Add craft story','Add policies','Create collection','Add products','Publish'].map((item, index) => <div key={item} className="rounded-lg bg-paper p-3 text-sm font-bold">{checklist[index] ? 'Done' : 'Todo'} - {item}</div>)}</div></section></main>;
}
function Nav(){return <nav className="mb-6 flex flex-wrap gap-2">{nav.map(([label,href])=><Link key={href} href={href} className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-black">{label}</Link>)}</nav>}
function Card({label,value}:{label:string;value:string}){return <article className="rounded-xl border border-line bg-white p-6"><p className="text-sm text-muted">{label}</p><strong className="mt-2 block text-2xl">{value}</strong></article>}