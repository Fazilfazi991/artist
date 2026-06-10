import Link from 'next/link';
import { Eye, GripVertical, LayoutTemplate, Save } from 'lucide-react';
import { SectionHeading } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { requireApprovedSeller } from '@/lib/services/auth';
import { STOREFRONT_SECTION_TYPES } from '@/lib/storefront/section-registry';
import { saveStorefrontSectionsAction } from '../actions';

export const dynamic = 'force-dynamic';

const nav = [['Builder','/seller/storefront'],['Sections','/seller/storefront/sections'],['Templates','/seller/storefront/template'],['Branding','/seller/storefront/branding'],['Content','/seller/storefront/content'],['Policies','/seller/storefront/policies'],['Preview','/seller/storefront/preview']];

export default async function StorefrontSectionsPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const params = await searchParams;
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  const { data } = await supabase.from('storefront_sections').select('*').eq('seller_id', seller.id).order('display_order', { ascending: true });
  const sectionRows = data || [];
  const rows = STOREFRONT_SECTION_TYPES.map((meta, index) => {
    const row = sectionRows.find((item: any) => item.section_type === meta.key);
    return {
      ...meta,
      id: row?.id,
      title: row?.title || meta.defaultTitle,
      subtitle: row?.content?.subtitle || meta.defaultSubtitle,
      layout: row?.content?.layout || meta.layouts[0],
      limit: row?.content?.limit || defaultLimit(meta.key),
      buttonLabel: row?.content?.buttonLabel || 'Request Custom Order',
      displayOrder: row?.display_order ?? (index + 1) * 10,
      isVisible: row?.is_visible ?? true
    };
  }).sort((a, b) => a.displayOrder - b.displayOrder);

  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <SectionHeading
      eyebrow="Storefront Builder"
      title="Arrange storefront sections"
      copy="Choose which sections appear on the public storefront, edit their labels, pick a layout style, and control their order. Lower numbers appear first."
      action={<Link href="/seller/storefront/preview" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-black"><Eye size={16} />Preview</Link>}
    />
    {params.saved ? <p className="mb-4 rounded-lg border border-success/30 bg-sage/10 p-3 text-sm font-bold text-success">Section builder saved.</p> : null}
    {params.error ? <p className="mb-4 rounded-lg border border-rust/30 bg-rust/10 p-3 text-sm font-bold text-rust">{params.error}</p> : null}
    <Nav />

    <form action={saveStorefrontSectionsAction} className="grid gap-4">
      {rows.map((row) => <section key={row.key} className="rounded-xl border border-line bg-white p-5 shadow-[0_12px_30px_rgba(105,41,106,.06)]">
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-rust-soft text-rust"><GripVertical size={17} /></span>
              <div>
                <p className="text-xs font-black uppercase tracking-[.12em] text-rust">{row.label}</p>
                <h2 className="text-xl font-black">{row.title}</h2>
              </div>
            </div>
            <label className="mt-5 flex min-h-11 items-center gap-3 rounded-lg border border-line bg-surface-low px-3 text-sm font-black">
              <input name={`${row.key}_visible`} type="checkbox" defaultChecked={row.isVisible} />
              Show section
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Input name={`${row.key}_order`} label="Order" type="number" defaultValue={row.displayOrder} />
            <Select name={`${row.key}_layout`} label="Layout" defaultValue={row.layout} options={row.layouts.map((layout) => [layout, pretty(layout)] as [string,string])} />
            <Input name={`${row.key}_title`} label="Section title" defaultValue={row.title} />
            <Input name={`${row.key}_subtitle`} label="Subtitle" defaultValue={row.subtitle} />
            {row.key === 'featured_products' || row.key === 'collections' ? <Input name={`${row.key}_limit`} label="Item limit" type="number" min="1" max="16" defaultValue={row.limit} /> : <input type="hidden" name={`${row.key}_limit`} value={row.limit} />}
            {row.key === 'custom_cta' ? <Input name={`${row.key}_button`} label="Button text" defaultValue={row.buttonLabel} /> : null}
          </div>
        </div>
      </section>)}

      <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-xl border border-line bg-white/95 p-4 shadow-lift backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-muted">Use order numbers for now. True drag-and-drop can sit on top of this in the next phase.</p>
        <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-rust px-6 font-black text-white"><Save size={17} />Save Section Layout</button>
      </div>
    </form>
  </main>;
}

function Nav(){return <nav className="mb-6 flex flex-wrap gap-2">{nav.map(([label,href])=><Link key={href} href={href} className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-black">{label}</Link>)}</nav>;}
function Input({ label, ...props }: any){return <label className="grid gap-2 text-sm font-black">{label}<input {...props} className="min-h-12 rounded-lg border border-line bg-white px-4 py-3 outline-none focus:border-rust" /></label>;}
function Select({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: [string,string][] }) { return <label className="grid gap-2 text-sm font-black">{label}<select name={name} defaultValue={defaultValue} className="min-h-12 rounded-lg border border-line bg-white px-4 py-3 outline-none focus:border-rust">{options.map(([value, optionLabel]) => <option key={value} value={value}>{optionLabel}</option>)}</select></label>; }
function pretty(value: string) { return value.split('-').map((part) => part.slice(0, 1).toUpperCase() + part.slice(1)).join(' '); }
function defaultLimit(key: string) { return key === 'collections' ? 5 : key === 'featured_products' ? 8 : 3; }
