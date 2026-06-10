import Link from 'next/link';
import { ArrowRight, Heart, Search, ShoppingBag, User } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import type { StorefrontContext } from '@/lib/storefront/storefront-types';
import { CartCountBadge } from '@/components/cart-count';
import { WishlistButton } from '@/components/ui';

const fallback = '/artisan-hero.png';
const img = (value?: string | null) => value || fallback;
const money = (value: number | string | null | undefined) => value == null ? 'Quote required' : `Rs. ${Number(value).toLocaleString('en-IN')}`;
const firstImage = (product: any) => img(product.product_images?.[0]?.image_url);
const productType = (value?: string) => value === 'ready_to_ship' ? 'Ready to ship' : value === 'customized' ? 'Customizable' : 'Made to order';

type Theme = {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  line: string;
  accent: string;
  accentText: string;
  soft: string;
};

const earth: Theme = { bg: 'bg-[#fbf9f4]', surface: 'bg-[#ffffff]', text: 'text-[#1b1c19]', muted: 'text-[#51443e]', line: 'border-[#d5c3ba]', accent: 'bg-[#71472f]', accentText: 'text-[#71472f]', soft: 'bg-[#f5f3ee]' };
const olive: Theme = { bg: 'bg-[#fbf9f4]', surface: 'bg-white', text: 'text-[#1b1c19]', muted: 'text-[#51443e]', line: 'border-[#d5c3ba]', accent: 'bg-[#56624d]', accentText: 'text-[#56624d]', soft: 'bg-[#f0eee9]' };
const blush: Theme = { bg: 'bg-white', surface: 'bg-white', text: 'text-[#241124]', muted: 'text-[#602060]', line: 'border-[#F7A1B5]', accent: 'bg-[#69296A]', accentText: 'text-[#69296A]', soft: 'bg-[#F7A1B5]' };
const gallery: Theme = { bg: 'bg-[#f7f1e7]', surface: 'bg-[#fffdf8]', text: 'text-[#1b1c19]', muted: 'text-[#51443e]', line: 'border-[#d5c3ba]', accent: 'bg-[#30312e]', accentText: 'text-[#71472f]', soft: 'bg-[#e7e1d5]' };
const boutique: Theme = { bg: 'bg-[#f4eadc]', surface: 'bg-[#fffaf2]', text: 'text-[#25150c]', muted: 'text-[#6e5647]', line: 'border-[#d9b98f]', accent: 'bg-[#25150c]', accentText: 'text-[#8c5e45]', soft: 'bg-[#eadac5]' };

type StorefrontStyle = CSSProperties & {
  '--storefront-accent'?: string;
  '--storefront-secondary'?: string;
  '--storefront-bg'?: string;
  '--storefront-text'?: string;
  '--storefront-soft'?: string;
};

function storefrontStyle(context: StorefrontContext): StorefrontStyle {
  const settings = context.settings || {};
  return {
    '--storefront-accent': settings.accent_color || '#69296A',
    '--storefront-secondary': settings.secondary_color || '#F38FA4',
    '--storefront-bg': settings.background_color || '#FFFFFF',
    '--storefront-text': settings.text_color || '#241124',
    '--storefront-soft': settings.secondary_color ? `${settings.secondary_color}33` : '#F7A1B533',
    backgroundColor: settings.background_color || undefined,
    color: settings.text_color || undefined
  };
}

function themed(base: Theme, context: StorefrontContext): Theme {
  if (!context.settings?.accent_color && !context.settings?.secondary_color && !context.settings?.background_color && !context.settings?.text_color) return base;
  return {
    ...base,
    bg: 'bg-[var(--storefront-bg)]',
    soft: 'bg-[var(--storefront-soft)]',
    text: 'text-[var(--storefront-text)]',
    muted: 'text-[var(--storefront-text)]',
    line: 'border-[var(--storefront-secondary)]',
    accent: 'bg-[var(--storefront-accent)]',
    accentText: 'text-[var(--storefront-accent)]'
  };
}

function storefrontShellClass(context: StorefrontContext, theme: Theme) {
  const buttonStyle = ['rounded', 'pill', 'soft-square'].includes(context.settings?.button_style) ? context.settings.button_style : 'rounded';
  const fontPairing = ['friendly', 'editorial', 'minimal'].includes(context.settings?.font_pairing) ? context.settings.font_pairing : 'friendly';
  return `storefront-button-style-${buttonStyle} storefront-font-${fontPairing} ${theme.bg} ${theme.text} font-sans`;
}

function hasSectionRows(context: StorefrontContext) {
  return Array.isArray(context.sections) && context.sections.length > 0;
}

function sectionRow(context: StorefrontContext, type: string) {
  return context.sections?.find((section: any) => section.section_type === type);
}

function sectionVisible(context: StorefrontContext, type: string) {
  if (!hasSectionRows(context)) return true;
  return sectionRow(context, type)?.is_visible !== false;
}

function sectionTitle(context: StorefrontContext, type: string, fallbackTitle: string) {
  return sectionRow(context, type)?.title || fallbackTitle;
}

function sectionContent(context: StorefrontContext, type: string) {
  return sectionRow(context, type)?.content || {};
}

function sectionLimit(context: StorefrontContext, type: string, fallbackLimit: number) {
  const limit = Number(sectionContent(context, type).limit);
  return Number.isFinite(limit) && limit > 0 ? Math.min(limit, 16) : fallbackLimit;
}

function OrderedSections({ context, entries }: { context: StorefrontContext; entries: Array<{ key: string; order: number; render: () => ReactNode }> }) {
  const sorted = [...entries].sort((a, b) => {
    const aOrder = sectionRow(context, a.key)?.display_order ?? a.order;
    const bOrder = sectionRow(context, b.key)?.display_order ?? b.order;
    return aOrder - bOrder;
  });
  return <>{sorted.map((entry) => sectionVisible(context, entry.key) ? <div key={entry.key}>{entry.render()}</div> : null)}</>;
}

function HeroImage({ context, className = '' }: { context: StorefrontContext; className?: string }) {
  return <img src={img(context.settings.hero_image_url || context.seller.cover_image_url)} alt={context.seller.store_name} className={`h-full w-full object-cover ${className}`} />;
}

function StoreNav({ context, theme = earth, centered = false, dark = false }: { context: StorefrontContext; theme?: Theme; centered?: boolean; dark?: boolean }) {
  const store = context.seller.store_slug;
  const text = dark ? 'text-white' : theme.text;
  const muted = dark ? 'text-white/72' : theme.muted;
  const border = dark ? 'border-white/15' : theme.line;
  const bg = dark ? 'bg-[#25150c]/88' : 'bg-[#fbf9f4]/90';

  return <header className={`sticky top-0 z-40 border-b ${border} ${bg} px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-12`}>
    <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4">
      <nav className={`hidden items-center gap-7 text-[12px] font-bold uppercase tracking-[.14em] ${muted} lg:flex`}>
        <Link className={theme.accentText} href={`/artisan/${store}`}>Home</Link>
        <Link href={`/artisan/${store}/products`}>Products</Link>
        <Link href={`/artisan/${store}/collections`}>Collections</Link>
        <Link href={`/artisan/${store}/about`}>About</Link>
        {context.settings.custom_orders_enabled ? <Link href={`/artisan/${store}/custom-order`}>Custom Orders</Link> : null}
      </nav>
      <Link href={`/artisan/${store}`} className={`${centered ? 'lg:absolute lg:left-1/2 lg:-translate-x-1/2' : ''} min-w-0 truncate font-serif text-2xl font-medium ${text}`}>{context.seller.store_name}</Link>
      <div className={`flex items-center gap-4 ${dark ? 'text-white' : theme.accentText}`}>
        <Search size={19} />
        <Heart size={19} className="hidden sm:block" />
        <User size={19} className="hidden sm:block" />
        <Link href="/cart" className="relative" aria-label="Cart"><ShoppingBag size={20} /><CartCountBadge /></Link>
      </div>
    </div>
  </header>;
}

function StoreFooter({ context, theme = earth, dark = false }: { context: StorefrontContext; theme?: Theme; dark?: boolean }) {
  const store = context.seller.store_slug;
  const bg = dark ? 'bg-[#25150c]' : theme.soft;
  const text = dark ? 'text-white' : theme.text;
  const muted = dark ? 'text-white/65' : theme.muted;
  const border = dark ? 'border-white/15' : theme.line;
  return <footer className={`${bg} ${text} border-t ${border} px-4 py-16 sm:px-6 lg:px-12`}>
    <div className="mx-auto grid max-w-screen-2xl gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
      <div>
        <h2 className="font-serif text-3xl font-medium">{context.seller.store_name}</h2>
        <p className={`mt-4 max-w-sm text-sm leading-7 ${muted}`}>{context.seller.short_bio || context.settings.hero_subtitle}</p>
      </div>
      <FooterLinks title="Shop" links={[['Products', `/artisan/${store}/products`], ['Collections', `/artisan/${store}/collections`], ['Custom Orders', `/artisan/${store}/custom-order`]]} muted={muted} />
      <FooterLinks title="Story" links={[['About', `/artisan/${store}/about`], ['Policies', `/artisan/${store}`], ['Contact', `/artisan/${store}`]]} muted={muted} />
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[.16em]">Newsletter</h3>
        <p className={`mt-4 text-sm leading-6 ${muted}`}>New work, studio notes, and collection launches.</p>
        <form className={`mt-5 flex border-b ${border}`}>
          <input className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none" placeholder="Email address" />
          <button className={`text-xs font-bold uppercase tracking-[.14em] ${dark ? 'text-white' : theme.accentText}`} type="button">Join</button>
        </form>
      </div>
    </div>
    <p className={`mx-auto mt-12 max-w-screen-2xl border-t ${border} pt-6 text-xs ${muted}`}>© 2026 {context.seller.store_name}. Crafted with intention.</p>
  </footer>;
}

function FooterLinks({ title, links, muted }: { title: string; links: [string, string][]; muted: string }) {
  return <div><h3 className="text-xs font-bold uppercase tracking-[.16em]">{title}</h3><div className={`mt-4 grid gap-3 text-sm ${muted}`}>{links.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</div></div>;
}

function ProductCard({ product, storeSlug, theme = earth, centered = false, border = false }: { product: any; storeSlug: string; theme?: Theme; centered?: boolean; border?: boolean }) {
  return <article className={`group relative block ${border ? `border ${theme.line} ${theme.surface} p-3` : ''}`}>
    <div className="relative aspect-[3/4] overflow-hidden bg-[#f0eee9]">
      <Link href={`/artisan/${storeSlug}/product/${product.slug}`} className="absolute inset-0 z-10" aria-label={product.name} />
      <img src={firstImage(product)} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      <WishlistButton productId={product.id} productSlug={product.slug} className="absolute right-3 top-3 z-30 h-9 w-9 rounded-full bg-white shadow-soft" iconSize={16} />
    </div>
    <div className={`pt-4 ${centered ? 'text-center' : ''}`}>
      <p className={`text-[11px] font-bold uppercase tracking-[.14em] ${theme.accentText}`}>{product.categories?.name || productType(product.product_type)}</p>
      <Link href={`/artisan/${storeSlug}/product/${product.slug}`} className="mt-2 block line-clamp-2 font-serif text-xl font-medium hover:opacity-75">{product.name}</Link>
      <p className={`mt-2 text-sm font-bold ${theme.muted}`}>{money(product.base_price)}</p>
    </div>
  </article>;
}

function ProductGrid({ context, title, theme = earth, centered = false, border = false, limit = 8, offset = 0 }: { context: StorefrontContext; title: string; theme?: Theme; centered?: boolean; border?: boolean; limit?: number; offset?: number }) {
  const products = context.products.slice(offset, offset + sectionLimit(context, 'featured_products', limit));
  const heading = sectionTitle(context, 'featured_products', title);
  return <section className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-12 lg:py-16">
    <div className="mb-7 flex items-end justify-between gap-5">
      <h2 className={`font-serif text-4xl font-medium ${theme.accentText}`}>{heading}</h2>
      <Link href={`/artisan/${context.seller.store_slug}/products`} className={`hidden text-xs font-bold uppercase tracking-[.14em] ${theme.muted} sm:inline-flex`}>View All</Link>
    </div>
    {products.length ? <div className="grid grid-cols-2 gap-5 md:grid-cols-4 lg:gap-7">{products.map((product: any) => <ProductCard key={product.id} product={product} storeSlug={context.seller.store_slug} theme={theme} centered={centered} border={border} />)}</div> : <div className={`border ${theme.line} ${theme.surface} p-8 ${theme.muted}`}>No live products yet.</div>}
  </section>;
}

function CollectionCards({ context, theme = earth, shape = 'rect' }: { context: StorefrontContext; theme?: Theme; shape?: 'rect' | 'circle' | 'banner' }) {
  if (!context.collections.length) return null;
  const store = context.seller.store_slug;
  const layout = sectionContent(context, 'collections').layout;
  const resolvedShape = layout === 'circles' ? 'circle' : layout === 'banners' ? 'banner' : shape;
  const limit = sectionLimit(context, 'collections', 5);
  return <section id="collections" className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-12 lg:py-16">
    <div className="mb-7 flex items-end justify-between gap-5">
      <h2 className={`font-serif text-4xl font-medium ${theme.accentText}`}>{sectionTitle(context, 'collections', 'Collections')}</h2>
      <Link href={`/artisan/${store}/collections`} className={`text-xs font-bold uppercase tracking-[.14em] ${theme.muted}`}>View all</Link>
    </div>
    <div className={resolvedShape === 'circle' ? 'grid grid-cols-2 gap-8 text-center sm:grid-cols-5' : resolvedShape === 'banner' ? 'grid gap-5 md:grid-cols-3' : 'grid grid-cols-2 gap-5 md:grid-cols-4'}>
      {context.collections.slice(0, limit).map((collection: any, index: number) => {
        const src = img(collection.image_url || context.products[index]?.product_images?.[0]?.image_url || context.settings.hero_image_url || context.seller.cover_image_url);
        return <Link key={collection.id} href={`/artisan/${store}/collections/${collection.slug}`} className="group block">
          <div className={`${resolvedShape === 'circle' ? 'mx-auto h-28 w-28 rounded-full' : resolvedShape === 'banner' ? 'aspect-[16/9]' : 'aspect-[4/3]'} overflow-hidden bg-[#f0eee9]`}>
            <img src={src} alt={collection.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          </div>
          <span className={`mt-4 block text-sm font-bold ${theme.text}`}>{collection.name}</span>
        </Link>;
      })}
    </div>
  </section>;
}

function ProcessBand({ context, theme = earth, dark = false }: { context: StorefrontContext; theme?: Theme; dark?: boolean }) {
  const steps = ['Sourced carefully', 'Made by hand', 'Finished slowly'];
  return <section className={`${dark ? 'bg-white/8 text-white' : `${theme.soft} ${theme.text}`} px-4 py-16 sm:px-6 lg:px-12`}>
    <div className="mx-auto max-w-screen-xl text-center">
      <h2 className="font-serif text-4xl font-medium">{sectionTitle(context, 'process', 'Our Philosophy')}</h2>
      <div className={`mx-auto mt-6 h-px w-16 ${dark ? 'bg-white/25' : 'bg-[#d5c3ba]'}`} />
      <div className="mt-12 grid gap-10 md:grid-cols-3">
        {steps.map((step) => <div key={step}>
          <div className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${dark ? 'bg-white/12' : 'bg-white'} ${theme.accentText}`}>{step.slice(0, 1)}</div>
          <h3 className="mt-5 font-serif text-2xl font-medium">{step}</h3>
          <p className={`mt-3 text-sm leading-7 ${dark ? 'text-white/70' : theme.muted}`}>{context.settings.craft_process_content || 'Every piece is shaped with attention, patience, and respect for material.'}</p>
        </div>)}
      </div>
    </div>
  </section>;
}

function CustomCta({ context, theme = earth, dark = false, title = 'Have something custom in mind?', button = 'Request Custom Order' }: { context: StorefrontContext; theme?: Theme; dark?: boolean; title?: string; button?: string }) {
  if (!context.settings.custom_orders_enabled) return null;
  const content = sectionContent(context, 'custom_cta');
  return <section className={`${dark ? 'bg-[#30312e] text-white' : `${theme.soft} ${theme.text}`} px-4 py-8 sm:px-6 lg:px-12`}>
    <div className="mx-auto flex max-w-screen-xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="font-serif text-3xl font-medium">{sectionTitle(context, 'custom_cta', title)}</h2><p className={`mt-2 max-w-2xl text-sm leading-7 ${dark ? 'text-white/70' : theme.muted}`}>{content.subtitle || context.settings.custom_order_policy_note || 'Share references, measurements, files, videos, and links. We will review and quote your piece.'}</p></div>
      <Link href={`/artisan/${context.seller.store_slug}/custom-order`} className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded px-6 py-3 text-xs font-bold uppercase tracking-[.14em] ${dark ? 'bg-white text-[#30312e]' : `${theme.accent} text-white`}`}>{context.settings.custom_order_cta_text || content.buttonLabel || button}</Link>
    </div>
  </section>;
}

function StoryQuote({ context, theme = earth, imageLeft = false, dark = false }: { context: StorefrontContext; theme?: Theme; imageLeft?: boolean; dark?: boolean }) {
  const text = context.settings.artisan_story || context.seller.full_story || context.seller.short_bio;
  return <section className={`mx-auto grid max-w-screen-2xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-12 lg:py-24 ${dark ? 'text-white' : theme.text}`}>
    {imageLeft ? <img src={img(context.seller.profile_image_url || context.settings.hero_image_url)} alt="" className="aspect-[4/3] h-full w-full object-cover" /> : null}
    <div className={`${dark ? 'bg-white/10' : theme.surface} border ${dark ? 'border-white/15' : theme.line} p-8 lg:p-12`}>
      <p className="font-serif text-3xl font-medium leading-snug">"{text}"</p>
      <p className={`mt-6 text-xs font-bold uppercase tracking-[.16em] ${dark ? 'text-white/70' : theme.accentText}`}>{context.seller.store_name}</p>
    </div>
    {!imageLeft ? <img src={img(context.settings.hero_image_url || context.seller.cover_image_url)} alt="" className="aspect-[4/3] h-full w-full object-cover" /> : null}
  </section>;
}

export function WarmEditorialTemplate({ context }: { context: StorefrontContext }) {
  const theme = themed(earth, context);
  return <main style={storefrontStyle(context)} className={storefrontShellClass(context, theme)}>
    <div className="bg-[#78422d] px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[.16em] text-white">Free shipping on domestic orders above Rs. 999</div>
    <StoreNav context={context} theme={theme} centered />
    <section className="grid min-h-[82vh] md:grid-cols-2">
      <div className={`${theme.soft} order-2 flex items-center px-4 py-16 sm:px-8 lg:px-12 md:order-1`}>
        <div className="mx-auto max-w-xl md:mr-0">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#78422d]">{context.seller.store_name}</p>
          <h1 className="plumlet-banner-title mt-6 text-5xl leading-[1.08] sm:text-6xl">{context.settings.hero_title || 'Rooted in craft. Inspired by nature.'}</h1>
          <p className={`${theme.muted} mt-7 max-w-md text-lg leading-8`}>{context.settings.hero_subtitle || context.seller.short_bio}</p>
          <Link href={`/artisan/${context.seller.store_slug}/collections`} className={`${theme.accent} mt-9 inline-flex rounded px-8 py-4 text-xs font-bold uppercase tracking-[.14em] text-white`}>Explore Collections</Link>
        </div>
      </div>
      <div className="order-1 min-h-[48vh] md:order-2"><HeroImage context={context} /></div>
    </section>
    <OrderedSections context={context} entries={[
      { key: 'process', order: 10, render: () => <ProcessBand context={context} theme={theme} /> },
      { key: 'collections', order: 20, render: () => <CollectionCards context={context} theme={theme} /> },
      { key: 'featured_products', order: 30, render: () => <ProductGrid context={context} title="Featured Pieces" theme={theme} border /> },
      { key: 'custom_cta', order: 40, render: () => <CustomCta context={context} theme={theme} /> },
      { key: 'story', order: 50, render: () => <StoryQuote context={context} theme={theme} /> }
    ]} />
    <StoreFooter context={context} theme={theme} />
  </main>;
}

export function CleanGridTemplate({ context }: { context: StorefrontContext }) {
  const theme = themed(olive, context);
  return <main style={storefrontStyle(context)} className={storefrontShellClass(context, theme)}>
    <div className={`${theme.soft} px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[.16em]`}>Free shipping on all orders above Rs. 999</div>
    <StoreNav context={context} theme={theme} />
    <header className="mx-auto flex max-w-screen-xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-12 lg:py-28">
      <h1 className={`${theme.accentText} plumlet-banner-title max-w-3xl text-5xl leading-tight sm:text-6xl`}>{context.settings.hero_title || 'Handmade pieces, made to be loved.'}</h1>
      <p className={`${theme.muted} mt-6 max-w-xl text-lg leading-8`}>{context.settings.hero_subtitle || context.seller.short_bio}</p>
      <Link href={`/artisan/${context.seller.store_slug}/products`} className={`${theme.accent} mt-8 rounded px-8 py-4 text-xs font-bold uppercase tracking-[.14em] text-white`}>Shop the Collection</Link>
    </header>
    <OrderedSections context={context} entries={[
      { key: 'featured_products', order: 20, render: () => <ProductGrid context={context} title="Best Sellers" theme={theme} centered limit={8} /> },
      { key: 'collections', order: 30, render: () => <CollectionCards context={context} theme={theme} shape="circle" /> },
      { key: 'custom_cta', order: 40, render: () => <CustomCta context={context} theme={theme} title="Need a different size or finish?" /> }
    ]} />
    <StoreFooter context={context} theme={theme} />
  </main>;
}

export function PersonalizedGiftsTemplate({ context }: { context: StorefrontContext }) {
  const theme = themed(blush, context);
  return <main style={storefrontStyle(context)} className={storefrontShellClass(context, theme)}>
    <StoreNav context={context} theme={theme} centered />
    <section className="mx-auto grid max-w-screen-2xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-12 lg:py-24">
      <div className="flex flex-col justify-center">
        <p className={`${theme.accentText} text-xs font-bold uppercase tracking-[.18em]`}>Heartfelt Studio</p>
        <h1 className="plumlet-banner-title mt-6 max-w-xl text-5xl leading-tight sm:text-6xl">{context.settings.hero_title || 'Make every moment truly theirs.'}</h1>
        <p className={`${theme.muted} mt-6 max-w-lg text-lg leading-8`}>{context.settings.hero_subtitle || context.seller.short_bio}</p>
        <Link href={`/artisan/${context.seller.store_slug}/custom-order`} className={`${theme.accent} mt-8 w-fit rounded px-8 py-4 text-xs font-bold uppercase tracking-[.14em] text-white`}>Start a Gift Brief</Link>
      </div>
      <div className="min-h-[440px] overflow-hidden rounded-lg"><HeroImage context={context} /></div>
    </section>
    <section className={`${theme.soft} px-4 py-14 sm:px-6 lg:px-12`}>
      <div className="mx-auto max-w-screen-xl">
        <h2 className="text-center font-serif text-4xl font-medium">How personalization works</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-4">{['Choose a piece', 'Add names or references', 'Approve the details', 'Receive your gift'].map((step, index) => <div key={step} className="rounded-lg bg-white p-6 text-center"><span className={`${theme.accent} mx-auto grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white`}>{index + 1}</span><strong className="mt-4 block">{step}</strong></div>)}</div>
      </div>
    </section>
    <OrderedSections context={context} entries={[
      { key: 'collections', order: 20, render: () => <CollectionCards context={context} theme={theme} shape="circle" /> },
      { key: 'featured_products', order: 30, render: () => <ProductGrid context={context} title="Popular Personalized Gifts" theme={theme} centered border /> },
      { key: 'custom_cta', order: 40, render: () => <CustomCta context={context} theme={theme} title="Have a custom gift in mind?" button="Request Custom Gift" /> }
    ]} />
    <StoreFooter context={context} theme={theme} />
  </main>;
}

export function VisualPortfolioTemplate({ context }: { context: StorefrontContext }) {
  const theme = themed(gallery, context);
  const products = context.products.slice(0, 6);
  return <main style={storefrontStyle(context)} className={storefrontShellClass(context, theme)}>
    <StoreNav context={context} theme={theme} dark />
    <section className="relative min-h-[76vh] overflow-hidden bg-[#30312e] text-white">
      <HeroImage context={context} className="absolute inset-0 opacity-58" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#30312e]/90 via-[#30312e]/55 to-transparent" />
      <div className="relative z-10 mx-auto flex min-h-[76vh] max-w-screen-2xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-12">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-white/70">Visual Portfolio</p>
        <h1 className="plumlet-banner-title mt-6 max-w-2xl text-5xl leading-tight sm:text-7xl">{context.settings.hero_title || 'Art that brings texture to life.'}</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">{context.settings.hero_subtitle || context.seller.short_bio}</p>
      </div>
    </section>
    <section className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-12 lg:py-24">
      <div className="mb-10 flex items-end justify-between"><h2 className="font-serif text-4xl font-medium">Portfolio Highlights</h2><Link href={`/artisan/${context.seller.store_slug}/products`} className="text-xs font-bold uppercase tracking-[.14em] text-[#71472f]">View all</Link></div>
      <div className="grid gap-5 md:grid-cols-4">{products.map((product: any, index: number) => <Link key={product.id} href={`/artisan/${context.seller.store_slug}/product/${product.slug}`} className={`${index === 1 ? 'md:col-span-2 md:row-span-2' : ''} group overflow-hidden bg-[#e7e1d5]`}><img src={firstImage(product)} alt={product.name} className="h-full min-h-64 w-full object-cover transition duration-700 group-hover:scale-105" /></Link>)}</div>
    </section>
    <OrderedSections context={context} entries={[
      { key: 'story', order: 20, render: () => <StoryQuote context={context} theme={theme} imageLeft /> },
      { key: 'featured_products', order: 30, render: () => <ProductGrid context={context} title="Selected Pieces" theme={theme} border limit={6} /> },
      { key: 'custom_cta', order: 40, render: () => <CustomCta context={context} theme={theme} dark title="Have a custom project in mind?" button="Enquire Now" /> }
    ]} />
    <StoreFooter context={context} theme={theme} />
  </main>;
}

export function BoutiqueBrandTemplate({ context }: { context: StorefrontContext }) {
  const theme = themed(boutique, context);
  return <main style={storefrontStyle(context)} className={storefrontShellClass(context, theme)}>
    <StoreNav context={context} theme={theme} centered dark />
    <section className="relative min-h-[78vh] overflow-hidden bg-[#25150c] text-white">
      <HeroImage context={context} className="absolute inset-0 opacity-55" />
      <div className="absolute inset-0 bg-[#25150c]/45" />
      <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-screen-2xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-12">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#d9b98f]">Atelier Collection</p>
        <h1 className="plumlet-banner-title mt-6 max-w-xl text-5xl leading-tight sm:text-7xl">{context.settings.hero_title || 'Curated with intention. Made to be cherished.'}</h1>
        <p className="mt-6 max-w-lg text-lg leading-8 text-white/72">{context.settings.hero_subtitle || context.seller.short_bio}</p>
        <Link href={`/artisan/${context.seller.store_slug}/products`} className="mt-9 w-fit rounded bg-[#c59042] px-8 py-4 text-xs font-bold uppercase tracking-[.14em] text-white">Shop Collection</Link>
      </div>
    </section>
    <OrderedSections context={context} entries={[
      { key: 'collections', order: 20, render: () => <CollectionCards context={context} theme={theme} shape="banner" /> },
      { key: 'featured_products', order: 30, render: () => <ProductGrid context={context} title="Featured Picks" theme={theme} centered limit={4} /> },
      { key: 'process', order: 35, render: () => <section className="mx-auto grid max-w-screen-2xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-12 lg:py-24">
        <div className="bg-[#25150c] p-8 text-white lg:p-12">
          <h2 className="font-serif text-4xl font-medium">{sectionTitle(context, 'process', 'Our Philosophy')}</h2>
          <p className="mt-6 leading-8 text-white/75">{context.settings.artisan_story || context.seller.full_story || context.seller.short_bio}</p>
          <Link href={`/artisan/${context.seller.store_slug}/about`} className="mt-7 inline-flex text-xs font-bold uppercase tracking-[.14em] text-[#d9b98f]">More About Us <ArrowRight size={14} className="ml-2" /></Link>
        </div>
        <img src={img(context.products[1]?.product_images?.[0]?.image_url || context.settings.hero_image_url)} alt="" className="aspect-[16/10] h-full w-full object-cover" />
      </section> },
      { key: 'custom_cta', order: 40, render: () => <CustomCta context={context} theme={theme} title="Commission a signature piece" /> }
    ]} />
    <StoreFooter context={context} theme={theme} dark />
  </main>;
}
