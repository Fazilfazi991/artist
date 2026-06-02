import { SectionHeading } from '@/components/ui';

export function PlaceholderSellerPage({ title, copy }: { title: string; copy: string }) {
  return <div className="mx-auto max-w-5xl">
    <SectionHeading eyebrow="Seller workspace" title={title} copy={copy} />
    <div className="rounded-xl border border-line bg-white p-8 text-muted">
      This section is ready in the seller navigation and will expand without changing the public marketplace or buyer account flow.
    </div>
  </div>;
}
