import Link from "next/link";
import { Award, ClipboardCheck, PackageCheck, Store, Truck } from "lucide-react";
import { PhoneCountryField } from "@/components/phone-country-field";
import { SectionHeading } from "@/components/ui";
import { registerAction } from "@/app/auth/actions";

const categories = ["Home decor", "Kitchen and dining", "Jewelry", "Candles", "Art prints", "Personalized gifts", "Textiles", "Bags and accessories"];
const steps = ["Account details", "Business information", "Storefront details", "Product categories", "Verification", "Review and submit"];

export default async function SellerRegisterPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const params = await searchParams;
  return <main className="bg-paper">
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:px-8">
      <aside className="rounded-2xl border border-line bg-ink p-7 text-white shadow-soft">
        <p className="text-xs font-black uppercase tracking-[.16em] text-gold">Sell with us</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight">Start selling your craft with Plumlet.</h1>
        <p className="mt-5 leading-8 text-white/75">Create a seller account, save a draft storefront, then complete onboarding for admin review.</p>
        <div className="mt-8 grid gap-3">
          {[
            { Icon: Store, label: "Build a branded storefront" },
            { Icon: PackageCheck, label: "Manage products and custom orders" },
            { Icon: Truck, label: "Track fulfilment" },
            { Icon: Award, label: "Grow trusted marketplace presence" }
          ].map(({ Icon, label }) => <div key={label} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/8 p-4"><Icon size={19} /><span className="font-bold">{label}</span></div>)}
        </div>
      </aside>
      <section>
        <SectionHeading eyebrow="Seller registration" title="Create your seller account" copy="This is separate from customer signup and starts a structured seller onboarding flow." />
        {params.error ? <p className="mb-4 rounded-lg border border-rust/30 bg-rust/10 p-3 text-sm font-bold text-rust">{params.error}</p> : null}
        <form action={registerAction} className="grid gap-4 rounded-xl border border-line bg-white p-6 shadow-soft">
          <input type="hidden" name="accountType" value="seller" />
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="fullName" className="min-h-12 rounded-lg border border-line px-4 outline-none focus:border-rust" placeholder="Full name" required />
            <input name="businessName" className="min-h-12 rounded-lg border border-line px-4 outline-none focus:border-rust" placeholder="Business or brand name" required />
          </div>
          <input name="email" className="min-h-12 rounded-lg border border-line px-4 outline-none focus:border-rust" placeholder="Email address" type="email" required />
          <PhoneCountryField />
          <div className="grid gap-4 sm:grid-cols-2">
            <select name="country" defaultValue="India" className="min-h-12 rounded-lg border border-line bg-white px-4 outline-none focus:border-rust" required>
              {["India", "United Arab Emirates", "Qatar", "Saudi Arabia", "Kuwait", "Bahrain", "Oman", "United States", "United Kingdom"].map((country) => <option key={country} value={country}>{country}</option>)}
            </select>
            <select name="businessCategory" defaultValue="" className="min-h-12 rounded-lg border border-line bg-white px-4 outline-none focus:border-rust" required>
              <option value="" disabled>Business category</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </div>
          <textarea name="businessDescription" className="min-h-28 rounded-lg border border-line px-4 py-3 outline-none focus:border-rust" placeholder="Short business description" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="password" className="min-h-12 rounded-lg border border-line px-4 outline-none focus:border-rust" placeholder="Password" type="password" required minLength={8} />
            <input name="confirmPassword" className="min-h-12 rounded-lg border border-line px-4 outline-none focus:border-rust" placeholder="Confirm password" type="password" required minLength={8} />
          </div>
          <label className="flex gap-3 text-sm font-bold leading-6 text-muted"><input name="terms" type="checkbox" required className="mt-1 h-4 w-4 accent-rust" /> I agree to the seller terms, verification checks, and marketplace policies.</label>
          <button className="rounded-lg bg-rust px-5 py-3 font-black text-white transition hover:bg-rust-hover">Register as a Seller</button>
          <Link href="/register" className="text-sm font-bold text-rust">Need a customer account instead?</Link>
        </form>
      </section>
    </section>
    <section className="border-t border-line bg-surface-low px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[.14em] text-rust"><ClipboardCheck size={17} /> Onboarding steps</div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{steps.map((step, index) => <div key={step} className="rounded-lg border border-line bg-white p-4"><span className="text-xs font-black text-muted">Step {index + 1}</span><h2 className="mt-2 font-black">{step}</h2></div>)}</div>
      </div>
    </section>
  </main>;
}
