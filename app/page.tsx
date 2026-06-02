import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, CircleEllipsis, CreditCard, Globe2, Heart, PackageCheck, ShieldCheck, Star, Truck, UsersRound } from 'lucide-react';
import { StorefrontCardView } from '@/components/storefront-directory';
import { getFeaturedCategories, getFeaturedProducts } from '@/lib/services/public-marketplace';
import { getFeaturedStorefronts } from '@/lib/services/storefront-directory';
import type { Category, Product } from '@/lib/types';

const fallbackCategories = [
  ['home-decor', 'Home Decor'],
  ['kitchen-dining', 'Kitchen & Dining'],
  ['art-prints', 'Wall Art'],
  ['personalized-gifts', 'Personalised Gifts'],
  ['jewelry', 'Jewelry'],
  ['candles', 'Candles'],
  ['bags-accessories', 'Bags & Accessories']
] as const;

export default async function HomePage() {
  const [categories, products, storefronts] = await Promise.all([
    getFeaturedCategories(),
    getFeaturedProducts(5),
    getFeaturedStorefronts(4)
  ]);

  const categoryItems = buildCategories(categories);
  const productItems = products.length ? products : [];
  const storefrontItems = storefronts.length ? storefronts : [];

  return <main className="bg-paper">
    <div className="overflow-hidden">
      <section className="relative min-h-[680px] overflow-hidden border-b border-line">
        <Image src="/artisan-hero.png" alt="Indian artisan arranging handmade products in a warm studio" fill priority sizes="(min-width:1024px) 1200px, 100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/80 to-paper/10" />
        <div className="heritage-container relative z-10 flex min-h-[680px] flex-col justify-center py-20">
          <p className="heritage-label text-rust">Modern Heritage</p>
          <h1 className="mt-5 max-w-3xl font-serif text-5xl font-bold leading-[1.05] text-ink sm:text-7xl">Heritage crafted for modern living.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">Discover unique, customizable pieces directly from India's independent makers. Elevate your home with objects that carry soul and story.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="heritage-button border border-rust bg-rust text-white hover:bg-rust-hover">Shop Collection</Link>
            <Link href="/storefronts" className="heritage-button border border-ink/80 bg-transparent text-ink hover:border-rust hover:text-rust">Meet the Makers</Link>
          </div>
        </div>
        <div className="relative z-10 grid gap-3 border-t border-line bg-surface/88 px-6 py-6 text-xs font-extrabold uppercase tracking-[.12em] text-muted backdrop-blur sm:grid-cols-2 sm:px-12 lg:grid-cols-4 lg:px-16">
          <TrustItem icon={<Heart size={18} />} label="Handmade with love" />
          <TrustItem icon={<BadgeCheck size={18} />} label="Authentic & Original" />
          <TrustItem icon={<UsersRound size={18} />} label="Supporting Artisans" />
          <TrustItem icon={<ShieldCheck size={18} />} label="Secure Payments" />
        </div>
      </section>

      <section className="heritage-container border-b border-line py-16">
        <SectionTitle title="Shop by Category" href="/shop" label="View all categories" />
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-8">
          {categoryItems.map((category) => <CategoryBubble key={category.slug} category={category} />)}
          <Link href="/shop" className="group grid justify-items-center gap-3 text-center text-sm font-extrabold">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-surface-high text-rust transition group-hover:bg-rust group-hover:text-white sm:h-24 sm:w-24"><CircleEllipsis size={30} /></span>
            <span>All Categories</span>
          </Link>
        </div>
      </section>

      <section className="heritage-container border-b border-line py-16">
        <SectionTitle title="Handpicked Just for You" href="/shop" label="View all products" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {productItems.map((product, index) => <HomeProductCard key={product.slug} product={product} index={index} />)}
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-line">
        <Image src="/artisan-hero.png" alt="Artisan preparing a handmade order" fill sizes="1200px" className="object-cover object-[70%_45%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-sage via-sage/92 to-sage/20" />
        <div className="heritage-container relative z-10 py-24 text-white">
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-sage-soft">Our Mission</p>
          <h2 className="mt-4 max-w-2xl font-serif text-5xl font-semibold leading-tight">Preserving traditions, empowering hands.</h2>
          <p className="mt-5 max-w-xl leading-8 text-white/82">Every purchase helps independent artisans grow their craft, support their families, and keep heritage techniques alive.</p>
          <Link href="/about" className="mt-7 inline-flex min-h-11 items-center justify-center rounded border border-white bg-transparent px-5 text-sm font-extrabold text-white hover:bg-white hover:text-sage">Our Story</Link>
        </div>
      </section>

      <section className="grid gap-px bg-rust text-white sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<UsersRound size={24} />} value="2,500+" label="Artisans Empowered" />
        <Stat icon={<Star size={24} />} value="50,000+" label="Happy Customers" />
        <Stat icon={<PackageCheck size={24} />} value="45,000+" label="Products Sold" />
        <Stat icon={<Globe2 size={24} />} value="28+" label="States Covered" />
      </section>

      <section className="heritage-container border-b border-line py-16">
        <SectionTitle title="Meet the makers behind the craft" href="/storefronts" label="View All Storefronts" />
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Explore independent artisan storefronts, discover their stories, and shop products made with care.</p>
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {storefrontItems.map((storefront) => <StorefrontCardView key={storefront.sellerId} storefront={storefront} compact />)}
        </div>
        <div className="mt-8 grid gap-3 rounded-lg border border-line bg-surface-low px-4 py-4 text-sm font-bold text-muted sm:grid-cols-2 lg:grid-cols-4">
          <TrustItem icon={<PackageCheck size={18} />} label="Easy 7-day Returns" />
          <TrustItem icon={<CreditCard size={18} />} label="Cash on Delivery" />
          <TrustItem icon={<ShieldCheck size={18} />} label="Secure Payments" />
          <TrustItem icon={<Truck size={18} />} label="Worldwide Shipping" />
        </div>
      </section>

    </div>
  </main>;
}

function buildCategories(categories: Category[]) {
  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  return fallbackCategories.map(([slug, name]) => bySlug.get(slug) || { slug, name, description: name, accent: 'bg-rust', image: { src: '/artisan-hero.png', alt: name, position: 'center' } }).slice(0, 7);
}

function SectionTitle({ title, href, label }: { title: string; href: string; label: string }) {
  return <div className="flex items-center justify-between gap-4"><h2 className="font-serif text-4xl font-semibold">{title}</h2><Link href={href} className="hidden items-center gap-1 text-sm font-extrabold text-rust sm:inline-flex">{label} <ArrowRight size={14} /></Link></div>;
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <span className="flex items-center justify-center gap-2 text-center sm:justify-start"><span className="text-rust">{icon}</span>{label}</span>;
}

function CategoryBubble({ category }: { category: Category }) {
  return <Link href={`/category/${category.slug}`} className="group grid justify-items-center gap-3 text-center text-sm font-extrabold">
    <span className="relative h-20 w-20 overflow-hidden rounded-full bg-surface-high shadow-soft sm:h-24 sm:w-24">
      <Image src={category.image.src} alt={category.image.alt} fill sizes="96px" className="object-cover transition duration-500 group-hover:scale-110" style={{ objectPosition: category.image.position }} />
      <span className="absolute inset-0 bg-white/28" />
    </span>
    <span className="leading-tight">{category.name}</span>
  </Link>;
}

function HomeProductCard({ product, index }: { product: Product; index: number }) {
  return <article className="group min-w-0">
    <div className="relative aspect-[1.08] overflow-hidden rounded-lg bg-sand shadow-[0_10px_26px_rgba(42,39,36,.08)]">
      <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10" aria-label={product.title} />
      <Image src={product.images[0]?.src || '/artisan-hero.png'} alt={product.images[0]?.alt || product.title} fill sizes="(min-width:1024px) 220px, 50vw" className="object-cover transition duration-500 group-hover:scale-105" style={{ objectPosition: product.images[0]?.position || 'center' }} />
      {index === 3 ? <span className="absolute left-3 top-3 z-20 rounded bg-success px-2 py-1 text-[11px] font-black text-white">Bestseller</span> : null}
      <button className="absolute bottom-3 right-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-white text-rust shadow-soft" aria-label="Save product"><Heart size={16} /></button>
    </div>
    <Link href={`/product/${product.slug}`} className="mt-3 block truncate font-serif text-lg font-semibold hover:text-rust">{product.title}</Link>
    <p className="mt-1 text-sm font-extrabold">{product.priceLabel}</p>
    <p className="mt-2 flex items-center gap-1 text-xs font-bold text-muted"><Star size={13} className="fill-marigold text-marigold" /> {product.rating.toFixed(1)} ({product.reviewCount || 58})</p>
  </article>;
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return <div className="flex items-center justify-center gap-4 border-white/25 px-5 py-6 lg:border-r lg:last:border-r-0"><span className="text-white/90">{icon}</span><span><strong className="block text-2xl">{value}</strong><span className="text-xs font-semibold text-white/85">{label}</span></span></div>;
}
