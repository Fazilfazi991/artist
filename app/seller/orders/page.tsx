import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SectionHeading } from '@/components/ui';
import { getSellerOrders, requireBuyer } from '@/lib/services/checkout';

export const dynamic = 'force-dynamic';

function money(value: number) { return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`; }

export default async function SellerOrdersPage() {
  const user = await requireBuyer();
  if (!user) redirect('/login?next=/seller/orders');
  const { seller, orders } = await getSellerOrders(user.id);
  if (!seller) redirect('/seller/dashboard');
  return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"><SectionHeading eyebrow="Seller dashboard" title="Orders" copy="Read-only placeholder for seller-specific pending-payment orders." />{!orders.length ? <div className="rounded-xl border border-line bg-white p-8 text-muted">No orders yet.</div> : <div className="grid gap-3">{orders.map((order: any) => <article key={order.id} className="grid gap-4 rounded-xl border border-line bg-white p-5 md:grid-cols-[1fr_auto] md:items-center"><div><h2 className="font-black">{order.order_number}</h2><p className="mt-1 text-sm text-muted">{order.profiles?.full_name || order.profiles?.email || 'Buyer'} · {order.status} · {new Date(order.created_at).toLocaleDateString()}</p></div><div className="flex flex-wrap items-center gap-3 md:justify-end"><strong>{money(order.seller_net_amount)}</strong><Link href={`/seller/orders/${order.id}`} className="rounded-lg border border-line px-4 py-3 font-black">View</Link></div></article>)}</div>}</main>;
}
