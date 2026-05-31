import { notFound } from "next/navigation";
import { ProductGrid, SectionHeading } from "@/components/ui";
import { categories, getCategory, productsByCategory } from "@/lib/seed";

export function generateStaticParams() { return categories.map((category) => ({ slug: category.slug })); }

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  return <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><SectionHeading eyebrow="Category" title={category.name} copy={category.description} /><ProductGrid items={productsByCategory(slug)} /></main>;
}
