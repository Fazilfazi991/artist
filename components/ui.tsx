"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Award, Check, ChevronDown, Heart, Lock, LogOut, Menu, Minus, PackageCheck, Search, Share2, ShieldCheck, ShoppingBag, Star, Store, Truck, Upload, User, X } from "lucide-react";
import { artisans, categories, occasions, products } from "@/lib/seed";
import type { Artisan, Category, Product } from "@/lib/types";
import { CartCountBadge } from "@/components/cart-count";

type AccountKind = "guest" | "buyer" | "seller";

const navItems = [["Shop", "/shop"], ["Storefronts", "/storefronts"], ["Custom Orders", "/custom-orders"], ["Our Story", "/about"]] as const;

export function AnnouncementBar() {
  return <div className="border-b border-line bg-sage px-4 py-2 text-center text-[11px] font-extrabold uppercase tracking-[.16em] text-white">
    <span>Supporting independent artisans</span><span className="mx-3 hidden opacity-50 sm:inline">/</span><span className="hidden sm:inline">Free pan-India shipping above Rs. 999</span>
  </div>;
}

export function Logo() {
  return <Link href="/" className="flex min-w-max items-center" aria-label="Plumlet home">
    <Image src="/plumlet-logo.png" alt="Plumlet" width={220} height={79} priority className="h-12 w-auto sm:h-14" />
  </Link>;
}

export function SearchBar({ compact = false }: { compact?: boolean }) {
  return <form action="/shop" className={`${compact ? "max-w-sm" : ""} flex w-full items-center gap-2 border-b border-outline/60 bg-transparent px-1 py-2 transition focus-within:border-rust`}>
    <Search size={17} className="text-muted" />
    <input name="q" className="w-full bg-transparent text-sm outline-none placeholder:text-muted/70" placeholder="Search handmade pieces..." />
  </form>;
}

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return <Link href={href} className="relative grid h-10 w-10 place-items-center rounded border border-line bg-surface text-ink transition hover:border-rust/50 hover:text-rust" aria-label={label}>{children}</Link>;
}

function navActive(pathname: string, href: string) {
  return href === "/shop" ? pathname === href || pathname.startsWith("/category/") || pathname.startsWith("/product/") : pathname === href || pathname.startsWith(`${href}/`) || (href === "/storefronts" && pathname.startsWith("/artisan/"));
}

export function DesktopNavigation() {
  const pathname = usePathname();
  return <nav className="hidden min-w-0 items-center gap-7 text-sm font-extrabold text-ink lg:flex">
    {navItems.map(([label, href], index) => <Link key={label} href={href} className={`${index > 3 ? "hidden 2xl:inline-flex" : "inline-flex"} relative h-20 items-center whitespace-nowrap transition hover:text-rust ${navActive(pathname, href) ? "text-rust after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-rust" : ""}`}>{label}</Link>)}
  </nav>;
}

const accountLinks = {
  guest: [["Login", "/login"], ["Create Account", "/register"]],
  buyer: [["My Account", "/account"], ["Orders", "/account/orders"], ["Saved Items", "/account/wishlist"], ["Addresses", "/account/addresses"], ["Logout", "/logout"]],
  seller: [["Seller Dashboard", "/seller/dashboard"], ["Manage Products", "/seller/products"], ["Orders", "/seller/orders"], ["Storefront Settings", "/seller/storefront"], ["Account Settings", "/seller/settings"], ["Logout", "/logout"]]
} as const;

export function MobileNavigationDrawer({ open, onClose, hideSellerCta = false, accountKind = "guest" }: { open: boolean; onClose: () => void; hideSellerCta?: boolean; accountKind?: AccountKind }) {
  const pathname = usePathname();
  return <div className={open ? "fixed inset-0 z-50 lg:hidden" : "pointer-events-none fixed inset-0 z-50 opacity-0 lg:hidden"}>
    <button className="absolute inset-0 bg-ink/40" onClick={onClose} aria-label="Close menu" />
    <aside className={`${open ? "translate-x-0" : "-translate-x-full"} absolute left-0 top-0 h-full w-[min(340px,88vw)] bg-paper p-5 shadow-lift transition`}>
      <div className="flex items-center justify-between"><Logo /><button className="grid h-10 w-10 place-items-center rounded border border-line bg-surface" onClick={onClose} aria-label="Close menu"><X size={18} /></button></div>
      <nav className="mt-8 grid gap-2">{navItems.map(([label, href]) => <Link key={label} href={href} onClick={onClose} className={`rounded border px-4 py-3 text-sm font-extrabold ${navActive(pathname, href) ? "border-rust bg-rust text-white" : "border-line bg-surface text-ink"}`}>{label}</Link>)}</nav>
      {hideSellerCta ? null : <Link href="/become-a-seller" onClick={onClose} className="mt-6 flex justify-center rounded bg-rust px-4 py-3 text-sm font-extrabold text-white">Sell With Us</Link>}
      <div className="mt-6 grid gap-2 border-t border-line pt-5">
        <p className="text-xs font-extrabold uppercase tracking-[.14em] text-muted">Account</p>
        {accountLinks[accountKind].map(([label, href]) => <Link key={label} href={href} onClick={onClose} className="rounded border border-line bg-surface px-4 py-3 text-sm font-extrabold">{label}</Link>)}
      </div>
    </aside>
  </div>;
}

function AccountMenu({ accountKind }: { accountKind: AccountKind }) {
  const links = accountLinks[accountKind];
  return <details className="group relative hidden sm:block">
    <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded border border-line bg-surface text-ink transition hover:border-rust/50 hover:text-rust" aria-label="Account menu"><User size={18} /></summary>
    <div className="absolute right-0 top-12 z-50 w-64 rounded-lg border border-line bg-paper p-2 shadow-lift">
      {links.map(([label, href]) => <Link key={label} href={href} className="flex items-center justify-between rounded px-3 py-2.5 text-sm font-extrabold text-ink hover:bg-surface-low hover:text-rust">{label}{label === "Logout" ? <LogOut size={14} /> : null}</Link>)}
    </div>
  </details>;
}

export function Header({ isSeller = false, accountKind = "guest" }: { isSeller?: boolean; accountKind?: AccountKind }) {
  const [open, setOpen] = useState(false);
  return <><AnnouncementBar /><header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-xl"><div className="heritage-container flex h-20 items-center gap-3"><button className="grid h-10 w-10 shrink-0 place-items-center rounded border border-line bg-surface lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={19} /></button><div className="shrink-0"><Logo /></div><DesktopNavigation /><div className="hidden min-w-0 flex-1 justify-end xl:flex"><div className="w-full max-w-[390px]"><SearchBar compact /></div></div><div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2"><IconLink href="/shop" label="Search"><Search size={18} /></IconLink><span className="hidden md:inline-grid"><IconLink href="/account/wishlist" label="Wishlist"><Heart size={18} /></IconLink></span><AccountMenu accountKind={accountKind} /><IconLink href="/cart" label="Cart"><ShoppingBag size={18} /><CartCountBadge /></IconLink>{isSeller ? null : <Link href="/become-a-seller" className="hidden min-h-10 shrink-0 items-center rounded bg-rust px-4 py-2 text-sm font-extrabold text-white transition hover:bg-rust-hover xl:inline-flex">Sell With Us</Link>}</div></div><div className="border-t border-line px-4 py-3 lg:hidden"><SearchBar /></div></header><MobileNavigationDrawer open={open} onClose={() => setOpen(false)} hideSellerCta={isSeller} accountKind={accountKind} /></>;
}

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary" | "text" }) {
  const cls = variant === "primary" ? "border border-rust bg-rust text-white hover:bg-rust-hover" : variant === "secondary" ? "border border-ink/80 bg-transparent text-ink hover:border-rust hover:text-rust" : "text-rust hover:text-rust-hover";
  return <Link href={href} className={`heritage-button ${cls}`}>{children}</Link>;
}

export function Badge({ children, tone = "rust" }: { children: React.ReactNode; tone?: "rust" | "sage" | "sand" }) {
  const cls = tone === "sage" ? "bg-sage-soft text-sage" : tone === "sand" ? "bg-surface-high text-ink" : "bg-rust-soft text-rust";
  return <span className={`inline-flex rounded px-2.5 py-1 text-xs font-extrabold ${cls}`}>{children}</span>;
}

export function SectionHeading({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy?: string; action?: React.ReactNode }) {
  return <div className="mb-10 flex flex-col justify-between gap-5 border-b border-line pb-7 md:flex-row md:items-end"><div className="max-w-3xl"><p className="heritage-label">{eyebrow}</p><h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">{title}</h2>{copy ? <p className="mt-4 max-w-2xl text-base leading-8 text-muted">{copy}</p> : null}</div>{action}</div>;
}

export function Hero() {
  return <section className="relative min-h-[680px] overflow-hidden border-b border-line"><Image src="/artisan-hero.png" alt="Indian artisan shaping handmade pottery in a warm studio" fill priority sizes="100vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/78 to-paper/10" /><div className="heritage-container relative z-10 flex min-h-[680px] items-center py-20"><div className="max-w-2xl"><p className="heritage-label text-rust">Modern Heritage</p><h1 className="plumlet-banner-title mt-5 text-5xl leading-[1.05] text-ink sm:text-7xl">Heritage crafted for modern living.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-muted">Discover unique, customizable pieces directly from India's independent makers. Objects with soul, story, and substance.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/shop">Shop Collection</ButtonLink><ButtonLink href="/storefronts" variant="secondary">Meet the Makers</ButtonLink></div></div></div></section>;
}

export function TrustStrip() {
  const items = [["Authentic Craft", "Verified makers", Award], ["Fair Trade", "Direct support", Heart], ["Secure Checkout", "Protected payments", Lock], ["Custom Orders", "Made for you", User]] as const;
  return <section className="border-b border-line bg-surface-low"><div className="heritage-container grid gap-px py-6 sm:grid-cols-2 lg:grid-cols-4">{items.map(([title, copy, Icon]) => <div key={title} className="flex items-center gap-3 px-2 py-3"><span className="grid h-11 w-11 place-items-center rounded border border-line bg-surface text-sage"><Icon size={19} /></span><span><strong className="block text-sm">{title}</strong><span className="text-xs text-muted">{copy}</span></span></div>)}</div></section>;
}

export function typeLabel(type: Product["type"]) { return type === "ready" ? "Ready to Ship" : type === "customized" ? "Customizable" : "Made to Order"; }

export function CategoryCard({ category }: { category: Category }) {
  return <Link href={`/category/${category.slug}`} className="group min-w-[180px] overflow-hidden rounded-lg border border-line bg-surface transition hover:-translate-y-0.5 hover:shadow-soft"><div className="relative aspect-[4/3] overflow-hidden bg-surface-mid"><Image src={category.image.src} alt={category.image.alt} fill sizes="220px" className="object-cover transition duration-700 group-hover:scale-105" style={{ objectPosition: category.image.position }} /><span className="absolute inset-0 bg-gradient-to-t from-ink/28 to-transparent" /></div><div className="p-5"><h3 className="font-serif text-xl font-semibold">{category.name}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{category.description}</p></div></Link>;
}

export function CategoryCards({ compact = false, items = categories }: { compact?: boolean; items?: Category[] }) {
  return <div className={`${compact ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" : "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"}`}>{items.map((category) => <CategoryCard key={category.slug} category={category} />)}</div>;
}

export function ProductCard({ product }: { product: Product }) {
  const artisan = artisans.find((item) => item.storeSlug === product.artisanSlug);
  return <article className="group overflow-hidden rounded-lg border border-line bg-surface p-3 transition hover:-translate-y-0.5 hover:shadow-soft"><div className="relative aspect-[4/5] overflow-hidden rounded bg-surface-mid"><Link href={`/product/${product.slug}`} className="absolute inset-0 z-10" aria-label={product.title} /><Image src={product.images[0].src} alt={product.images[0].alt} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" style={{ objectPosition: product.images[0].position }} />{product.customizable ? <span className="absolute left-3 top-3 z-20"><Badge>Customizable</Badge></span> : null}<button className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-surface/90 text-muted transition hover:text-rust" aria-label="Save product"><Heart size={17} /></button></div><div className="p-2 pt-4"><p className="text-xs font-bold uppercase tracking-[.12em] text-muted">{typeLabel(product.type)}</p><Link href={`/product/${product.slug}`} className="mt-2 block font-serif text-xl font-semibold leading-snug text-ink hover:text-rust">{product.title}</Link><Link href={`/artisan/${artisan?.storeSlug}`} className="mt-1 block text-sm text-muted">{artisan?.storeName}</Link><div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4"><span className="font-extrabold">{product.priceLabel}</span><span className="flex items-center gap-1 text-xs font-bold text-muted"><Star size={13} className="fill-marigold text-marigold" /> {product.rating}</span></div></div></article>;
}

export function ProductGrid({ items = products }: { items?: Product[] }) {
  return <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">{items.map((product) => <ProductCard key={product.slug} product={product} />)}</div>;
}

export function ArtisanCard({ artisan }: { artisan: Artisan }) {
  return <Link href={`/artisan/${artisan.storeSlug}`} className="group overflow-hidden rounded-lg border border-line bg-surface transition hover:-translate-y-0.5 hover:shadow-soft"><div className="relative aspect-[5/3] bg-surface-mid"><Image src={artisan.cover.src} alt={artisan.cover.alt} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" style={{ objectPosition: artisan.cover.position }} /></div><div className="p-6"><div className="flex items-center gap-3"><div className="relative h-12 w-12 overflow-hidden rounded-full border border-line bg-surface-high shadow-soft"><Image src={artisan.avatar.src} alt={artisan.avatar.alt} fill sizes="48px" className="object-cover" style={{ objectPosition: artisan.avatar.position }} /></div><div><h3 className="font-serif text-xl font-semibold">{artisan.storeName}</h3><p className="text-sm text-muted">{artisan.city}, {artisan.state}</p></div></div><p className="mt-4 text-sm leading-6 text-muted">{artisan.bio}</p><div className="mt-5 flex items-center justify-between text-sm font-extrabold"><span>{artisan.category}</span><span className="text-rust">Visit <ArrowRight className="inline" size={14} /></span></div></div></Link>;
}

export function ArtisanCards({ items = artisans }: { items?: Artisan[] }) { return <div className="grid gap-5 md:grid-cols-3">{items.map((artisan) => <ArtisanCard key={artisan.storeSlug} artisan={artisan} />)}</div>; }

export function StorySection({ artisans: storyArtisans = artisans }: { artisans?: Artisan[] }) {
  const featured = storyArtisans[0] || artisans[0];
  return <section className="heritage-container py-20"><SectionHeading eyebrow="Artisan stories" title="Meet the hands behind the craft" copy="Every purchase supports a small creative business with a real process, place, and story." /><div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]"><div className="grid gap-5 rounded-lg border border-line bg-surface p-5 md:grid-cols-[280px_1fr]"><div className="relative aspect-[4/3] overflow-hidden rounded bg-surface-mid md:aspect-auto"><Image src={featured.cover.src} alt={featured.cover.alt} fill sizes="320px" className="object-cover" style={{ objectPosition: featured.cover.position }} /></div><div className="flex flex-col justify-center"><p className="font-serif text-3xl leading-snug">"{featured.quote}"</p><p className="mt-6 font-extrabold">{featured.ownerName}</p><p className="text-sm text-muted">Founder, {featured.storeName}</p><div className="mt-6"><ButtonLink href={`/artisan/${featured.storeSlug}`} variant="secondary">Visit Storefront <ArrowRight size={16} /></ButtonLink></div></div></div><ArtisanCards items={storyArtisans} /></div></section>;
}

export function OccasionCards() { return <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">{occasions.map((occasion) => <Link key={occasion} href={`/shop?occasion=${encodeURIComponent(occasion)}`} className="rounded border border-line bg-surface p-5 text-center text-sm font-extrabold transition hover:border-rust/50 hover:text-rust">{occasion}</Link>)}</div>; }

export function SellerCTA() {
  return <section className="heritage-container py-20"><div className="grid overflow-hidden rounded-xl border border-line bg-sage text-white lg:grid-cols-[1fr_420px]"><div className="p-8 sm:p-12"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-sage-soft">For artisans</p><h2 className="plumlet-banner-title mt-4 max-w-2xl text-5xl leading-tight">Turn your craft into a storefront.</h2><p className="mt-5 max-w-2xl leading-8 text-white/80">Join a curated marketplace built to help independent artisans showcase their story, share products, and reach more buyers.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/become-a-seller">Start application</ButtonLink><ButtonLink href="/how-it-works" variant="secondary">Learn how it works</ButtonLink></div></div><div className="relative min-h-72"><Image src="/artisan-hero.png" alt="Artisan preparing handmade products for buyers" fill sizes="420px" className="object-cover" /></div></div></section>;
}

export function NewsletterSection() {
  return <section><div><h3 className="font-serif text-2xl font-semibold">Join the Guild</h3><p className="mt-3 text-sm leading-6 text-muted">New artisan stories, collections, and insights into Indian craftsmanship.</p><form className="mt-5 flex gap-3 border-b border-outline/70 pb-2" onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }}><input className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Email address" required /><button type="submit" className="text-sm font-extrabold uppercase tracking-[.12em] text-rust">Subscribe</button></form></div></section>;
}

export function Footer({ isSeller = false }: { isSeller?: boolean }) {
  return <footer className="border-t border-line bg-surface-low"><div className="heritage-container grid gap-10 py-14 md:grid-cols-[1.25fr_1fr_1fr_1fr_1.25fr]"><div><Logo /><p className="mt-5 text-sm leading-6 text-muted">Elevating traditional craft for the modern conscious home.</p></div><FooterLinks title="Shop" links={[["All Products", "/shop"], ["Home Decor", "/shop"], ["Kitchen & Dining", "/shop"], ["Jewelry", "/shop"], ["Bags & Accessories", "/shop"]]} /><FooterLinks title="Discover" links={[["Storefronts", "/storefronts"], ["Become a Seller", "/become-a-seller"], ["Custom Orders", "/custom-orders"], ["How It Works", "/how-it-works"]]} />{isSeller ? <FooterLinks title="Seller" links={[["Dashboard", "/seller/dashboard"], ["Products", "/seller/products"], ["Orders", "/seller/orders"], ["Custom Requests", "/seller/custom-requests"]]} /> : <FooterLinks title="Support" links={[["FAQs", "/how-it-works"], ["Shipping & Delivery", "/how-it-works"], ["Returns & Refunds", "/how-it-works"], ["Track Your Order", "/account/orders"], ["Terms & Conditions", "/terms-and-conditions"]]} />}<NewsletterSection /></div><div className="heritage-container flex flex-col gap-2 border-t border-line py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between"><span>© 2026 Plumlet. Honoring Indian craftsmanship.</span><span>Made with heart in India</span></div></footer>;
}

function FooterLinks({ title, links }: { title: string; links: [string, string][] }) {
  return <div><h3 className="text-sm font-extrabold uppercase tracking-[.12em]">{title}</h3><div className="mt-4 grid gap-3 text-sm text-muted">{links.map(([label, href]) => <Link className="underline decoration-transparent underline-offset-4 transition hover:text-rust hover:decoration-rust" key={label} href={href}>{label}</Link>)}</div></div>;
}

export function Breadcrumbs({ items }: { items: [string, string?][] }) {
  return <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs font-bold text-muted">{items.map(([label, href], index) => <span key={label} className="flex items-center gap-2">{href ? <Link href={href} className="hover:text-rust">{label}</Link> : <span className="text-ink">{label}</span>}{index < items.length - 1 ? <span>/</span> : null}</span>)}</nav>;
}

export function ProductGallery({ product }: { product: Product }) {
  return <div className="grid gap-3"><div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-surface-mid"><Image src={product.images[0].src} alt={product.images[0].alt} fill priority sizes="(min-width:1024px) 52vw, 100vw" className="object-cover" style={{ objectPosition: product.images[0].position }} /></div><div className="grid grid-cols-4 gap-3">{[0, 1, 2, 3].map((item) => <div key={item} className="relative aspect-square overflow-hidden rounded border border-line bg-surface-mid"><Image src={product.images[0].src} alt={`${product.title} thumbnail ${item + 1}`} fill sizes="140px" className="object-cover" style={{ objectPosition: product.images[0].position }} /></div>)}</div></div>;
}

export function QuantitySelector() { return <div className="inline-flex items-center rounded border border-line bg-surface"><button className="grid h-11 w-11 place-items-center hover:bg-surface-low" aria-label="Decrease" onClick={() => alert("Quantity updated!")}><Minus size={15} /></button><span className="grid h-11 w-12 place-items-center border-x border-line font-extrabold">1</span><button className="grid h-11 w-11 place-items-center hover:bg-surface-low" aria-label="Increase" onClick={() => alert("Quantity updated!")}>+</button></div>; }

export function ProductInfoPanel({ product }: { product: Product }) {
  const artisan = artisans.find((item) => item.storeSlug === product.artisanSlug);
  const isBespoke = product.type === "bespoke";
  return <section><Breadcrumbs items={[["Home", "/"], ["Shop", "/shop"], [product.title]]} /><Badge tone={product.type === "ready" ? "sand" : product.type === "customized" ? "rust" : "sage"}>{typeLabel(product.type)}</Badge><h1 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-6xl">{product.title}</h1><Link href={`/artisan/${artisan?.storeSlug}`} className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-sage"><Store size={16} /> {artisan?.storeName}</Link><div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-bold text-muted"><span className="flex items-center gap-1"><Star size={15} className="fill-marigold text-marigold" /> {product.rating} ({product.reviewCount} reviews)</span><span>{product.timeline}</span></div><p className="mt-6 text-3xl font-extrabold">{product.priceLabel}</p><p className="mt-5 leading-8 text-muted">{product.description}</p><div className="mt-7 grid gap-4 rounded-xl border border-line bg-surface p-5">{product.type === "customized" ? <FormInput label="Customization note" placeholder="Names, colors, message, or reference details" /> : null}{product.type === "bespoke" ? <Textarea label="Project requirement" placeholder="Tell the artisan what you want made, quantity, budget, and deadline" /> : null}{!isBespoke ? <div><p className="mb-2 text-sm font-extrabold">Quantity</p><QuantitySelector /></div> : null}<div className="flex flex-col gap-3 sm:flex-row"><button onClick={() => alert(isBespoke ? "Custom quote request sent!" : "Added to cart!")} className="min-h-12 flex-1 rounded bg-rust px-5 py-3 font-extrabold text-white transition hover:bg-rust-hover">{isBespoke ? "Request a Custom Quote" : "Add to Cart"}</button>{!isBespoke ? <button onClick={() => alert("Proceeding to checkout...")} className="min-h-12 flex-1 rounded border border-line bg-paper px-5 py-3 font-extrabold">Buy Now</button> : null}<button onClick={() => alert("Added to wishlist!")} className="grid min-h-12 w-full place-items-center rounded border border-line bg-surface transition hover:text-rust sm:w-12" aria-label="Wishlist"><Heart size={18} /></button></div></div><div className="mt-5 grid gap-3 text-sm text-muted sm:grid-cols-3"><span className="flex items-center gap-2"><Truck size={16} /> Expected dispatch tracked</span><span className="flex items-center gap-2"><ShieldCheck size={16} /> Secure checkout</span><span className="flex items-center gap-2"><Check size={16} /> Verified artisan</span></div></section>;
}

export function ArtisanProfileHeader({ artisan }: { artisan: Artisan }) {
  return <section className="bg-surface"><div className="relative h-56 border-b border-line md:h-72"><Image src={artisan.cover.src} alt={artisan.cover.alt} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: artisan.cover.position }} /><div className="absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent" /></div><div className="heritage-container pb-10"><div className="-mt-14 grid gap-6 rounded-xl border border-line bg-paper p-5 shadow-soft md:grid-cols-[120px_1fr_auto] md:items-end"><div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-paper bg-surface-mid"><Image src={artisan.avatar.src} alt={artisan.avatar.alt} fill sizes="112px" className="object-cover" style={{ objectPosition: artisan.avatar.position }} /></div><div><div className="flex flex-wrap items-center gap-2"><h1 className="font-serif text-4xl font-semibold">{artisan.storeName}</h1><Badge tone="sage">Verified artisan</Badge></div><p className="mt-2 font-bold text-muted">{artisan.ownerName} / {artisan.city}, {artisan.state} / {artisan.category}</p><p className="mt-3 max-w-3xl leading-7 text-muted">{artisan.bio}</p><div className="mt-4 flex flex-wrap gap-4 text-sm font-bold"><span>{artisan.rating} rating</span><span>{artisan.reviews} reviews</span><span>{artisan.completedOrders} orders completed</span></div></div><div className="flex flex-col gap-2 sm:flex-row md:flex-col"><button onClick={() => alert("Messaging feature coming soon!")} className="rounded bg-sage px-4 py-3 font-extrabold text-white transition hover:opacity-90">Message</button><button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Profile link copied!"); }} className="rounded border border-line bg-surface px-4 py-3 font-extrabold transition hover:bg-surface-low"><Share2 className="mr-2 inline" size={16} />Share</button></div></div></div></section>;
}

export function EmptyState({ title, copy }: { title: string; copy: string }) { return <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded bg-surface-high text-rust"><Search size={19} /></div><h2 className="mt-4 font-serif text-2xl font-semibold">{title}</h2><p className="mt-2 text-muted">{copy}</p></div>; }
export function SkeletonCard() { return <div className="animate-pulse rounded-lg border border-line bg-surface p-4"><div className="aspect-[4/3] rounded bg-surface-mid" /><div className="mt-4 h-4 rounded bg-surface-mid" /><div className="mt-2 h-4 w-2/3 rounded bg-surface-mid" /></div>; }
export function FormInput({ label, placeholder }: { label: string; placeholder: string }) { return <label className="grid gap-2 text-sm font-extrabold"><span>{label}</span><input className="min-h-11 rounded border border-line bg-paper px-4 outline-none transition focus:border-rust" placeholder={placeholder} /></label>; }
export function SelectInput({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2 text-sm font-extrabold"><span>{label}</span><select className="min-h-11 rounded border border-line bg-paper px-4 outline-none transition focus:border-rust">{children}</select></label>; }
export function Textarea({ label, placeholder }: { label: string; placeholder: string }) { return <label className="grid gap-2 text-sm font-extrabold"><span>{label}</span><textarea className="min-h-28 rounded border border-line bg-paper px-4 py-3 outline-none transition focus:border-rust" placeholder={placeholder} /></label>; }
export function FileUploadPlaceholder() { return <div className="grid min-h-32 place-items-center rounded border border-dashed border-line bg-paper p-5 text-center text-sm text-muted"><Upload size={22} /><span className="mt-2 block font-bold">Upload reference image, video, or PDF</span></div>; }

export function FilterSidebar({ selectedType, onType, selectedCategory, onCategory, categories: filterCategories = categories }: { selectedType: string; onType: (value: string) => void; selectedCategory: string; onCategory: (value: string) => void; categories?: Category[] }) {
  return <aside className="grid gap-5 rounded-xl border border-line bg-surface p-5"><FilterGroup title="Categories">{filterCategories.map((category) => <FilterButton key={category.slug} active={selectedCategory === category.slug} onClick={() => onCategory(category.slug)}>{category.name}</FilterButton>)}</FilterGroup><FilterGroup title="Price Range"><div className="h-2 rounded-full bg-surface-high"><div className="h-2 w-2/3 rounded-full bg-rust" /></div><div className="flex justify-between text-xs text-muted"><span>Rs. 0</span><span>Rs. 5000+</span></div></FilterGroup><FilterGroup title="Product Type">{[["ready", "Ready to Ship"], ["customized", "Customizable"], ["bespoke", "Made to Order"]].map(([value, label]) => <FilterButton key={value} active={selectedType === value} onClick={() => onType(value)}>{label}</FilterButton>)}</FilterGroup><FilterGroup title="Occasion">{occasions.slice(0, 5).map((occasion) => <FilterButton key={occasion}>{occasion}</FilterButton>)}</FilterGroup><FilterGroup title="Artisan">{artisans.map((artisan) => <FilterButton key={artisan.storeSlug}>{artisan.storeName}</FilterButton>)}</FilterGroup></aside>;
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) { return <div className="border-b border-line pb-5 last:border-0 last:pb-0"><button className="mb-3 flex w-full items-center justify-between text-sm font-extrabold" type="button">{title}<ChevronDown size={15} /></button><div className="grid gap-2">{children}</div></div>; }
function FilterButton({ children, active = false, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) { return <button onClick={onClick} className={`text-left text-sm ${active ? "font-extrabold text-rust" : "text-muted hover:text-ink"}`} type="button">{children}</button>; }

export function MobileFilterDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return <div className={open ? "fixed inset-0 z-50 lg:hidden" : "pointer-events-none fixed inset-0 z-50 opacity-0 lg:hidden"}><button className="absolute inset-0 bg-ink/40" onClick={onClose} aria-label="Close filters" /><aside className={`${open ? "translate-y-0" : "translate-y-full"} absolute bottom-0 left-0 max-h-[88vh] w-full overflow-y-auto rounded-t-2xl bg-paper p-5 shadow-lift transition`}><div className="mb-4 flex items-center justify-between"><h2 className="font-extrabold">Filters</h2><button onClick={onClose} className="grid h-10 w-10 place-items-center rounded border border-line bg-surface"><X size={18} /></button></div>{children}</aside></div>;
}
