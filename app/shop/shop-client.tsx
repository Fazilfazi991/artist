"use client";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Badge, FilterSidebar, MobileFilterDrawer, ProductGrid } from "@/components/ui";
import { products } from "@/lib/seed";
import type { ProductType } from "@/lib/types";

export function ShopClient() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | ProductType>("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesQuery = `${product.title} ${product.description} ${product.occasion}`.toLowerCase().includes(query.toLowerCase());
      const matchesType = type === "all" || product.type === type;
      const matchesCategory = category === "all" || product.categorySlug === category;
      return matchesQuery && matchesType && matchesCategory;
    });
    return [...filtered].sort((a, b) => sort === "price-asc" ? (a.price || 0) - (b.price || 0) : sort === "price-desc" ? (b.price || 0) - (a.price || 0) : 0);
  }, [category, query, sort, type]);

  const clearAll = () => { setQuery(""); setType("all"); setCategory("all"); setSort("featured"); };
  const sidebar = <FilterSidebar selectedType={type} onType={(value) => setType(value as typeof type)} selectedCategory={category} onCategory={setCategory} />;

  return <div>
    <div className="mb-6 grid gap-3 rounded-xl border border-line bg-white p-4 md:grid-cols-[1fr_auto_auto]"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." className="min-h-11 rounded-lg border border-line bg-paper px-4 outline-none focus:border-rust"/><select value={sort} onChange={(event) => setSort(event.target.value)} className="min-h-11 rounded-lg border border-line bg-paper px-4 outline-none"><option value="featured">Sort by: Featured</option><option value="newest">Newest</option><option value="price-asc">Price ascending</option><option value="price-desc">Price descending</option></select><button onClick={() => setFiltersOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-paper px-4 font-black lg:hidden"><SlidersHorizontal size={17}/> Filters</button></div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2"><Badge tone="sand">{visibleProducts.length} products found</Badge>{type !== "all" ? <button onClick={() => setType("all")}><Badge>{type} <X className="ml-1 inline" size={12}/></Badge></button> : null}{category !== "all" ? <button onClick={() => setCategory("all")}><Badge>{category} <X className="ml-1 inline" size={12}/></Badge></button> : null}</div><button onClick={clearAll} className="text-sm font-black text-rust">Clear all</button></div>
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]"><div className="hidden lg:block">{sidebar}</div><ProductGrid items={visibleProducts}/></div>
    <MobileFilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)}>{sidebar}</MobileFilterDrawer>
  </div>;
}
