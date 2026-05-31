import { CategoryCards, Hero, OccasionCards, ProductGrid, SectionHeading, SellerCTA, StorySection, TrustStrip, ButtonLink, ArtisanCards } from "@/components/ui";
import { getFeaturedArtisans, getFeaturedCategories, getFeaturedProducts } from "@/lib/services/public-marketplace";

export default async function HomePage() {
  const [categories, products, artisans] = await Promise.all([getFeaturedCategories(), getFeaturedProducts(4), getFeaturedArtisans(3)]);
  return (
    <main>
      <Hero />
      <TrustStrip />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><SectionHeading eyebrow="Shop by category" title="Find pieces by craft, room, and occasion" action={<ButtonLink href="/shop" variant="text">View all categories</ButtonLink>} /><CategoryCards items={categories} /></section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><SectionHeading eyebrow="Thoughtfully made" title="Thoughtfully made, just for you" copy="Handpicked handmade products from talented artisans across India." action={<ButtonLink href="/shop" variant="text">View all products</ButtonLink>} /><ProductGrid items={products} /></section>
      <StorySection artisans={artisans} />
      <section className="bg-sand/70 px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[.9fr_1.1fr]"><div><p className="text-xs font-black uppercase tracking-[.12em] text-rust">Personalized gifts</p><h2 className="mt-2 font-serif text-4xl leading-tight">Made for your moments</h2><p className="mt-4 leading-7 text-muted">Personalize names, messages, colors, packaging, and more with select artisan products.</p><div className="mt-6"><ButtonLink href="/shop?type=customized">Explore personalized gifts</ButtonLink></div></div><div className="grid grid-cols-2 gap-3 md:grid-cols-5">{["Name boards", "Scrapbooks", "Gift hampers", "Printed frames", "Custom candles"].map((item) => <div key={item} className="rounded-lg border border-line bg-white p-4 text-sm font-black shadow-soft">{item}</div>)}</div></div></section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><SectionHeading eyebrow="Occasions" title="Shop by occasion" /><OccasionCards /></section>
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow="How it works" title="Simple enough for gifting, clear enough for custom work" /><div className="grid gap-4 md:grid-cols-3">{[["Discover", "Browse products and artisan storefronts."], ["Personalize", "Choose ready-made pieces or submit custom requests."], ["Receive", "Track your order while the artisan prepares your item."]].map(([title, copy], index) => <article key={title} className="rounded-lg border border-line bg-paper p-6"><span className="text-sm font-black text-rust">0{index + 1}</span><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-2 leading-7 text-muted">{copy}</p></article>)}</div></div></section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><SectionHeading eyebrow="Featured artisans" title="Storefronts artisans can share anywhere" /><ArtisanCards items={artisans} /></section>
      <SellerCTA />
    </main>
  );
}
