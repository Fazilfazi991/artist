"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bell, CreditCard, Grid2X2, Inbox, Layers3, LogOut, MessageSquare, Package, Palette, Settings, ShoppingBag, Star, Store } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";

type SellerShellProfile = {
  storeName?: string | null;
  storeSlug?: string | null;
  profileImageUrl?: string | null;
};

const groups = [
  { title: "Main", items: [["Overview", "/seller/dashboard", Grid2X2], ["Orders", "/seller/orders", ShoppingBag], ["Products", "/seller/products", Package], ["Collections", "/seller/collections", Layers3]] },
  { title: "Store", items: [["Storefront", "/seller/storefront", Store], ["Custom Orders", "/seller/custom-requests", Palette]] },
  { title: "Insights", items: [["Analytics", "/seller/analytics", BarChart3], ["Reviews", "/seller/reviews", Star]] },
  { title: "Account", items: [["Messages", "/seller/messages", MessageSquare], ["Payouts", "/seller/payouts", CreditCard], ["Settings", "/seller/settings", Settings]] }
] as const;

export function SellerWorkspace({ seller, children }: { seller: SellerShellProfile | null; children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/seller/onboarding") || pathname.startsWith("/seller/storefront/preview") || !seller) return <>{children}</>;
  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return <div className="min-h-screen bg-[#f8f1e8] text-ink">
    <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-line bg-[#fff7ec] lg:flex lg:flex-col">
        <div className="border-b border-line p-5">
          <Link href="/seller/dashboard" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg border border-rust/20 bg-white text-rust"><Store size={20} /></span>
            <span className="min-w-0"><strong className="block truncate font-serif text-lg">{seller.storeName || "Seller Studio"}</strong><span className="text-xs font-black text-muted">Artisan workspace</span></span>
          </Link>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto p-4">
          {groups.map((group) => <div key={group.title}>
            <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-[.14em] text-muted">{group.title}</p>
            <div className="grid gap-1">{group.items.map(([label, href, Icon]) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-black transition ${active(href) ? "bg-rust text-white" : "text-ink hover:bg-white hover:text-rust"}`}><Icon size={17} />{label}</Link>)}</div>
          </div>)}
        </nav>
        <div className="border-t border-line p-4">
          <Link href={`/artisan/${seller.storeSlug}`} className="mb-3 flex items-center gap-3 rounded-lg bg-white p-3 text-sm font-black text-rust">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-sand">{(seller.storeName || "S")[0]}</span>
            <span className="min-w-0"><span className="block truncate text-ink">{seller.storeName}</span><span className="text-xs text-rust">View storefront</span></span>
          </Link>
          <form action={logoutAction}><button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-black text-rust hover:bg-rust/10"><LogOut size={17} />Logout</button></form>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-line bg-[#f8f1e8]/95 px-4 py-3 backdrop-blur lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[.12em] text-rust">Seller Dashboard</p>
              <h1 className="truncate font-serif text-2xl font-bold">{seller.storeName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/artisan/${seller.storeSlug}`} className="hidden rounded-lg border border-line bg-white px-4 py-2 text-sm font-black text-ink sm:inline-flex">View Storefront</Link>
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-rust"><Bell size={18} /></span>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {[...groups[0].items, ...groups[1].items].map(([label, href, Icon]) => <Link key={href} href={href} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-black ${active(href) ? "border-rust bg-rust text-white" : "border-line bg-white text-ink"}`}><Icon size={16} />{label}</Link>)}
          </nav>
        </header>
        <main className="min-w-0 px-4 py-5 lg:px-6">{children}</main>
      </div>
    </div>
  </div>;
}
