"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bell, CreditCard, Grid2X2, Inbox, Layers3, LogOut, MessageSquare, Package, Palette, Settings, ShoppingBag, Star, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";

type SellerShellProfile = {
  storeName?: string | null;
  storeSlug?: string | null;
  profileImageUrl?: string | null;
};

type SellerNavItem = [string, string, LucideIcon];

const groups: Array<{ title: string; items: SellerNavItem[] }> = [
  { title: "Main", items: [["Overview", "/seller/dashboard", Grid2X2], ["Orders", "/seller/orders", ShoppingBag], ["Products", "/seller/products", Package], ["Collections", "/seller/collections", Layers3]] },
  { title: "Store", items: [["Storefront", "/seller/storefront", Store], ["Custom Orders", "/seller/custom-requests", Palette]] },
  { title: "Insights", items: [["Analytics", "/seller/analytics", BarChart3], ["Reviews", "/seller/reviews", Star]] },
  { title: "Account", items: [["Messages", "/seller/messages", MessageSquare], ["Payouts", "/seller/payouts", CreditCard], ["Settings", "/seller/settings", Settings]] }
];

export function SellerWorkspace({ seller, children }: { seller: SellerShellProfile | null; children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/seller/onboarding") || pathname.startsWith("/seller/storefront/preview") || !seller) return <>{children}</>;
  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return <div className="min-h-screen bg-surface-low text-ink">
    <div className="grid min-h-screen lg:grid-cols-[288px_1fr]">
      <aside className="hidden border-r border-line bg-paper lg:flex lg:flex-col">
        <div className="border-b border-line p-6">
          <Link href="/seller/dashboard" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded border border-line bg-surface text-rust shadow-soft"><Store size={20} /></span>
            <span className="min-w-0"><strong className="block truncate font-serif text-xl font-semibold">{seller.storeName || "Seller Studio"}</strong><span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-muted">Artisan dashboard</span></span>
          </Link>
        </div>
        <nav className="flex-1 space-y-7 overflow-y-auto p-5">
          {groups.map((group) => <div key={group.title}>
            <p className="mb-2 px-3 text-[11px] font-extrabold uppercase tracking-[.14em] text-muted">{group.title}</p>
            <div className="grid gap-1">{group.items.map(([label, href, Icon]) => <Link key={href} href={href} className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm font-extrabold transition ${active(href) ? "bg-rust text-white" : "text-ink hover:bg-surface hover:text-rust"}`}><Icon size={17} />{label}</Link>)}</div>
          </div>)}
        </nav>
        <div className="border-t border-line p-5">
          <Link href={`/artisan/${seller.storeSlug}`} className="mb-3 flex items-center gap-3 rounded border border-line bg-surface p-3 text-sm font-extrabold text-rust">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-high font-serif">{(seller.storeName || "S")[0]}</span>
            <span className="min-w-0"><span className="block truncate text-ink">{seller.storeName}</span><span className="text-xs text-rust">View public storefront</span></span>
          </Link>
          <form action={logoutAction}><button className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-extrabold text-rust hover:bg-rust-soft"><LogOut size={17} />Logout</button></form>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-line bg-surface-low/95 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[.14em] text-sage">Seller Dashboard</p>
              <h1 className="truncate font-serif text-3xl font-semibold">{seller.storeName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/artisan/${seller.storeSlug}`} className="hidden rounded border border-line bg-surface px-4 py-2 text-sm font-extrabold text-ink sm:inline-flex">View Storefront</Link>
              <span className="grid h-10 w-10 place-items-center rounded border border-line bg-surface text-rust"><Bell size={18} /></span>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {groups.flatMap((group) => group.items).map(([label, href, Icon]) => <Link key={href} href={href} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded border px-3 text-sm font-extrabold ${active(href) ? "border-rust bg-rust text-white" : "border-line bg-surface text-ink"}`}><Icon size={16} />{label}</Link>)}
          </nav>
        </header>
        <main className="min-w-0 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  </div>;
}
