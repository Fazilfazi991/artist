import { notFound } from "next/navigation";
import { ProductGrid, SectionHeading } from "@/components/ui";
import { getFeaturedCategories, getProductsByCategorySlug } from "@/lib/services/public-marketplace";

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { category, products } = await getProductsByCategorySlug(slug);
  if (!category) notFound();
  return <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><SectionHeading eyebrow="Category" title={category.name} copy={`${category.description} ${products.length} products available.`} />{products.length ? <ProductGrid items={products} /> : <div className="rounded-xl border border-line bg-white p-8 text-muted">No live products in this category yet.</div>}</main>;
}
