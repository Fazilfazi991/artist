"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, CreditCard, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/hero-slides/slide-1.png",
    mobileSrc: "/hero-slides/mobile-slide-1.png",
    alt: "Handmade with love chosen for smiles gift collection",
    ctaPosition: "bottom-[6%] items-center sm:bottom-[13%] sm:items-start lg:bottom-[15%]"
  },
  {
    src: "/hero-slides/slide-2.png",
    mobileSrc: "/hero-slides/mobile-slide-2.png",
    alt: "Gifts that speak from the heart handmade surprise collection",
    ctaPosition: "bottom-[6%] items-center sm:bottom-[10%] sm:items-start lg:bottom-[11%]"
  },
  {
    src: "/hero-slides/slide-3.png",
    mobileSrc: "/hero-slides/mobile-slide-3.png",
    alt: "Made by passionate sellers artisan storefront campaign",
    ctaPosition: "bottom-[6%] items-center sm:bottom-[13%] sm:items-start lg:bottom-[15%]"
  }
] as const;

export function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, []);

  const go = (direction: -1 | 1) => setActive((value) => (value + direction + slides.length) % slides.length);
  const activeSlide = slides[active];

  return <section className="relative overflow-hidden border-b border-line bg-white">
    <div className="relative aspect-[4/5] min-h-[520px] w-full overflow-hidden sm:aspect-[1914/823] sm:min-h-[430px]">
      {slides.map((item, index) => <Image key={item.src} src={item.src} alt={item.alt} fill priority={index === 0} sizes="(min-width: 640px) 100vw, 0px" className={`hidden object-cover object-center transition-opacity duration-700 sm:block ${index === active ? "opacity-100" : "opacity-0"}`} />)}
      {slides.map((item, index) => <Image key={item.mobileSrc} src={item.mobileSrc} alt={item.alt} fill priority={index === 0} sizes="(max-width: 639px) 100vw, 0px" className={`object-cover object-center transition-opacity duration-700 sm:hidden ${index === active ? "opacity-100" : "opacity-0"}`} />)}

      <div className={`heritage-container absolute inset-x-0 z-10 flex flex-col gap-5 ${activeSlide.ctaPosition}`}>
        <Link href="/shop" className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-[999px] border-2 border-rust bg-rust px-7 py-3 text-xs font-black uppercase tracking-[.08em] text-white shadow-[0_16px_34px_rgba(105,41,106,.22)] transition hover:-translate-y-0.5 hover:bg-rust-hover sm:min-h-14 sm:px-9 sm:text-base">
          Shop Now
          <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="absolute bottom-4 right-5 z-10 flex items-center gap-3 sm:bottom-7 sm:right-8">
        <button type="button" onClick={() => go(-1)} className="hidden h-10 w-10 place-items-center rounded-full border border-line bg-white/82 text-rust shadow-soft transition hover:bg-rust hover:text-white sm:grid" aria-label="Previous hero slide"><ChevronLeft size={18} /></button>
        <div className="flex gap-2">
          {slides.map((item, index) => <button key={item.src} type="button" onClick={() => setActive(index)} className={`h-2.5 rounded-full transition ${index === active ? "w-8 bg-rust" : "w-2.5 bg-rust-soft"}`} aria-label={`Show hero slide ${index + 1}`} aria-current={index === active} />)}
        </div>
        <button type="button" onClick={() => go(1)} className="hidden h-10 w-10 place-items-center rounded-full border border-line bg-white/82 text-rust shadow-soft transition hover:bg-rust hover:text-white sm:grid" aria-label="Next hero slide"><ChevronRight size={18} /></button>
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
