import Link from 'next/link';
import type { ReactNode } from 'react';
import { Check, ExternalLink, Eye, ImageIcon, Layers3, Palette, Radio, Rocket, Store, Upload } from 'lucide-react';
import { Badge, SectionHeading } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { requireApprovedSeller } from '@/lib/services/auth';
import { STOREFRONT_TEMPLATES, getTemplateMeta } from '@/lib/storefront/template-registry';
import { publishStorefrontAction, saveStorefrontBuilderAction } from './actions';

export const dynamic = 'force-dynamic';

const nav = [['Builder','/seller/storefront'],['Templates','/seller/storefront/template'],['Branding','/seller/storefront/branding'],['Content','/seller/storefront/content'],['Policies','/seller/storefront/policies'],['Collections','/seller/collections'],['Preview','/seller/storefront/preview']];

const templateLooks: Record<string, { label: string; swatches: string[] }> = {
  'warm-editorial': { label: 'Story-led craft homepage', swatches: ['#FFFFFF', '#69296A', '#F38FA4'] },
  'clean-grid': { label: 'Product-first clean shop', swatches: ['#FFFFFF', '#241124', '#F7A1B5'] },
  'personalized-gifts': { label: 'Custom and gifting focused', swatches: ['#FFFFFF', '#69296A', '#F7A1B5'] },
  'visual-portfolio': { label: 'Gallery and project led', swatches: ['#F7F2EA', '#602060', '#F38FA4'] },
  'boutique-brand': { label: 'Premium brand storefront', swatches: ['#241124', '#FFFFFF', '#F38FA4'] }
};

export default async function SellerStorefrontPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const params = await searchParams;
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  let { data: settings } = await supabase.from('storefront_settings').select('*').eq('seller_id', seller.id).maybeSingle();
  if (!settings) {
    const inserted = await supabase.from('storefront_settings').insert({
      seller_id: seller.id,
      template_key: 'warm-editorial',
      custom_subdomain: seller.store_slug,
      hero_title: seller.store_name,
      hero_subtitle: seller.short_bio,
      accent_color: '#69296A',
      secondary_color: '#F38FA4',
      background_color: '#FFFFFF',
      text_color: '#241124',
      button_style: 'rounded',
      font_pairing: 'friendly',
      draft_updated_at: new Date().toISOString()
    }).select('*').single();
    settings = inserted.data;
  }
  const [{ count: productCount }, { count: collectionCount }] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('seller_id', seller.id).eq('status', 'active'),
    supabase.from('seller_collections').select('id', { count: 'exact', head: true }).eq('seller_id', seller.id)
  ]);
  const template = getTemplateMeta(settings?.template_key);
  const publicPath = `/artisan/${seller.store_slug}`;
  const checklist = [
    Boolean(settings?.template_key),
    Boolean(settings?.logo_url),
    Boolean(settings?.hero_image_url),
    Boolean(settings?.hero_title),
    Boolean(settings?.about_content),
    Boolean(settings?.shipping_policy && settings?.return_policy),
    Boolean(collectionCount),
    Boolean(productCount),
    Boolean(settings?.is_published)
  ];
  const completed = checklist.filter(Boolean).length;

  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <SectionHeading
      eyebrow="Storefront Builder"
      title="Customize and publish your mini-site"
      copy="Choose a storefront template, tune your brand system, upload hero assets, preview the buyer experience, then publish when it is ready."
      action={<div className="flex flex-wrap gap-2"><Link href="/seller/storefront/preview" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-black"><Eye size={16} />Preview</Link><Link href={publicPath} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-rust px-4 text-sm font-black text-white"><ExternalLink size={16} />Public page</Link></div>}
    />
    {params.error ? <p className="mb-4 rounded-lg border border-rust/30 bg-rust/10 p-3 text-sm font-bold text-rust">{params.error}</p> : null}
    {params.saved ? <p className="mb-4 rounded-lg border border-success/30 bg-sage/10 p-3 text-sm font-bold text-success">Storefront builder saved.</p> : null}
    <Nav />

    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <form action={saveStorefrontBuilderAction} className="grid gap-5">
        <BuilderPanel icon={<Layers3 size={18} />} title="1. Pick a template" copy="Templates change the page layout only. Your products, collections, custom-order settings, and URL stay intact.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {STOREFRONT_TEMPLATES.map((item) => {
              const selected = (settings?.template_key || 'warm-editorial') === item.key;
              const look = templateLooks[item.key];
              return <label key={item.key} className={`cursor-pointer rounded-xl border bg-white p-4 shadow-[0_12px_30px_rgba(105,41,106,.06)] transition hover:-translate-y-0.5 ${selected ? 'border-rust ring-2 ring-rust/15' : 'border-line'}`}>
                <input className="sr-only" type="radio" name="template_key" value={item.key} defaultChecked={selected} />
                <div className="flex items-start justify-between gap-3">
                  <span className={`grid h-9 w-9 place-items-center rounded-lg ${selected ? 'bg-rust text-white' : 'bg-rust-soft text-rust'}`}>{selected ? <Check size={17} /> : <Radio size={17} />}</span>
                  <span className="flex gap-1">{look.swatches.map((swatch) => <span key={swatch} className="h-4 w-4 rounded-full border border-line" style={{ backgroundColor: swatch }} />)}</span>
                </div>
                <h3 className="mt-4 text-lg font-black text-ink">{item.name}</h3>
                <p className="mt-1 text-xs font-black uppercase tracking-[.12em] text-rust">{look.label}</p>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{item.description}</p>
              </label>;
            })}
          </div>
        </BuilderPanel>

        <BuilderPanel icon={<Palette size={18} />} title="2. Brand theme" copy="Set the visible color system and small style choices that all storefront templates can share.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ColorInput name="accent_color" label="Primary color" defaultValue={settings?.accent_color || '#69296A'} />
            <ColorInput name="secondary_color" label="Secondary color" defaultValue={settings?.secondary_color || '#F38FA4'} />
            <ColorInput name="background_color" label="Page background" defaultValue={settings?.background_color || '#FFFFFF'} />
            <ColorInput name="text_color" label="Text color" defaultValue={settings?.text_color || '#241124'} />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Select name="button_style" label="Button style" defaultValue={settings?.button_style || 'rounded'} options={[['rounded','Rounded'],['pill','Pill'],['soft-square','Soft square']]} />
            <Select name="font_pairing" label="Font pairing" defaultValue={settings?.font_pairing || 'friendly'} options={[['friendly','Friendly Plumlet'],['editorial','Editorial'],['minimal','Minimal']]} />
          </div>
        </BuilderPanel>

        <BuilderPanel icon={<ImageIcon size={18} />} title="3. Identity and hero" copy="Upload a logo, upload the main hero image, and set the headline buyers see first.">
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="custom_subdomain" label="Store URL slug" defaultValue={settings?.custom_subdomain || seller.store_slug} />
            <Input name="announcement_text" label="Announcement bar" defaultValue={settings?.announcement_text || ''} placeholder="New collection launching this week" />
            <Input name="hero_title" label="Hero title" defaultValue={settings?.hero_title || seller.store_name} />
            <Input name="hero_subtitle" label="Hero subtitle" defaultValue={settings?.hero_subtitle || seller.short_bio || ''} />
            <FileInput name="logo" label="Logo image" current={settings?.logo_url} />
            <FileInput name="hero_image" label="Hero image" current={settings?.hero_image_url} />
          </div>
        </BuilderPanel>

        <BuilderPanel icon={<Store size={18} />} title="4. Selling controls" copy="Control custom-order visibility from the storefront and keep the call-to-action clear.">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <label className="flex min-h-12 items-center gap-3 rounded-lg border border-line bg-white px-4 text-sm font-black">
              <input name="custom_orders_enabled" type="checkbox" defaultChecked={settings?.custom_orders_enabled !== false} />
              Custom orders enabled on storefront
            </label>
            <Input name="custom_order_cta_text" label="Custom-order button text" defaultValue={settings?.custom_order_cta_text || 'Request a custom piece'} />
          </div>
        </BuilderPanel>

        <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-xl border border-line bg-white/95 p-4 shadow-lift backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-muted">Save as draft first, preview, then publish when the storefront is ready for buyers.</p>
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-rust px-6 font-black text-white"><Upload size={17} />Save Builder Draft</button>
        </div>
      </form>

      <aside className="grid h-fit gap-5 lg:sticky lg:top-28">
        <section className="rounded-xl border border-line bg-white p-6 shadow-[0_12px_30px_rgba(105,41,106,.06)]">
          <Badge>{settings?.is_published ? 'Live storefront' : 'Private draft'}</Badge>
          <h2 className="mt-3 text-xl font-black">Publish control</h2>
          <p className="mt-2 break-all text-sm leading-6 text-muted">{publicPath}</p>
          <div className="mt-5 grid gap-2">
            <Link href="/seller/storefront/preview" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-paper px-4 font-black"><Eye size={16} />Preview private draft</Link>
            <form action={publishStorefrontAction}>
              <input type="hidden" name="publish" value={settings?.is_published ? 'false' : 'true'} />
              <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-rust px-4 font-black text-white"><Rocket size={16} />{settings?.is_published ? 'Unpublish storefront' : 'Publish storefront'}</button>
            </form>
          </div>
        </section>

        <section className="rounded-xl border border-line bg-white p-6 shadow-[0_12px_30px_rgba(105,41,106,.06)]">
          <h2 className="text-xl font-black">Readiness</h2>
          <p className="mt-2 text-sm font-bold text-muted">{completed} of {checklist.length} essentials complete</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-rust-soft"><span className="block h-full bg-rust" style={{ width: `${Math.round((completed / checklist.length) * 100)}%` }} /></div>
          <div className="mt-5 grid gap-2 text-sm">
            {['Template selected','Logo added','Hero image added','Hero title ready','About content ready','Policies ready','Collection created','Live products added','Published'].map((item, index) => <span key={item} className={`flex items-center gap-2 rounded-lg px-3 py-2 font-bold ${checklist[index] ? 'bg-rust/10 text-rust' : 'bg-surface-low text-muted'}`}><Check size={15} />{item}</span>)}
          </div>
        </section>

        <section className="rounded-xl border border-line bg-white p-6 shadow-[0_12px_30px_rgba(105,41,106,.06)]">
          <h2 className="text-xl font-black">Current setup</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <Info label="Template" value={template.name} />
            <Info label="Products" value={String(productCount || 0)} />
            <Info label="Collections" value={String(collectionCount || 0)} />
            <Info label="Last draft" value={formatDate(settings?.draft_updated_at || settings?.updated_at)} />
            <Info label="Published" value={formatDate(settings?.published_at)} />
          </dl>
        </section>
      </aside>
    </div>
  </main>;
}

function Nav(){return <nav className="mb-6 flex flex-wrap gap-2">{nav.map(([label,href])=><Link key={href} href={href} className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-black">{label}</Link>)}</nav>;}
function BuilderPanel({ icon, title, copy, children }: { icon: ReactNode; title: string; copy: string; children: ReactNode }) { return <section className="rounded-xl border border-line bg-white p-5 shadow-[0_12px_30px_rgba(105,41,106,.06)] sm:p-6"><div className="mb-5 flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-rust-soft text-rust">{icon}</span><div><h2 className="text-xl font-black">{title}</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{copy}</p></div></div>{children}</section>; }
function Input({ label, ...props }: any){return <label className="grid gap-2 text-sm font-black">{label}<input {...props} className="min-h-12 rounded-lg border border-line bg-white px-4 py-3 outline-none focus:border-rust" /></label>;}
function ColorInput({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) { return <label className="grid gap-2 text-sm font-black">{label}<span className="flex min-h-12 items-center gap-3 rounded-lg border border-line bg-white px-3"><input name={name} type="color" defaultValue={defaultValue} className="h-8 w-10 cursor-pointer border-0 bg-transparent p-0" /><span className="text-sm text-muted">{defaultValue}</span></span></label>; }
function Select({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: [string,string][] }) { return <label className="grid gap-2 text-sm font-black">{label}<select name={name} defaultValue={defaultValue} className="min-h-12 rounded-lg border border-line bg-white px-4 py-3 outline-none focus:border-rust">{options.map(([value, optionLabel]) => <option key={value} value={value}>{optionLabel}</option>)}</select></label>; }
function FileInput({ label, name, current }: { label: string; name: string; current?: string | null }) { return <label className="grid gap-2 text-sm font-black">{label}<span className="grid gap-3 rounded-lg border border-dashed border-line bg-surface-low p-4">{current ? <img src={current} alt="" className="h-20 w-28 rounded-lg object-cover" /> : null}<input name={name} type="file" accept="image/png,image/jpeg,image/webp" className="text-sm" /></span></label>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4 border-b border-line pb-2 last:border-0"><dt className="font-bold text-muted">{label}</dt><dd className="text-right font-black text-ink">{value}</dd></div>; }
function formatDate(value?: string | null) { return value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value)) : 'Not set'; }
