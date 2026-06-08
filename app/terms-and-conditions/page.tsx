import Link from "next/link";
import { SectionHeading } from "@/components/ui";

const sections = [
  ["Use of Plumlet", "Plumlet connects buyers with independent artisan sellers. By using the website, you agree to provide accurate account, order, delivery, and payment information."],
  ["Buyer Accounts", "Buyers are responsible for keeping login details secure, reviewing product details before purchase, and providing complete delivery information."],
  ["Seller Accounts", "Sellers must submit truthful business and product information, keep listings accurate, fulfill accepted orders, and follow Plumlet marketplace policies."],
  ["Orders and Payments", "Orders are confirmed through the checkout flow. Plumlet currently supports protected online payment workflows and does not offer cash on delivery."],
  ["Custom Orders", "Custom-order requests may include reference images, videos, files, notes, links, measurements, timelines, and budgets. Work begins only after the agreed quote and required payment steps are approved."],
  ["Shipping, Returns, and Cancellations", "Shipping timelines, eligibility for returns, and cancellation rules may vary by product type, seller, and customization status. Personalized or made-to-order items may have limited return eligibility."],
  ["Product Content", "Product images, descriptions, prices, availability, and customization details are provided by sellers. Plumlet may review, hide, or remove content that does not meet marketplace standards."],
  ["Intellectual Property", "Users must only upload content, references, logos, photos, videos, and files they own or have permission to use. Plumlet branding and site content may not be copied without permission."],
  ["Limitations", "Plumlet aims to provide a reliable marketplace, but availability, delivery timelines, seller response times, and third-party services may vary."],
  ["Updates to Terms", "These terms may be updated as Plumlet grows. Continued use of the website after updates means you accept the latest version."]
];

export default function TermsAndConditionsPage() {
  return <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
    <SectionHeading eyebrow="Legal" title="Terms and Conditions" copy="Please read these terms before buying, selling, or submitting custom-order requests on Plumlet." />
    <div className="grid gap-4">
      {sections.map(([title, copy]) => <section key={title} className="rounded-xl border border-line bg-white p-5 shadow-soft">
        <h2 className="text-xl font-black text-ink">{title}</h2>
        <p className="mt-3 leading-7 text-muted">{copy}</p>
      </section>)}
    </div>
    <div className="mt-8 rounded-xl border border-line bg-surface-low p-5">
      <h2 className="font-black">Need help?</h2>
      <p className="mt-2 text-sm leading-6 text-muted">For questions about an order, account, or marketplace policy, contact Plumlet support.</p>
      <Link href="/contact" className="mt-4 inline-flex rounded bg-rust px-5 py-3 text-sm font-black text-white">Contact Support</Link>
    </div>
  </main>;
}
