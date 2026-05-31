import { SectionHeading } from "@/components/ui";
import { getFeaturedCategories, getProducts } from "@/lib/services/public-marketplace";
import { ShopClient } from "./shop-client";

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([getProducts({ search: params.search || params.q, category: params.category, type: params.type, sort: params.sort }), getFeaturedCategories()]);
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><p className="mb-3 text-xs font-bold text-muted">Home / Shop</p><SectionHeading eyebrow="Shop" title="Shop handmade products" copy="Explore unique handmade products crafted by independent artisans." /><ShopClient initialProducts={products} categories={categories} /></main>;
}
