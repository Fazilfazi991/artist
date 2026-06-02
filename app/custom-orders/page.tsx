import Link from "next/link";
import { SectionHeading } from "@/components/ui";

const flows = [
  { title: "Submit a requirement", copy: "Share budget, quantity, deadline, location, and reference files with an approved artisan." },
  { title: "Review the quote", copy: "Accept, decline, or request a revision before any production starts." },
  { title: "Track milestones", copy: "Follow deposit state, project updates, final payment state, and delivery readiness." }
];

export default function CustomOrdersPage() {
  return <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><SectionHeading eyebrow="Custom orders" title="Bespoke handmade work starts with a quote" copy="Use custom orders for wedding decor, corporate gifting, bulk handmade products, installations, custom art, and event-specific projects." action={<Link href="/storefronts?customOrders=yes" className="rounded-lg bg-rust px-5 py-3 font-black text-white">Choose a Storefront</Link>} /><div className="grid gap-4 md:grid-cols-3">{flows.map((flow) => <article key={flow.title} className="rounded-lg border border-line bg-white p-6"><h2 className="text-xl font-black">{flow.title}</h2><p className="mt-3 leading-7 text-muted">{flow.copy}</p></article>)}</div><section className="mt-8 rounded-xl border border-line bg-white p-6"><h2 className="font-black">How it works</h2><p className="mt-3 leading-7 text-muted">Buyer submits a brief, artisan sends a quotation, buyer accepts or requests changes, admin marks test deposit/final payment states, and the artisan adds milestones until the request is ready for delivery.</p></section></main>;
}
