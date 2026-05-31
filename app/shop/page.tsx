import { SectionHeading } from "@/components/ui";
import { ShopClient } from "./shop-client";

export default function ShopPage() {
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><p className="mb-3 text-xs font-bold text-muted">Home / Shop</p><SectionHeading eyebrow="Shop" title="Shop handmade products" copy="Explore unique handmade products crafted by independent artisans." /><ShopClient /></main>;
}
