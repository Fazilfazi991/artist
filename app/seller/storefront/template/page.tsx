import Link from 'next/link';
import type { ReactNode } from 'react';
import { BadgeCheck, Eye, Palette } from 'lucide-react';
import { Badge, SectionHeading } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { requireApprovedSeller } from '@/lib/services/auth';
import { STOREFRONT_TEMPLATES } from '@/lib/storefront/template-registry';
import { saveTemplateAction } from '../actions';

export const dynamic = 'force-dynamic';

const styles: Record<string, { label: string; palette: string[]; features: string[] }> = {
  'warm-editorial': { label: 'Plum editorial / story-led', palette: ['#FFFFFF', '#69296A', '#F38FA4'], features: ['Large story section', 'Featured collections', 'Craft process'] },
  'clean-grid': { label: 'Minimal white / product-first', palette: ['#FFFFFF', '#2A2724', '#E7DED3'], features: ['Clean filters', 'Best sellers', 'Compact storytelling'] },
  'personalized-gifts': { label: 'Soft pink / occasion-led', palette: ['#FFFFFF', '#69296A', '#F7A1B5'], features: ['Custom-order CTA', 'Gift collections', 'Personalization section'] },
  'visual-portfolio': { label: 'Image-focused / gallery-led', palette: ['#F7F2EA', '#2A2724', '#C98A6B'], features: ['Portfolio gallery', 'Large cards', 'Custom-project CTA'] },
  'boutique-brand': { label: 'Premium brand / curated', palette: ['#fbfaf7', '#2A2724', '#B8955D'], features: ['Campaign hero', 'Collection banners', 'Newsletter area'] }
};

type PreviewProps = {
  templateKey: string;
  seller: any;
  settings: any;
  products: any[];
  collections: any[];
};

export default async function TemplatePage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const params = await searchParams;
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  const [{ data: settings }, { data: products }, { data: collections }] = await Promise.all([
    supabase.from('storefront_settings').select('*').eq('seller_id', seller.id).maybeSingle(),
    supabase.from('products').select('name, base_price, product_images(image_url, display_order, is_primary)').eq('seller_id', seller.id).eq('status', 'active').order('is_featured', { ascending: false }).order('created_at', { ascending: false }).limit(8),
    supabase.from('seller_collections').select('name, image_url, display_order').eq('seller_id', seller.id).eq('is_active', true).order('display_order', { ascending: true }).limit(6)
  ]);
  const selectedTemplateKey = settings?.template_key || 'warm-editorial';
  const selectedPreviewHref = `/seller/storefront/preview?template=${selectedTemplateKey}`;

  return <div className="mx-auto max-w-7xl">
    <SectionHeading eyebrow="Storefront Design Studio" title="Choose your mini-site template" copy="Switching templates changes the storefront presentation only. Products, collections, branding, hero text, images, policies, social links, and your public URL stay intact." action={<Link href={selectedPreviewHref} className="rounded-lg border border-line bg-white px-4 py-3 font-black">Open Storefront Preview</Link>} />
    {params.saved ? <p className="mb-4 rounded-lg border border-success/30 bg-sage/10 p-3 font-bold text-success">Template saved.</p> : null}
    <div className="mb-5 rounded-xl border border-line bg-white p-4 text-sm font-bold text-muted">
      <span className="text-rust">Unsaved changes notice:</span> select a template card to save it immediately. You can preview your storefront before or after switching.
    </div>
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {STOREFRONT_TEMPLATES.map((template) => {
        const style = styles[template.key];
        const current = settings?.template_key === template.key;
        return <article key={template.key} className={`overflow-hidden rounded-xl border bg-white shadow-[0_12px_30px_rgba(105,41,106,.08)] ${current ? 'border-rust ring-2 ring-rust/15' : 'border-line'}`}>
          <TemplatePreview templateKey={template.key} seller={seller} settings={settings} products={products || []} collections={collections || []} />
          <div className="p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[.12em] text-rust">{style.label}</p>
                <h2 className="mt-1 font-serif text-2xl leading-tight text-ink">{template.name}</h2>
              </div>
              <div className="flex shrink-0 gap-1 pt-1">{style.palette.map((color) => <span key={color} className="h-4 w-4 rounded-full border border-line shadow-sm" style={{ backgroundColor: color }} />)}</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {current ? <Badge tone="sage">Current Template</Badge> : null}
              <span className="inline-flex items-center gap-1 rounded-md bg-rust/10 px-2.5 py-1 text-xs font-black text-rust"><Palette size={13} />Visual design</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">{template.description}</p>
            <div className="mt-4">
              <p className="text-xs font-black uppercase tracking-[.12em] text-muted">Best for</p>
              <div className="mt-2 flex flex-wrap gap-2">{template.suitableFor.map((item) => <span key={item} className="rounded-md bg-paper px-2.5 py-1 text-xs font-bold text-muted">{item}</span>)}</div>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-muted">{style.features.map((feature) => <span key={feature} className="flex items-center gap-2"><BadgeCheck size={15} className="text-success" />{feature}</span>)}</div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link href={`/seller/storefront/preview?template=${template.key}`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-paper px-4 text-sm font-black"><Eye size={16} />Preview</Link>
              <form action={saveTemplateAction} className="flex-1"><input type="hidden" name="template_key" value={template.key}/><button className="min-h-11 w-full rounded-lg bg-rust px-4 text-sm font-black text-white">{current ? 'Selected' : 'Select Template'}</button></form>
            </div>
          </div>
        </article>;
      })}
    </div>
    <div className="mt-5 flex flex-wrap justify-end gap-3">
      <Link href="/seller/storefront" className="rounded-lg border border-line bg-white px-5 py-3 font-black">Cancel Changes</Link>
      <Link href={selectedPreviewHref} className="rounded-lg bg-ink px-5 py-3 font-black text-white">Open Storefront Preview</Link>
    </div>
  </div>;
}

function TemplatePreview(props: PreviewProps) {
  if (props.templateKey === 'clean-grid') return <CleanGridPreview {...props} />;
  if (props.templateKey === 'personalized-gifts') return <GiftsPreview {...props} />;
  if (props.templateKey === 'visual-portfolio') return <PortfolioPreview {...props} />;
  if (props.templateKey === 'boutique-brand') return <BoutiquePreview {...props} />;
  return <WarmPreview {...props} />;
}

function WarmPreview({ seller, settings, products, collections }: PreviewProps) {
  return <PreviewShell className="bg-[#f8ecdc] text-[#201813]">
    <MiniNav seller={seller} settings={settings} />
    <div className="grid h-28 grid-cols-[.9fr_1.1fr] bg-[#ead0b2]">
      <div className="p-4"><MiniHeading>{settings?.hero_title || 'Handmade with earth, crafted with love.'}</MiniHeading><MiniButton>Explore</MiniButton></div>
      <MiniImage src={image(products, collections, settings, seller, 0)} className="h-full" />
    </div>
    <div className="grid grid-cols-[1fr_1.2fr] gap-3 p-3">
      <div><MiniTitle>Our Story</MiniTitle><MiniLines count={4} /></div>
      <MiniImage src={image(products, collections, settings, seller, 1)} className="h-20 rounded-md" />
    </div>
    <MiniCollectionRow collections={collections} bg="bg-[#efd8bf]" />
    <div className="grid grid-cols-4 gap-2 bg-[#eed8bd] p-3 text-center text-[6px] font-bold uppercase text-[#81523d]"><span>Clay Prep</span><span>Making</span><span>Finishing</span><span>Firing</span></div>
    <MiniProductGrid products={products} collections={collections} settings={settings} seller={seller} />
  </PreviewShell>;
}

function CleanGridPreview({ seller, settings, products, collections }: PreviewProps) {
  return <PreviewShell className="bg-white text-[#24211f]">
    <MiniNav seller={seller} settings={settings} compact />
    <div className="grid h-32 grid-cols-[.9fr_1.1fr] bg-[#f6f4ef]">
      <div className="p-4"><MiniHeading>{settings?.hero_title || 'Minimal pieces, made to be loved daily.'}</MiniHeading><MiniButton dark>Shop Now</MiniButton></div>
      <MiniImage src={image(products, collections, settings, seller, 0)} className="h-full" />
    </div>
    <div className="grid grid-cols-4 gap-2 border-y border-[#e8e0d6] p-3 text-center text-[6px] font-bold text-[#6f6a61]"><span>Quality</span><span>Handmade</span><span>Easy Returns</span><span>Secure</span></div>
    <div className="p-3"><MiniTitle>Shop by Category</MiniTitle><div className="mt-2 grid grid-cols-5 gap-2">{[0,1,2,3,4].map((i) => <div key={i} className="grid justify-items-center gap-1"><MiniImage src={image(products, collections, settings, seller, i)} className="h-10 w-10 rounded-full" /><span className="max-w-full truncate text-[6px] font-bold">{collectionName(collections, i)}</span></div>)}</div></div>
    <MiniProductGrid products={products} collections={collections} settings={settings} seller={seller} compact />
  </PreviewShell>;
}

function GiftsPreview({ seller, settings, products, collections }: PreviewProps) {
  return <PreviewShell className="bg-[#fff1ed] text-[#2c1814]">
    <MiniNav seller={seller} settings={settings} />
    <div className="grid h-32 grid-cols-[1fr_1fr] bg-[#ffe4d6]">
      <div className="p-4"><MiniHeading>{settings?.hero_title || 'Make every moment truly theirs.'}</MiniHeading><MiniButton>Explore Gifts</MiniButton></div>
      <MiniImage src={image(products, collections, settings, seller, 0)} className="h-full" />
    </div>
    <div className="p-3"><MiniTitle>Shop by Occasion</MiniTitle><div className="mt-2 grid grid-cols-5 gap-2">{[0,1,2,3,4].map((i) => <div key={i} className="rounded-md bg-[#F7A1B5] p-1 text-center"><MiniImage src={image(products, collections, settings, seller, i)} className="h-10 rounded" /><span className="block truncate text-[6px] font-bold">{collectionName(collections, i)}</span></div>)}</div></div>
    <div className="grid grid-cols-4 gap-2 bg-[#ffe1dc] p-3 text-center text-[6px] font-bold text-[#a54f45]"><span>Choose</span><span>Add details</span><span>We create</span><span>Deliver</span></div>
    <MiniProductGrid products={products} collections={collections} settings={settings} seller={seller} />
  </PreviewShell>;
}

function PortfolioPreview({ seller, settings, products, collections }: PreviewProps) {
  return <PreviewShell className="bg-[#f3eee4] text-[#1e1d16]">
    <MiniNav seller={seller} settings={settings} compact />
    <div className="relative h-36"><MiniImage src={image(products, collections, settings, seller, 0)} className="h-full" /><div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/5 p-4 text-white"><MiniHeading>{settings?.hero_title || 'Art that brings texture to life.'}</MiniHeading><MiniButton dark>Explore</MiniButton></div></div>
    <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 p-3">
      {[0,1,2].map((i) => <MiniImage key={i} src={image(products, collections, settings, seller, i)} className={i === 0 ? 'h-24 rounded-md' : 'h-16 rounded-md'} />)}
    </div>
    <div className="grid grid-cols-[1.05fr_.95fr] gap-3 bg-[#69296A] p-3 text-white"><div><MiniTitle>Featured Project</MiniTitle><MiniLines count={3} light /></div><MiniImage src={image(products, collections, settings, seller, 3)} className="h-20 rounded-md" /></div>
    <MiniProductGrid products={products} collections={collections} settings={settings} seller={seller} compact />
  </PreviewShell>;
}

function BoutiquePreview({ seller, settings, products, collections }: PreviewProps) {
  return <PreviewShell className="bg-[#241124] text-white">
    <MiniNav seller={seller} settings={settings} dark />
    <div className="relative h-36"><MiniImage src={image(products, collections, settings, seller, 0)} className="h-full opacity-70" /><div className="absolute inset-0 p-4"><MiniHeading>{settings?.hero_title || 'Curated with intention. Made to be cherished.'}</MiniHeading><MiniButton gold>Shop</MiniButton></div></div>
    <div className="grid grid-cols-4 gap-2 bg-[#F7A1B5] p-3 text-center text-[6px] font-bold text-[#241124]"><span>Premium</span><span>Handmade</span><span>Sustainable</span><span>Gift ready</span></div>
    <MiniCollectionRow collections={collections} bg="bg-[#ead5b5]" />
    <MiniProductGrid products={products} collections={collections} settings={settings} seller={seller} dark compact />
  </PreviewShell>;
}

function PreviewShell({ children, className }: { children: ReactNode; className: string }) {
  return <div className={`h-[430px] overflow-hidden ${className}`}>{children}</div>;
}

function MiniNav({ seller, settings, compact, dark }: { seller: any; settings: any; compact?: boolean; dark?: boolean }) {
  return <div className={`flex h-10 items-center justify-between px-3 text-[7px] font-black ${dark ? 'text-[#f8edd9]' : 'text-[#2a2724]'}`}>
    <span className="flex items-center gap-1"><MiniLogo settings={settings} />{seller.store_name}</span>
    <span className="flex gap-2 opacity-80"><span>Home</span><span>Shop</span>{compact ? null : <span>Custom</span>}<span>About</span></span>
  </div>;
}

function MiniLogo({ settings }: { settings: any }) {
  if (settings?.logo_url) return <img src={settings.logo_url} alt="" className="h-5 w-5 rounded-full object-cover" />;
  return <span className="h-5 w-5 rounded-full bg-rust/20" />;
}

function MiniHeading({ children }: { children: ReactNode }) {
  return <h2 className="line-clamp-3 font-serif text-[16px] leading-[1.05]">{children}</h2>;
}

function MiniTitle({ children }: { children: ReactNode }) {
  return <h3 className="font-serif text-[11px] leading-none">{children}</h3>;
}

function MiniButton({ children, dark, gold }: { children: ReactNode; dark?: boolean; gold?: boolean }) {
  const color = gold ? 'bg-[#d9a441] text-[#25150c]' : dark ? 'bg-[#344427] text-white' : 'bg-rust text-white';
  return <span className={`mt-3 inline-flex rounded px-2 py-1 text-[6px] font-black ${color}`}>{children}</span>;
}

function MiniImage({ src, className }: { src: string; className: string }) {
  return <img src={src} alt="" className={`w-full object-cover ${className}`} />;
}

function MiniLines({ count, light }: { count: number; light?: boolean }) {
  return <div className="mt-2 grid gap-1">{Array.from({ length: count }).map((_, i) => <span key={i} className={`h-1 rounded-full ${light ? 'bg-white/45' : 'bg-current/15'}`} style={{ width: `${95 - i * 12}%` }} />)}</div>;
}

function MiniCollectionRow({ collections, bg }: { collections: any[]; bg: string }) {
  return <div className="p-3"><MiniTitle>Shop by Collection</MiniTitle><div className="mt-2 grid grid-cols-4 gap-2">{[0,1,2,3].map((i) => <div key={i} className={`rounded-md ${bg} p-2 text-center text-[6px] font-bold`}><span className="block truncate">{collectionName(collections, i)}</span></div>)}</div></div>;
}

function MiniProductGrid({ products, collections, settings, seller, compact, dark }: { products: any[]; collections: any[]; settings: any; seller: any; compact?: boolean; dark?: boolean }) {
  return <div className={`p-3 ${dark ? 'bg-[#F7A1B5] text-[#241124]' : ''}`}><MiniTitle>Featured Picks</MiniTitle><div className={`mt-2 grid ${compact ? 'grid-cols-4' : 'grid-cols-3'} gap-2`}>{[0,1,2,3,4,5].slice(0, compact ? 4 : 6).map((i) => <div key={i} className="min-w-0 rounded-md bg-white/80 p-1 shadow-sm"><MiniImage src={image(products, collections, settings, seller, i)} className="aspect-square rounded" /><span className="mt-1 block truncate text-[6px] font-black">{productName(products, i)}</span><span className="block text-[6px] font-bold text-rust">{price(products, i)}</span></div>)}</div></div>;
}

function image(products: any[], collections: any[], settings: any, seller: any, index: number) {
  const productImages = [...(products[index]?.product_images || [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || (a.display_order || 0) - (b.display_order || 0));
  return productImages[0]?.image_url || collections[index]?.image_url || settings?.hero_image_url || seller.cover_image_url || '/artisan-hero.png';
}

function productName(products: any[], index: number) {
  return products[index]?.name || ['Signature piece', 'Handmade set', 'Custom gift', 'Limited edit', 'Studio favorite', 'Crafted decor'][index] || 'Handmade piece';
}

function collectionName(collections: any[], index: number) {
  return collections[index]?.name || ['New Arrivals', 'Best Sellers', 'Decor', 'Gifting', 'Custom'][index] || 'Collection';
}

function price(products: any[], index: number) {
  const amount = products[index]?.base_price;
  return amount == null ? 'Quote' : `Rs. ${Number(amount).toLocaleString('en-IN')}`;
}
