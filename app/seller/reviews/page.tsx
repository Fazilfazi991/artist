import Link from 'next/link';
import { Eye, Star, StarHalf, ThumbsUp } from 'lucide-react';
import { Badge, SectionHeading } from '@/components/ui';
import { requireApprovedSeller } from '@/lib/services/auth';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SellerReviewsPage() {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, products(name,slug), orders(order_number)')
    .eq('seller_id', seller.id)
    .order('created_at', { ascending: false })
    .limit(80);

  const items = reviews || [];
  const average = items.length ? items.reduce((sum: number, review: any) => sum + Number(review.rating || 0), 0) / items.length : 0;
  const visibleCount = items.filter((review: any) => review.is_visible).length;
  const distribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: items.filter((review: any) => Number(review.rating) === rating).length
  }));
  const maxCount = Math.max(...distribution.map((item) => item.count), 1);

  return <main className="mx-auto max-w-7xl">
    <SectionHeading eyebrow="Seller workspace" title="Reviews" copy="Monitor buyer feedback, rating distribution, and product-level review signals." />

    <section className="grid gap-4 md:grid-cols-3">
      <Metric icon={<Star size={18} />} title="Average rating" value={average ? average.toFixed(1) : 'N/A'} copy={`${items.length} reviews`} />
      <Metric icon={<Eye size={18} />} title="Visible reviews" value={String(visibleCount)} copy="Shown publicly when approved" />
      <Metric icon={<ThumbsUp size={18} />} title="Positive reviews" value={String(items.filter((item: any) => Number(item.rating) >= 4).length)} copy="Rated 4 stars or above" />
    </section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[.7fr_1.3fr]">
      <Panel title="Rating Distribution">
        <div className="grid gap-3">
          {distribution.map((row) => <div key={row.rating} className="grid grid-cols-[52px_1fr_36px] items-center gap-3 text-sm">
            <span className="font-black">{row.rating} star</span>
            <span className="h-3 overflow-hidden rounded-full bg-paper"><span className="block h-full rounded-full bg-rust" style={{ width: `${(row.count / maxCount) * 100}%` }} /></span>
            <strong className="text-right">{row.count}</strong>
          </div>)}
        </div>
      </Panel>

      <Panel title="Recent Reviews">
        {items.length ? <div className="grid gap-3">
          {items.map((review: any) => <article key={review.id} className="rounded-xl border border-line bg-white p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Rating rating={review.rating} />
                  {review.is_visible ? <Badge tone="sage">Visible</Badge> : <Badge tone="sand">Hidden</Badge>}
                </div>
                <h2 className="mt-3 font-black">{review.title || 'Buyer review'}</h2>
                <p className="mt-1 text-sm font-bold text-muted">{review.products?.name || 'Product'} - {review.orders?.order_number || 'Order'}</p>
              </div>
              <span className="text-xs font-black text-muted">{date(review.created_at)}</span>
            </div>
            <p className="mt-3 leading-7 text-muted">{review.review_text}</p>
            {review.products?.slug ? <Link href={`/product/${review.products.slug}`} className="mt-3 inline-flex text-sm font-black text-rust">View product</Link> : null}
          </article>)}
        </div> : <Empty copy="Completed orders with buyer reviews will appear here." />}
      </Panel>
    </section>
  </main>;
}

function Metric({ icon, title, value, copy }: { icon: React.ReactNode; title: string; value: string; copy: string }) {
  return <article className="rounded-xl border border-line bg-white p-5"><div className="flex items-center gap-2 text-rust">{icon}<p className="text-sm font-black text-muted">{title}</p></div><strong className="mt-3 block text-3xl">{value}</strong><p className="mt-2 text-xs font-bold text-success">{copy}</p></article>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-line bg-white p-5 shadow-[0_10px_30px_rgba(42,39,36,.04)]"><h2 className="mb-4 font-black">{title}</h2>{children}</section>;
}

function Empty({ copy }: { copy: string }) {
  return <p className="rounded-lg border border-dashed border-line bg-paper p-5 text-sm font-bold text-muted">{copy}</p>;
}

function Rating({ rating }: { rating: number }) {
  return <span className="inline-flex items-center gap-1 text-rust" aria-label={`${rating} star rating`}>
    {Array.from({ length: 5 }, (_, index) => index + 1).map((value) => value <= rating ? <Star key={value} size={16} className="fill-rust" /> : <StarHalf key={value} size={16} className="text-muted/40" />)}
  </span>;
}

function date(value: string) {
  return new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}
