import Link from 'next/link';
import { SectionHeading } from '@/components/ui';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function money(value: number) { return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`; }

export default async function CheckoutConfirmationPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const params = await searchParams;
  const ids = (params.orders || '').split(',').filter(Boolean);
  const service = createServiceRoleClient();
  const { data: orders } = ids.length ? await service.from('orders').select('*, seller_profiles(store_name, store_slug)').in('id', ids) : { data: [] as any[] };
  return <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6"><SectionHeading eyebrow="Order created" title="Your seller-specific orders are ready" copy="Payment is not connected yet, so these orders remain pending payment for testing." /><div className="grid gap-4">{(orders || []).map((order: any) => <article key={order.id} className="rounded-xl border border-line bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black">{order.order_number}</h2><p className="text-sm text-muted">{order.seller_profiles?.store_name}</p></div><span className="rounded-md bg-gold/20 px-3 py-1 text-xs font-black text-ink">{order.status}</span></div><p className="mt-3 font-black">{money(order.total_amount)}</p><Link href={`/account/orders/${order.id}`} className="mt-4 inline-flex rounded-lg border border-line px-4 py-3 font-black">View order</Link></article>)}</div><div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link href="/account/orders" className="rounded-lg bg-rust px-5 py-3 text-center font-black text-white">View Orders</Link><Link href="/shop" className="rounded-lg border border-line bg-white px-5 py-3 text-center font-black">Continue Shopping</Link></div></main>;
}
