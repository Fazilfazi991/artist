import { notFound } from "next/navigation";
import { ArtisanCard, ProductGallery, ProductGrid, ProductInfoPanel, SectionHeading } from "@/components/ui";
import { getArtisanStorefrontBySlug, getProductBySlug, getRelatedProducts } from "@/lib/services/public-marketplace";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const [artisan, related] = await Promise.all([getArtisanStorefrontBySlug(product.artisanSlug), getRelatedProducts(product.slug, product.categorySlug, 4)]);
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr]"><ProductGallery product={product}/><ProductInfoPanel product={product}/></div><section className="mt-14 grid gap-5 lg:grid-cols-3"><article className="rounded-xl border border-line bg-white p-6"><h2 className="font-black">Product story</h2><p className="mt-3 leading-7 text-muted">{product.story}</p></article><article className="rounded-xl border border-line bg-white p-6"><h2 className="font-black">Materials and care</h2><p className="mt-3 leading-7 text-muted">{product.materials}</p><p className="mt-3 leading-7 text-muted">{product.care}</p></article><article className="rounded-xl border border-line bg-white p-6"><h2 className="font-black">Customization details</h2><p className="mt-3 leading-7 text-muted">{product.customizable ? "This item supports custom notes, references, and seller review before production." : "This item is ready to ship in the listed dispatch timeline."}</p></article></section>{artisan ? <section className="mt-14"><SectionHeading eyebrow="Artisan" title="Made by an approved storefront" /><ArtisanCard artisan={artisan}/></section> : null}<section className="mt-14"><SectionHeading eyebrow="More like this" title="Explore similar handmade pieces" /><ProductGrid items={related}/></section></main>;
}
