"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CreditCard, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/hero-slides/slide-1.png",
    alt: "Curated handmade products styled for modern Indian homes",
    eyebrow: "Plumlet Picks",
    title: "Handmade pieces with a personal story.",
    copy: "Shop unique decor, gifts, and keepsakes directly from independent makers."
  },
  {
    src: "/hero-slides/slide-2.png",
    alt: "Artisan craft collection in Plumlet's modern pink and purple palette",
    eyebrow: "Custom Made",
    title: "Bring your idea to an artisan.",
    copy: "Share references, approve a quote, and follow the making journey from request to delivery."
  },
  {
    src: "/hero-slides/slide-3.png",
    alt: "Premium artisan storefront campaign for Plumlet marketplace",
    eyebrow: "Meet the Makers",
    title: "Discover storefronts built around craft.",
    copy: "Explore maker stories, collections, and products made with care."
  }
] as const;

export function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, []);

  const go = (direction: -1 | 1) => setActive((value) => (value + direction + slides.length) % slides.length);
  const slide = slides[active];

  return <section className="relative overflow-hidden border-b border-line bg-white">
    <div className="absolute inset-0">
      {slides.map((item, index) => <Image key={item.src} src={item.src} alt={item.alt} fill priority={index === 0} sizes="100vw" className={`object-cover object-center transition-opacity duration-700 ${index === active ? "opacity-100" : "opacity-0"}`} />)}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/82 to-white/18" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/74 via-transparent to-transparent" />
    </div>

    <div className="heritage-container relative z-10 flex min-h-[410px] flex-col justify-center py-10 sm:min-h-[450px] sm:py-12">
      <p className="heritage-label text-rust">{slide.eyebrow}</p>
      <h1 className="mt-5 max-w-3xl font-serif text-5xl font-bold leading-[1.05] text-ink sm:text-7xl">{slide.title}</h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-muted">{slide.copy}</p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link href="/shop" className="heritage-button border border-rust bg-rust text-white hover:bg-rust-hover">Shop Collection</Link>
        <Link href="/storefronts" className="heritage-button border border-ink/80 bg-white/70 text-ink hover:border-rust hover:text-rust">Meet the Makers</Link>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button type="button" onClick={() => go(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white/82 text-rust shadow-soft transition hover:bg-rust hover:text-white" aria-label="Previous hero slide"><ChevronLeft size={18} /></button>
        <div className="flex gap-2">
          {slides.map((item, index) => <button key={item.src} type="button" onClick={() => setActive(index)} className={`h-2.5 rounded-full transition ${index === active ? "w-8 bg-rust" : "w-2.5 bg-rust-soft"}`} aria-label={`Show hero slide ${index + 1}`} aria-current={index === active} />)}
        </div>
        <button type="button" onClick={() => go(1)} className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white/82 text-rust shadow-soft transition hover:bg-rust hover:text-white" aria-label="Next hero slide"><ChevronRight size={18} /></button>
      </div>
    </div>

    <div className="relative z-10 border-t border-line bg-white/84 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-3 rounded-lg border border-line bg-white/78 px-4 py-4 text-sm font-black text-ink shadow-soft sm:grid-cols-2 lg:grid-cols-4">
        <HeroTrustItem icon={<PackageCheck size={18} />} label="Easy 7-day Returns" />
        <HeroTrustItem icon={<CreditCard size={18} />} label="Protected Online Payments" />
        <HeroTrustItem icon={<ShieldCheck size={18} />} label="Secure Payments" />
        <HeroTrustItem icon={<Truck size={18} />} label="Worldwide Shipping" />
      </div>
    </div>
  </section>;
}

function HeroTrustItem({ icon, label }: { icon: ReactNode; label: string }) {
  return <span className="flex items-center justify-center gap-3 text-center sm:justify-start"><span className="text-rust">{icon}</span>{label}</span>;
}
