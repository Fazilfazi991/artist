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

const categoryImages: Record<string, { src: string; alt: string; position: string }> = {
  'home-decor': { src: '/category-images/home-decor.png', alt: 'Handmade home decor with ceramics, woven basket, plants, and cushion', position: 'center' },
  'kitchen-dining': { src: '/category-images/kitchen-dining.png', alt: 'Handmade kitchen and dining ceramics with wooden serving pieces', position: 'center' },
  'art-prints': { src: '/category-images/art-prints.png', alt: 'Minimal wall art and handmade textile wall hanging', position: 'center' },
  'personalized-gifts': { src: '/category-images/personalized-gifts.png', alt: 'Personalized handmade gift set with monogram mug and carved keepsakes', position: 'center' },
  jewelry: { src: '/category-images/jewelry.png', alt: 'Handmade gold jewelry displayed on soft neutral surfaces', position: 'center' },
  candles: { src: '/category-images/candles.png', alt: 'Hand-poured candles and wax melts styled with dried flowers', position: 'center' },
  'bags-accessories': { src: '/category-images/bags-accessories.png', alt: 'Woven handmade bag and natural accessories', position: 'center' }
};

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
      <section className="relative overflow-hidden border-b border-line">
        <Image src="/artisan-hero.png" alt="Indian artisan arranging handmade products in a warm studio" fill priority sizes="(min-width:1024px) 1200px, 100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/80 to-paper/10" />
        <div className="heritage-container relative z-10 flex min-h-[390px] flex-col justify-center py-10 sm:min-h-[430px] sm:py-12">
          <p className="heritage-label text-rust">Modern Heritage</p>
          <h1 className="mt-5 max-w-3xl font-serif text-5xl font-bold leading-[1.05] text-ink sm:text-7xl">Heritage crafted for modern living.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">Discover unique, customizable pieces directly from India's independent makers. Elevate your home with objects that carry soul and story.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="heritage-button border border-rust bg-rust text-white hover:bg-rust-hover">Shop Collection</Link>
            <Link href="/storefronts" className="heritage-button border border-ink/80 bg-transparent text-ink hover:border-rust hover:text-rust">Meet the Makers</Link>
          </div>
        </div>
        <div className="relative z-10 border-t border-line bg-paper/84 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-3 rounded-lg border border-line bg-paper/72 px-4 py-4 text-sm font-black text-ink shadow-soft sm:grid-cols-2 lg:grid-cols-4">
            <HeroTrustItem icon={<PackageCheck size={18} />} label="Easy 7-day Returns" />
            <HeroTrustItem icon={<CreditCard size={18} />} label="Protected Online Payments" />
            <HeroTrustItem icon={<ShieldCheck size={18} />} label="Secure Payments" />
            <HeroTrustItem icon={<Truck size={18} />} label="Worldwide Shipping" />
          </div>
        </div>
      </section>

      <section className="heritage-container border-b border-line py-16">
        <SectionTitle title="Shop by Category" href="/shop" label="View all categories" />
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-8">
          {categoryItems.map((category) => <CategoryBubble key={category.slug} category={category} />)}
          <Link href="/shop" className="group grid justify-items-center gap-3 text-center text-sm font-extrabold">
            <span className="relative h-20 w-20 overflow-hidden rounded-full bg-surface-high shadow-soft sm:h-24 sm:w-24">
              <Image src="/category-images/all-categories.png" alt="Curated handmade gifts, decor, candles, jewelry, and ceramics" fill sizes="96px" loading="eager" className="object-cover transition duration-500 group-hover:scale-110" />
              <span className="absolute inset-0 bg-ink/18" />
              <span className="absolute inset-0 grid place-items-center text-white"><CircleEllipsis size={30} /></span>
            </span>
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

      <section className="grid grid-cols-2 gap-px bg-rust text-white lg:grid-cols-4">
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
      </section>

      <section className="border-b border-line bg-surface-low px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <TrustBenefit icon={<CreditCard size={21} />} title="Protected Online Payments" copy="Secure, tracked checkout." />
            <TrustBenefit icon={<ShieldCheck size={21} />} title="Secure Checkout" copy="Order details stay protected." />
            <TrustBenefit icon={<PackageCheck size={21} />} title="Easy Returns" copy="Clear returns for eligible orders." />
            <TrustBenefit icon={<Truck size={21} />} title="Fast Delivery" copy="Reliable supported-location shipping." />
            <TrustBenefit icon={<BadgeCheck size={21} />} title="Verified Sellers" copy="Reviewed artisan businesses." />
            <TrustBenefit icon={<Heart size={21} />} title="Customer Support" copy="Help when you need it." />
          </div>
        </div>
      </section>

    </div>
  </main>;
}

function buildCategories(categories: Category[]) {
  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  return fallbackCategories.map(([slug, name]) => {
    const category = bySlug.get(slug) || { slug, name, description: name, accent: 'bg-rust', image: categoryImages[slug] };
    return { ...category, image: categoryImages[slug] || category.image };
  }).slice(0, 7);
}

function SectionTitle({ title, href, label }: { title: string; href: string; label: string }) {
  return <div className="flex items-center justify-between gap-4"><h2 className="font-serif text-4xl font-semibold">{title}</h2><Link href={href} className="hidden items-center gap-1 text-sm font-extrabold text-rust sm:inline-flex">{label} <ArrowRight size={14} /></Link></div>;
}

function TrustBenefit({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <article className="rounded-lg border border-line bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-rust/40">
    <div className="grid h-10 w-10 place-items-center rounded-lg bg-rust-soft text-rust">{icon}</div>
    <h2 className="mt-3 text-[11px] font-black uppercase tracking-[.1em]">{title}</h2>
    <p className="mt-1.5 text-xs leading-5 text-muted">{copy}</p>
  </article>;
}

function HeroTrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <span className="flex items-center justify-center gap-3 text-center sm:justify-start"><span className="text-rust">{icon}</span>{label}</span>;
}

function CategoryBubble({ category }: { category: Category }) {
  return <Link href={`/category/${category.slug}`} className="group grid justify-items-center gap-3 text-center text-sm font-extrabold">
    <span className="relative h-20 w-20 overflow-hidden rounded-full bg-surface-high shadow-soft sm:h-24 sm:w-24">
      <Image src={category.image.src} alt={category.image.alt} fill sizes="96px" loading="eager" className="object-cover transition duration-500 group-hover:scale-110" style={{ objectPosition: category.image.position }} />
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
