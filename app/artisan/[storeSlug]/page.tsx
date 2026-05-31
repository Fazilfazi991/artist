import { notFound } from "next/navigation";
import { ArtisanProfileHeader, ButtonLink, ProductGrid, SectionHeading } from "@/components/ui";
import { getApprovedArtisans, getArtisanStorefrontBySlug, getProductsByArtisanSlug } from "@/lib/services/public-marketplace";

export const dynamic = 'force-dynamic';

export default async function ArtisanPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params;
  const [artisan, products] = await Promise.all([getArtisanStorefrontBySlug(storeSlug), getProductsByArtisanSlug(storeSlug)]);
  if (!artisan) notFound();
  return <main><ArtisanProfileHeader artisan={artisan}/><section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8"><div className="rounded-xl border border-line bg-white p-6"><p className="text-xs font-black uppercase tracking-[.12em] text-rust">Our story</p><h2 className="mt-2 font-serif text-4xl">{artisan.ownerName}'s craft process</h2><p className="mt-4 leading-7 text-muted">{artisan.story}</p><div className="mt-6 grid gap-4 md:grid-cols-3"><Info label="Experience" value={`${artisan.yearsExperience}+ years`} /><Info label="Materials" value={artisan.materials} /><Info label="Process" value={artisan.process} /></div></div><aside className="rounded-xl border border-line bg-paper p-6"><h2 className="font-black">Popular categories</h2><div className="mt-4 grid gap-2 text-sm text-muted"><span>{artisan.category}</span><span>Personalized gifts</span><span>Made-to-order pieces</span></div><div className="mt-6"><ButtonLink href="/custom-orders">Request custom order</ButtonLink></div></aside></section><section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8"><SectionHeading eyebrow="Featured products" title={`Shop ${artisan.storeName}`} />{products.length ? <ProductGrid items={products} /> : <div className="rounded-xl border border-line bg-white p-8 text-muted">This artisan has no active products yet.</div>}</section></main>;
}
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-line bg-paper p-4"><p className="text-xs font-black uppercase tracking-[.12em] text-rust">{label}</p><p className="mt-2 text-sm leading-6 text-muted">{value}</p></div>; }
