import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Boxes, Layers3, Search, SlidersHorizontal } from 'lucide-react';
import type { StorefrontCard, StorefrontDirectoryFilters, StorefrontFilterOptions } from '@/lib/services/storefront-directory';

export function StorefrontDirectory({
  storefronts,
  filterOptions,
  filters
}: {
  storefronts: StorefrontCard[];
  filterOptions: StorefrontFilterOptions;
  filters: StorefrontDirectoryFilters;
}) {
  return <main className="bg-paper">
    <section className="border-b border-line bg-surface-low">
      <div className="heritage-container py-16">
        <p className="heritage-label">Artisan Storefronts</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <h1 className="plumlet-banner-title max-w-3xl text-5xl leading-tight text-ink sm:text-7xl">Discover independent makers and their stories.</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">Browse shareable mini-stores from verified artisans across India. Explore products, collections, custom-order options, and the story behind each craft.</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-5 text-sm font-bold text-muted shadow-soft">
            <div className="flex items-center justify-between"><span>Published storefronts</span><strong className="font-serif text-4xl font-semibold text-ink">{storefronts.length}</strong></div>
            <div className="mt-2 flex items-center justify-between"><span>Verified makers</span><BadgeCheck size={18} className="text-success" /></div>
          </div>
        </div>
      </div>
    </section>

    <section className="heritage-container py-10">
      <form className="grid gap-3 rounded-xl border border-line bg-surface p-4 shadow-soft lg:grid-cols-[1.4fr_repeat(5,minmax(130px,1fr))_auto]">
        <label className="flex min-h-11 items-center gap-2 rounded border border-line bg-paper px-3">
          <Search size={17} className="shrink-0 text-muted" />
          <input name="q" defaultValue={filters.q || ''} placeholder="Search storefront or artisan" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </label>
        <Select name="category" label="Category" value={filters.category} options={filterOptions.categories.map((item) => [item.slug, item.name])} />
        <Select name="state" label="State" value={filters.state} options={filterOptions.states.map((item) => [item, item])} />
        <Select name="city" label="City" value={filters.city} options={filterOptions.cities.map((item) => [item, item])} />
        <Select name="customOrders" label="Custom" value={filters.customOrders} options={[['yes', 'Custom orders']]} />
        <Select name="productType" label="Type" value={filters.productType} options={[['ready', 'Ready to ship'], ['customized', 'Customizable'], ['bespoke', 'Bespoke']]} />
        <div className="flex gap-2">
          <Select name="sort" label="Sort" value={filters.sort} options={[['featured', 'Featured'], ['newest', 'Newest'], ['alphabetical', 'A-Z']]} compact />
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-rust px-4 text-sm font-extrabold text-white"><SlidersHorizontal size={16} />Apply</button>
        </div>
      </form>

      {storefronts.length ? <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {storefronts.map((storefront) => <StorefrontCardView key={storefront.sellerId} storefront={storefront} />)}
      </div> : <EmptyStorefronts />}
    </section>
  </main>;
}

function Select({ name, label, value, options, compact = false }: { name: string; label: string; value?: string; options: [string, string][]; compact?: boolean }) {
  return <label className={compact ? 'grid min-w-[110px]' : 'grid gap-1 text-xs font-extrabold text-muted'}>
    <span className={compact ? 'sr-only' : ''}>{label}</span>
    <select name={name} defaultValue={value || 'all'} className="min-h-11 rounded border border-line bg-paper px-3 text-sm font-bold text-ink outline-none">
      <option value="all">{label}</option>
      {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
    </select>
  </label>;
}

export function StorefrontCardView({ storefront, compact = false }: { storefront: StorefrontCard; compact?: boolean }) {
  return <article className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
    <div className="relative aspect-[16/9] bg-surface-mid">
      <Image src={storefront.coverImage} alt={`${storefront.storeName} storefront cover`} fill sizes={compact ? '320px' : '(min-width:1280px) 33vw, (min-width:768px) 50vw, 100vw'} className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/82 via-ink/28 to-transparent" />
      <div className="absolute bottom-4 left-4 flex items-end gap-3">
        <span className="relative h-16 w-16 overflow-hidden rounded-full border-4 border-surface bg-paper shadow-soft">
          <Image src={storefront.logoImage} alt={`${storefront.storeName} logo`} fill sizes="64px" className="object-cover" />
        </span>
        <span className="pb-1 text-white drop-shadow"><strong className="block text-2xl font-black leading-tight">{storefront.storeName}</strong><span className="text-xs font-extrabold text-white">{storefront.city}, {storefront.state}</span></span>
      </div>
    </div>
    <div className="flex flex-1 flex-col p-5">
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded bg-sage-soft px-2.5 py-1 text-xs font-extrabold text-success"><BadgeCheck size={13} />Verified artisan</span>
        {storefront.customOrdersEnabled ? <span className="rounded bg-rust-soft px-2.5 py-1 text-xs font-extrabold text-rust">Custom orders</span> : null}
      </div>
      <p className="mt-4 text-sm font-bold text-muted">{storefront.artisanName} / {storefront.category}</p>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{storefront.shortBio || storefront.heroTitle}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-bold text-muted">
        <span className="flex items-center gap-2 rounded bg-paper px-3 py-2"><Boxes size={16} className="shrink-0 text-rust" />{storefront.productCount} products</span>
        <span className="flex items-center gap-2 rounded bg-paper px-3 py-2"><Layers3 size={16} className="shrink-0 text-rust" />{storefront.collectionCount} collections</span>
      </div>
      <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
        <Link href={`/artisan/${storefront.storeSlug}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-rust px-3 text-center text-xs font-black text-white transition hover:bg-rust-hover">Visit <ArrowRight size={15} /></Link>
        {storefront.customOrdersEnabled ? <Link href={`/artisan/${storefront.storeSlug}/custom-order`} className="inline-flex min-h-11 items-center justify-center rounded border border-rust bg-white px-3 text-center text-xs font-black leading-tight text-rust transition hover:bg-rust-soft">Custom Order</Link> : null}
      </div>
    </div>
  </article>;
}

function EmptyStorefronts() {
  return <div className="mt-6 rounded-xl border border-dashed border-line bg-surface p-10 text-center">
    <h2 className="font-serif text-3xl font-semibold">No artisan storefronts are available yet.</h2>
    <p className="mx-auto mt-2 max-w-xl leading-7 text-muted">New makers are joining soon. Explore handmade products while we prepare their storefronts.</p>
    <Link href="/shop" className="mt-5 inline-flex rounded bg-rust px-5 py-3 text-sm font-extrabold text-white">Browse Products</Link>
  </div>;
}
