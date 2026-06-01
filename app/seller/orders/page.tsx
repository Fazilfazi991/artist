import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Badge, SectionHeading } from '@/components/ui';
import { getSellerOrders, requireBuyer } from '@/lib/services/checkout';

export const dynamic = 'force-dynamic';

function money(value: number) { return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`; }
function actionLabel(order: any) {
  if (order.status === 'pending_payment') return 'Awaiting payment';
  if (order.status === 'paid') return 'Confirm order';
  if (order.status === 'seller_confirmed') return (order.order_items || []).some((item: any) => item.product_snapshot?.product_type === 'customized') ? 'Start production' : 'Mark ready';
  if (order.status === 'in_production') return 'Add update';
  if (order.status === 'ready_to_ship') return 'Dispatch';
  if (order.status === 'dispatched') return 'Await delivery';
  return order.status;
}

export default async function SellerOrdersPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const params = await searchParams;
  const user = await requireBuyer();
  if (!user) redirect('/login?next=/seller/orders');
  const { seller, orders } = await getSellerOrders(user.id);
  if (!seller) redirect('/seller/dashboard');
  const filtered = params.status && params.status !== 'all' ? orders.filter((order: any) => order.status === params.status) : orders;
  const cards = [
    ['New paid orders', orders.filter((o: any) => o.status === 'paid').length],
    ['Awaiting confirmation', orders.filter((o: any) => o.status === 'paid').length],
    ['In production', orders.filter((o: any) => o.status === 'in_production').length],
    ['Ready to dispatch', orders.filter((o: any) => o.status === 'ready_to_ship').length],
    ['Completed this month', orders.filter((o: any) => o.status === 'completed').length]
  ];
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><SectionHeading eyebrow="Seller dashboard" title="Orders" copy="Confirm, produce, dispatch, and track seller-specific orders." /><div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{cards.map(([label, value]) => <article key={label} className="rounded-xl border border-line bg-white p-4"><p className="text-sm text-muted">{label}</p><strong className="mt-2 block text-2xl">{value}</strong></article>)}</div><form className="mb-5 flex flex-wrap gap-3 rounded-xl border border-line bg-white p-4"><select name="status" defaultValue={params.status || 'all'} className="min-h-11 rounded-lg border border-line bg-paper px-3"><option value="all">All</option>{['pending_payment','paid','seller_confirmed','in_production','ready_to_ship','dispatched','delivered','completed','cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}</select><button className="rounded-lg bg-ink px-5 py-3 font-black text-white">Filter</button></form>{!filtered.length ? <div className="rounded-xl border border-line bg-white p-8 text-muted">No orders match this view.</div> : <div className="grid gap-3">{filtered.map((order: any) => { const first = order.order_items?.[0]; return <article key={order.id} className="grid gap-4 rounded-xl border border-line bg-white p-5 lg:grid-cols-[80px_1fr_auto] lg:items-center"><img src={first?.product_snapshot?.primary_image || '/artisan-hero.png'} alt="" className="h-20 w-20 rounded-lg object-cover"/><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-black">{order.order_number}</h2><Badge>{order.status}</Badge>{(order.order_items || []).some((item: any) => item.product_snapshot?.product_type === 'customized') ? <Badge tone="sand">Customized</Badge> : null}</div><p className="mt-1 text-sm text-muted">{order.profiles?.full_name || order.profiles?.email || 'Buyer'} · {new Date(order.created_at).toLocaleDateString()} · {(order.order_items || []).map((item: any) => item.product_snapshot?.name).join(', ')}</p><p className="mt-1 text-sm font-bold text-rust">{actionLabel(order)}</p></div><div className="flex flex-wrap items-center gap-3 lg:justify-end"><strong>{money(order.seller_net_amount)}</strong><Link href={`/seller/orders/${order.id}`} className="rounded-lg border border-line px-4 py-3 font-black">View</Link></div></article>; })}</div>}</main>;
}
