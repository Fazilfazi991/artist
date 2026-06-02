import Link from 'next/link';
import type { StorefrontContext } from '@/lib/storefront/storefront-types';
import { CartCountBadge } from '@/components/cart-count';

const img = (value?: string | null) => value || '/artisan-hero.png';
const money = (value: number | string | null | undefined) => value == null ? 'Quote required' : `Rs. ${Number(value).toLocaleString('en-IN')}`;
const firstImage = (product: any) => img(product.product_images?.[0]?.image_url);
const productType = (value?: string) => value === 'ready_to_ship' ? 'Ready to ship' : value === 'customized' ? 'Customizable' : 'Made to order';

function policyText(context: StorefrontContext) {
  return [
    context.settings.shipping_policy || 'Shipping timelines are shared before checkout.',
    context.settings.return_policy || 'Returns are handled with care based on product type.',
    context.settings.production_timeline_note || 'Handmade timelines vary by piece.'
  ];
}

function StoreNav({ context, dark = false, compact = false }: { context: StorefrontContext; dark?: boolean; compact?: boolean }) {
  const cls = dark ? 'border-white/10 bg-[#21160f]/88 text-white' : 'border-line bg-white/90 text-ink';
  return <header className={`sticky top-0 z-30 border-b px-4 py-3 backdrop-blur sm:px-6 lg:px-8 ${cls}`}>
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
      <Link href={`/artisan/${context.seller.store_slug}`} className="flex min-w-0 items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-sand text-sm font-black text-rust">
          {context.settings.logo_url ? <img src={context.settings.logo_url} alt={context.seller.store_name} className="h-full w-full object-cover" /> : context.seller.store_name?.[0]}
        </span>
        <span className="min-w-0"><strong className="block truncate font-serif text-lg">{context.seller.store_name}</strong><span className="hidden text-[11px] font-bold text-muted sm:block">{context.seller.city}, {context.seller.state}</span></span>
      </Link>
      <nav className={`flex items-center gap-3 text-xs font-black ${compact ? 'sm:gap-4' : 'sm:gap-5'}`}>
        <Link href={`/artisan/${context.seller.store_slug}`}>Home</Link>
        <Link href={`/artisan/${context.seller.store_slug}/collections`}>Collections</Link>
        <Link href={`/artisan/${context.seller.store_slug}/products`}>Shop</Link>
        {context.settings.custom_orders_enabled ? <Link className="hidden sm:inline" href={`/artisan/${context.seller.store_slug}/custom-order`}>Custom Order</Link> : null}
        <Link href="/cart" className="relative rounded-md border border-current/20 px-2 py-1">Cart<CartCountBadge /></Link>
      </nav>
    </div>
  </header>;
}

function ProductCard({ product, storeSlug, dark = false, compact = false }: { product: any; storeSlug: string; dark?: boolean; compact?: boolean }) {
  return <Link href={`/artisan/${storeSlug}/product/${product.slug}`} className={`group block overflow-hidden rounded-lg border ${dark ? 'border-white/10 bg-white/8' : 'border-line bg-white'}`}>
    <div className={`overflow-hidden ${compact ? 'aspect-[4/3]' : 'aspect-square'}`}><img src={firstImage(product)} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div>
    <div className="p-3 sm:p-4">
      <p className={`text-[11px] font-black uppercase ${dark ? 'text-white/55' : 'text-rust'}`}>{product.categories?.name || productType(product.product_type)}</p>
      <h3 className={`mt-1 line-clamp-2 min-h-10 text-sm font-black ${dark ? 'text-white' : 'text-ink'}`}>{product.name}</h3>
      <p className={`mt-2 text-sm font-black ${dark ? 'text-[#e8cbaa]' : 'text-rust'}`}>{money(product.base_price)}</p>
    </div>
  </Link>;
}

function CollectionCards({ context, shape = 'rect', dark = false }: { context: StorefrontContext; shape?: 'rect' | 'circle' | 'banner'; dark?: boolean }) {
  if (!context.collections.length) return null;
  const base = shape === 'circle' ? 'grid grid-cols-2 gap-4 sm:grid-cols-5' : shape === 'banner' ? 'grid gap-4 md:grid-cols-3' : 'grid grid-cols-2 gap-3 sm:grid-cols-4';
  return <div className={base}>{context.collections.slice(0, 5).map((collection: any, index: number) => <Link key={collection.id} href={`/artisan/${context.seller.store_slug}/collections/${collection.slug}`} className={shape === 'circle' ? 'group grid justify-items-center gap-2 text-center text-sm font-black' : `group overflow-hidden rounded-lg border ${dark ? 'border-white/10 bg-white/8 text-white' : 'border-line bg-white'}`}>
    {shape === 'circle' ? <span className="relative h-20 w-20 overflow-hidden rounded-full bg-sand shadow-soft"><img src={img(collection.image_url || context.products[index]?.product_images?.[0]?.image_url || context.settings.hero_image_url || context.seller.cover_image_url)} alt={collection.name} className="h-full w-full object-cover transition group-hover:scale-105" /></span> : <div className={shape === 'banner' ? 'aspect-[16/9] overflow-hidden' : 'aspect-[4/3] overflow-hidden'}><img src={img(collection.image_url || context.products[index]?.product_images?.[0]?.image_url || context.settings.hero_image_url || context.seller.cover_image_url)} alt={collection.name} className="h-full w-full object-cover transition group-hover:scale-105" /></div>}
    <span className={shape === 'circle' ? '' : 'block p-3 text-sm font-black'}>{collection.name}</span>
  </Link>)}</div>;
}

function Newsletter({ dark = false }: { dark?: boolean }) {
  return <section className={`${dark ? 'bg-[#21160f] text-white' : 'bg-[#fff7ec]'} px-4 py-8 sm:px-6 lg:px-8`}>
    <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div><h2 className="font-serif text-2xl">Be the first to know</h2><p className={`mt-1 text-sm ${dark ? 'text-white/65' : 'text-muted'}`}>New collections, stories, and exclusive offers.</p></div>
      <form className="flex max-w-md overflow-hidden rounded-lg border border-line bg-white"><input className="min-w-0 flex-1 px-4 text-sm outline-none" placeholder="Enter your email" /><button type="button" className="bg-rust px-4 py-3 text-sm font-black text-white">Subscribe</button></form>
    </div>
  </section>;
}

function StoreFooter({ context, dark = false }: { context: StorefrontContext; dark?: boolean }) {
  const cls = dark ? 'border-white/10 bg-[#1a100b] text-white' : 'border-line bg-white';
  return <footer className={`border-t px-4 py-8 sm:px-6 lg:px-8 ${cls}`}>
    <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div><h2 className="font-serif text-2xl">{context.seller.store_name}</h2><p className={`mt-2 text-sm leading-6 ${dark ? 'text-white/65' : 'text-muted'}`}>{context.seller.short_bio}</p></div>
      <FooterCol title="Shop" dark={dark} links={[['All Products', `/artisan/${context.seller.store_slug}/products`], ['Collections', `/artisan/${context.seller.store_slug}/collections`], ['New Arrivals', `/artisan/${context.seller.store_slug}/products`]]} />
      <FooterCol title="Information" dark={dark} links={[['About Us', `/artisan/${context.seller.store_slug}/about`], ['Shipping', `/artisan/${context.seller.store_slug}`], ['Returns', `/artisan/${context.seller.store_slug}`]]} />
      <div><h3 className="font-black">Connect</h3><div className={`mt-3 grid gap-2 text-sm ${dark ? 'text-white/65' : 'text-muted'}`}>{context.socialLinks.length ? context.socialLinks.map((link: any) => <a key={link.id} href={link.url}>{link.platform}</a>) : <span>{context.settings.contact_email || context.seller.store_name}</span>}</div></div>
    </div>
    <p className={`mx-auto mt-8 max-w-7xl border-t pt-4 text-xs ${dark ? 'border-white/10 text-white/45' : 'border-line text-muted'}`}>© 2026 {context.seller.store_name}. All rights reserved.</p>
  </footer>;
}

function FooterCol({ title, links, dark }: { title: string; links: [string, string][]; dark?: boolean }) {
  return <div><h3 className="font-black">{title}</h3><div className={`mt-3 grid gap-2 text-sm ${dark ? 'text-white/65' : 'text-muted'}`}>{links.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</div></div>;
}

function ProcessBand({ context, dark = false }: { context: StorefrontContext; dark?: boolean }) {
  const items = ['Clay Preparation', 'Hand Shaping', 'Polishing', 'Packing'];
  return <section className={`${dark ? 'bg-white/8' : 'bg-[#f2dfc8]'} px-4 py-8 sm:px-6 lg:px-8`}>
    <div className="mx-auto max-w-7xl">
      <h2 className="text-center font-serif text-2xl">The Art of Making</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-4">{items.map((item, index) => <div key={item} className="text-center text-sm"><div className="mx-auto grid h-9 w-9 place-items-center rounded-full border border-rust/30 font-black text-rust">{index + 1}</div><strong className="mt-2 block">{item}</strong><p className={`${dark ? 'text-white/60' : 'text-muted'}`}>{context.settings.craft_process_content || 'Carefully finished by hand.'}</p></div>)}</div>
    </div>
  </section>;
}

export function WarmEditorialTemplate({ context }: { context: StorefrontContext }) {
  return <main className="bg-[#fbf1e4] text-[#2b211b]">
    <StoreNav context={context} />
    <section className="mx-auto grid max-w-7xl overflow-hidden bg-[#ead1b4] lg:grid-cols-[.82fr_1.18fr]">
      <div className="flex min-h-[420px] flex-col justify-center px-6 py-12 sm:px-10"><h1 className="font-serif text-5xl leading-tight lg:text-6xl">{context.settings.hero_title || `Handmade with earth, crafted with love.`}</h1><p className="mt-5 max-w-sm text-sm leading-6 text-muted">{context.settings.hero_subtitle || context.seller.short_bio}</p><Link href={`/artisan/${context.seller.store_slug}/collections`} className="mt-7 w-fit rounded-md bg-rust px-5 py-3 text-sm font-black text-white">Explore Collections</Link></div>
      <img src={img(context.settings.hero_image_url || context.seller.cover_image_url)} alt={context.seller.store_name} className="h-full min-h-[420px] w-full object-cover" />
    </section>
    <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:px-8"><div><h2 className="font-serif text-2xl">Our Story</h2><p className="mt-3 text-sm leading-7 text-muted">{context.settings.about_content || context.seller.full_story || context.seller.short_bio}</p><Link href={`/artisan/${context.seller.store_slug}/about`} className="mt-3 inline-block text-sm font-black text-rust">Know More</Link></div><img src={img(context.products[0]?.product_images?.[0]?.image_url || context.settings.hero_image_url)} alt="" className="aspect-[16/7] w-full rounded-lg object-cover" /></section>
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"><div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-2xl">Shop by Collection</h2><Link href={`/artisan/${context.seller.store_slug}/collections`} className="text-xs font-black text-rust">View all</Link></div><CollectionCards context={context} /></section>
    <ProcessBand context={context} />
    <ProductSection context={context} title="Featured Products" />
    {context.settings.custom_orders_enabled ? <CustomCta context={context} /> : null}
    <QuoteStory context={context} />
    <StoreFooter context={context} />
  </main>;
}

export function CleanGridTemplate({ context }: { context: StorefrontContext }) {
  return <main className="bg-[#fbfbf8] text-ink">
    <StoreNav context={context} compact />
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:px-8"><div className="flex flex-col justify-center"><h1 className="font-serif text-5xl leading-tight">{context.settings.hero_title || 'Minimal pieces. Made to be loved daily.'}</h1><p className="mt-4 max-w-md text-sm leading-7 text-muted">{context.settings.hero_subtitle || context.seller.short_bio}</p><Link href={`/artisan/${context.seller.store_slug}/products`} className="mt-6 w-fit rounded-md bg-sage px-5 py-3 text-sm font-black text-white">Shop Now</Link></div><img src={img(context.settings.hero_image_url || context.seller.cover_image_url)} alt={context.seller.store_name} className="aspect-[16/9] w-full rounded-lg object-cover" /></section>
    <TrustRow items={['Handmade', 'Easy Returns', 'Secure Payment', 'Gift Ready']} />
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-2xl">Shop by Category</h2><Link href={`/artisan/${context.seller.store_slug}/collections`} className="text-xs font-black text-sage">View all</Link></div><CollectionCards context={context} shape="circle" /></section>
    <ProductSection context={context} title="Best Sellers" clean />
    <ProductSection context={context} title="New Arrivals" clean offset={4} />
    <QuoteStory context={context} compact />
    <Newsletter />
    <StoreFooter context={context} />
  </main>;
}

export function PersonalizedGiftsTemplate({ context }: { context: StorefrontContext }) {
  return <main className="bg-[#fff4ee] text-ink">
    <StoreNav context={context} />
    <section className="mx-auto grid max-w-7xl overflow-hidden bg-[#ffe4da] lg:grid-cols-[.9fr_1.1fr]"><div className="flex min-h-[380px] flex-col justify-center px-6 py-10 sm:px-10"><h1 className="font-serif text-5xl leading-tight">{context.settings.hero_title || 'Make every moment truly theirs.'}</h1><p className="mt-4 max-w-md text-sm leading-7 text-muted">{context.settings.hero_subtitle || context.seller.short_bio}</p><Link href={`/artisan/${context.seller.store_slug}/collections`} className="mt-6 w-fit rounded-md bg-[#e36652] px-5 py-3 text-sm font-black text-white">Explore Gifts</Link></div><img src={img(context.settings.hero_image_url || context.seller.cover_image_url)} alt={context.seller.store_name} className="h-full min-h-[380px] w-full object-cover" /></section>
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-2xl">Shop by Occasion</h2><Link href={`/artisan/${context.seller.store_slug}/collections`} className="text-xs font-black text-rust">View all</Link></div><CollectionCards context={context} shape="circle" /></section>
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><h2 className="font-serif text-2xl">How Personalization Works</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{['Choose product', 'Add personalization', 'We create it', 'Delivered to you'].map((item, index) => <div key={item} className="rounded-lg bg-white p-5 text-center"><div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[#ffe0d7] font-black text-rust">{index + 1}</div><strong className="mt-3 block text-sm">{item}</strong><p className="mt-1 text-xs text-muted">Crafted with care from your details.</p></div>)}</div></section>
    <ProductSection context={context} title="Popular Personalized Gifts" />
    {context.settings.custom_orders_enabled ? <CustomCta context={context} title="Have something custom in mind?" button="Request Custom Gift" /> : null}
    <QuoteStory context={context} compact />
    <Newsletter />
    <StoreFooter context={context} />
  </main>;
}

export function VisualPortfolioTemplate({ context }: { context: StorefrontContext }) {
  return <main className="bg-[#f2eadc] text-ink">
    <StoreNav context={context} />
    <section className="relative min-h-[430px] overflow-hidden"><img src={img(context.settings.hero_image_url || context.seller.cover_image_url)} alt={context.seller.store_name} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-[#1f2418]/80 to-transparent" /><div className="relative mx-auto flex min-h-[430px] max-w-7xl flex-col justify-center px-4 py-12 text-white sm:px-6 lg:px-8"><h1 className="max-w-lg font-serif text-5xl leading-tight">{context.settings.hero_title || 'Art that brings texture to life.'}</h1><p className="mt-4 max-w-md text-sm leading-7 text-white/75">{context.settings.hero_subtitle || context.seller.short_bio}</p><Link href={`/artisan/${context.seller.store_slug}/collections`} className="mt-6 w-fit rounded-md bg-white px-5 py-3 text-sm font-black text-ink">Explore Portfolio</Link></div></section>
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-2xl">Portfolio Highlights</h2><Link href={`/artisan/${context.seller.store_slug}/products`} className="text-xs font-black text-rust">View all</Link></div><MasonryProducts context={context} /></section>
    {context.products[0] ? <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8"><div className="rounded-lg bg-[#536036] p-6 text-white"><p className="text-xs font-black uppercase">Featured Project</p><h2 className="mt-2 font-serif text-3xl">{context.products[0].name}</h2><p className="mt-3 text-sm text-white/75">{context.products[0].short_description || context.products[0].description}</p><Link href={`/artisan/${context.seller.store_slug}/product/${context.products[0].slug}`} className="mt-5 inline-block rounded-md bg-white px-4 py-2 text-sm font-black text-ink">View Project</Link></div><img src={firstImage(context.products[0])} alt={context.products[0].name} className="aspect-[16/8] w-full rounded-lg object-cover" /></section> : null}
    <QuoteStory context={context} imageLeft />
    <ProductSection context={context} title="Selected Pieces" large />
    {context.settings.custom_orders_enabled ? <CustomCta context={context} title="Have a custom project in mind?" button="Enquire Now" dark /> : null}
    <StoreFooter context={context} />
  </main>;
}

export function BoutiqueBrandTemplate({ context }: { context: StorefrontContext }) {
  return <main className="bg-[#f7ead9] text-[#28170d]">
    <StoreNav context={context} dark />
    <section className="relative min-h-[470px] overflow-hidden bg-[#25150c] text-white"><img src={img(context.settings.hero_image_url || context.seller.cover_image_url)} alt={context.seller.store_name} className="absolute inset-0 h-full w-full object-cover opacity-55" /><div className="relative mx-auto flex min-h-[470px] max-w-7xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8"><h1 className="max-w-lg font-serif text-5xl leading-tight">{context.settings.hero_title || 'Curated with intention. Made to be cherished.'}</h1><p className="mt-4 max-w-md text-sm leading-7 text-white/75">{context.settings.hero_subtitle || context.seller.short_bio}</p><Link href={`/artisan/${context.seller.store_slug}/collections`} className="mt-6 w-fit rounded-md bg-[#c59042] px-5 py-3 text-sm font-black text-white">Shop Collection</Link></div></section>
    <TrustRow items={['Premium quality', 'Handcrafted', 'Sustainable', 'Gift packaging']} dark />
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-2xl">Our Collections</h2><Link href={`/artisan/${context.seller.store_slug}/collections`} className="text-xs font-black text-rust">View all</Link></div><CollectionCards context={context} shape="banner" /></section>
    <ProductSection context={context} title="Featured Picks" />
    <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8"><div className="rounded-lg bg-[#28170d] p-8 text-white"><h2 className="font-serif text-3xl">Our Philosophy</h2><p className="mt-4 leading-7 text-white/75">{context.settings.artisan_story || context.seller.full_story || context.seller.short_bio}</p><Link href={`/artisan/${context.seller.store_slug}/about`} className="mt-5 inline-block text-sm font-black text-[#d7a45b]">More About Us</Link></div><img src={img(context.products[1]?.product_images?.[0]?.image_url || context.settings.hero_image_url)} alt="" className="aspect-[16/9] w-full rounded-lg object-cover" /></section>
    <ProductSection context={context} title="From the Journal" clean offset={2} />
    <Newsletter dark />
    <StoreFooter context={context} dark />
  </main>;
}

function ProductSection({ context, title, clean = false, large = false, offset = 0 }: { context: StorefrontContext; title: string; clean?: boolean; large?: boolean; offset?: number }) {
  const products = context.products.slice(offset, offset + (large ? 6 : 8));
  return <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-2xl">{title}</h2><Link href={`/artisan/${context.seller.store_slug}/products`} className="text-xs font-black text-rust">View all</Link></div>{products.length ? <div className={`grid gap-4 ${large ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>{products.map((product: any) => <ProductCard key={product.id} product={product} storeSlug={context.seller.store_slug} compact={clean} />)}</div> : <div className="rounded-lg border border-line bg-white p-8 text-muted">No live products yet.</div>}</section>;
}

function MasonryProducts({ context }: { context: StorefrontContext }) {
  const products = context.products.slice(0, 5);
  return <div className="grid gap-4 md:grid-cols-4">{products.map((product: any, index: number) => <Link key={product.id} href={`/artisan/${context.seller.store_slug}/product/${product.slug}`} className={index === 1 ? 'overflow-hidden rounded-lg md:col-span-2 md:row-span-2' : 'overflow-hidden rounded-lg'}><img src={firstImage(product)} alt={product.name} className="h-full min-h-44 w-full object-cover" /></Link>)}</div>;
}

function CustomCta({ context, title = 'Want something custom?', button = 'Order Custom', dark = false }: { context: StorefrontContext; title?: string; button?: string; dark?: boolean }) {
  return <section className={`${dark ? 'bg-[#536036] text-white' : 'bg-[#f0d7bd]'} px-4 py-6 sm:px-6 lg:px-8`}><div className="mx-auto flex max-w-7xl flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left"><div><h2 className="font-serif text-2xl">{title}</h2><p className={`text-sm ${dark ? 'text-white/75' : 'text-muted'}`}>{context.settings.custom_order_policy_note || 'We create personalized pieces just for you.'}</p></div><Link href={`/artisan/${context.seller.store_slug}/custom-order`} className={`inline-flex justify-center rounded-md px-5 py-3 text-sm font-black ${dark ? 'bg-white text-ink' : 'bg-rust text-white'}`}>{context.settings.custom_order_cta_text || button}</Link></div></section>;
}

function QuoteStory({ context, compact = false, imageLeft = false }: { context: StorefrontContext; compact?: boolean; imageLeft?: boolean }) {
  return <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:px-8">
    {imageLeft ? <img src={img(context.seller.profile_image_url || context.settings.hero_image_url)} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" /> : null}
    <div className="rounded-lg bg-white p-6"><p className="font-serif text-2xl leading-snug">"{context.settings.artisan_story || context.seller.full_story || context.seller.short_bio}"</p><p className="mt-4 text-sm font-black text-rust">- {context.seller.store_name}</p></div>
    {!imageLeft && !compact ? <img src={img(context.settings.hero_image_url || context.seller.cover_image_url)} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" /> : null}
  </section>;
}

function TrustRow({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return <section className={`${dark ? 'bg-[#fff7ec]' : 'bg-[#f4f1e8]'} px-4 py-5 sm:px-6 lg:px-8`}><div className="mx-auto grid max-w-7xl gap-3 text-xs font-bold text-muted sm:grid-cols-2 lg:grid-cols-4">{items.map((item) => <span key={item} className="flex items-center justify-center gap-2 text-center"><span className="h-2 w-2 rounded-full bg-rust" />{item}</span>)}</div></section>;
}
