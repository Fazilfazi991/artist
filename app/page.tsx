import { ArtisanCards, CategoryCards, Hero, OccasionCards, ProductGrid, SectionHeading, SellerCTA, StorySection, TrustStrip, ButtonLink } from "@/components/ui";
import { products } from "@/lib/seed";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <TrustStrip />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><SectionHeading eyebrow="Shop by category" title="Find pieces by craft, room, and occasion" action={<ButtonLink href="/shop" variant="text">View all categories <span>View</span></ButtonLink>} /><CategoryCards /></section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><SectionHeading eyebrow="Thoughtfully made" title="Thoughtfully made, just for you" copy="Handpicked handmade products from talented artisans across India." action={<ButtonLink href="/shop" variant="text">View all products <span>View</span></ButtonLink>} /><ProductGrid items={products.slice(0, 4)} /></section>
      <StorySection />
      <section className="bg-sand/70 px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[.9fr_1.1fr]"><div><p className="text-xs font-black uppercase tracking-[.12em] text-rust">Personalized gifts</p><h2 className="mt-2 font-serif text-4xl leading-tight">Made for your moments</h2><p className="mt-4 leading-7 text-muted">Personalize names, messages, colors, packaging, and more with select artisan products.</p><div className="mt-6"><ButtonLink href="/shop">Explore personalized gifts</ButtonLink></div></div><div className="grid grid-cols-2 gap-3 md:grid-cols-5">{["Name boards", "Scrapbooks", "Gift hampers", "Printed frames", "Custom candles"].map((item) => <div key={item} className="rounded-lg border border-line bg-white p-4 text-sm font-black shadow-soft">{item}</div>)}</div></div></section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><SectionHeading eyebrow="Occasions" title="Shop by occasion" /><OccasionCards /></section>
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow="How it works" title="Simple enough for gifting, clear enough for custom work" /><div className="grid gap-4 md:grid-cols-3">{[["Discover", "Browse products and artisan storefronts."], ["Personalize", "Choose ready-made pieces or submit custom requests."], ["Receive", "Track your order while the artisan prepares your item."]].map(([title, copy], index) => <article key={title} className="rounded-lg border border-line bg-paper p-6"><span className="text-sm font-black text-rust">0{index + 1}</span><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-2 leading-7 text-muted">{copy}</p></article>)}</div></div></section>
      <SellerCTA />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"><SectionHeading eyebrow="Trusted early voices" title="Built around real maker stories" /><div className="grid gap-4 md:grid-cols-3">{["The storefront feels more professional than sending only photos on chat.", "I can understand timelines before ordering a custom gift.", "The artisan story makes the purchase feel personal."].map((quote) => <blockquote key={quote} className="rounded-lg border border-line bg-white p-6 font-serif text-xl leading-snug">"{quote}"</blockquote>)}</div></section>
    </main>
  );
}

