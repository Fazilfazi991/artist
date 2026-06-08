import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, PackageCheck, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui";
import { getFeaturedCategories, getProducts } from "@/lib/services/public-marketplace";
import { ShopClient } from "./shop-client";

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([getProducts({ search: params.search || params.q, category: params.category, type: params.type, sort: params.sort }), getFeaturedCategories()]);
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><p className="mb-3 text-xs font-bold text-muted">Home / Shop</p><SectionHeading eyebrow="Shop" title="Shop handmade products" copy="Explore unique handmade products crafted by independent artisans." /><ShopPromos categories={categories} /><ShopClient initialProducts={products} categories={categories} /></main>;
}

function ShopPromos({ categories }: { categories: Awaited<ReturnType<typeof getFeaturedCategories>> }) {
  const featured = categories.slice(0, 6);
  return <section className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_.9fr]">
    <Link href="/shop?sort=newest" className="group relative min-h-[220px] overflow-hidden rounded-2xl border border-line bg-ink p-6 text-white shadow-soft">
      <Image src="/artisan-hero.png" alt="Curated handmade collection" fill sizes="(min-width:1024px) 760px, 100vw" className="object-cover opacity-45 transition duration-500 group-hover:scale-105" />
      <div className="relative z-10 max-w-lg">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1 text-xs font-black uppercase tracking-[.12em]"><Sparkles size={14} /> New arrivals</span>
        <h2 className="plumlet-banner-title mt-5 text-5xl leading-tight">Fresh handmade finds for modern homes.</h2>
        <p className="mt-4 max-w-md leading-7 text-white/80">Explore newly listed decor, gifts, and keepsakes from verified artisan storefronts.</p>
        <span className="mt-6 inline-flex items-center gap-2 font-black">Shop newest pieces <ArrowRight size={16} /></span>
      </div>
    </Link>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      <Link href="/shop?type=bespoke" className="rounded-2xl border border-line bg-rust p-6 text-white shadow-soft transition hover:-translate-y-0.5"><BadgeCheck size={24} /><h3 className="plumlet-banner-title mt-4 text-3xl">Custom orders</h3><p className="mt-2 text-sm leading-6 text-white/80">Request personalized pieces and approve a quote before work begins.</p></Link>
      <Link href="/shop?sort=featured" className="rounded-2xl border border-line bg-surface p-6 shadow-soft transition hover:-translate-y-0.5"><PackageCheck size={24} className="text-rust" /><h3 className="plumlet-banner-title mt-4 text-3xl">Ready to gift</h3><p className="mt-2 text-sm leading-6 text-muted">Find popular products with tracked delivery and protected online payment.</p></Link>
    </div>
    {featured.length ? <div className="rounded-2xl border border-line bg-white p-3 shadow-soft lg:col-span-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-sm font-black uppercase tracking-[.12em] text-muted">Featured categories</span>
        {featured.map((category) => <Link key={category.slug} href={`/category/${category.slug}`} className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-black transition hover:border-rust hover:text-rust">{category.name}</Link>)}
      </div>
    </div> : null}
  </section>;
}
