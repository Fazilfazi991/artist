import Link from 'next/link';
import { Badge, SectionHeading } from '@/components/ui';
import { requireAdmin } from '@/lib/services/auth';
import { getAdminOrders } from '@/lib/services/checkout';

export const dynamic = 'force-dynamic';

function money(value: number) { return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`; }

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const orders = await getAdminOrders();
  const filtered = params.status && params.status !== 'all'
    ? params.status === 'issue_reported' ? orders.filter((order: any) => order.issue_reported_at) : orders.filter((order: any) => order.status === params.status)
    : orders;
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><SectionHeading eyebrow="Admin" title="Orders" copy="Inspect marketplace orders, issues, timelines, and development payment state." /><form className="mb-5 flex flex-wrap gap-3 rounded-xl border border-line bg-white p-4"><select name="status" defaultValue={params.status || 'all'} className="min-h-11 rounded-lg border border-line bg-paper px-3"><option value="all">All</option>{['pending_payment','paid','seller_confirmed','in_production','ready_to_ship','dispatched','delivered','completed','cancelled','issue_reported'].map((status) => <option key={status} value={status}>{status}</option>)}</select><button className="rounded-lg bg-ink px-5 py-3 font-black text-white">Filter</button></form>{!filtered.length ? <div className="rounded-xl border border-line bg-white p-8 text-muted">No orders yet.</div> : <div className="grid gap-3">{filtered.map((order: any) => <article key={order.id} className="grid gap-4 rounded-xl border border-line bg-white p-5 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-black">{order.order_number}</h2><Badge>{order.status}</Badge>{order.issue_reported_at ? <Badge tone="sand">Issue</Badge> : null}</div><p className="mt-1 text-sm text-muted">Buyer: {order.profiles?.full_name || order.profiles?.email} · Seller: {order.seller_profiles?.store_name} · {new Date(order.created_at).toLocaleDateString()}</p><p className="mt-1 text-sm text-muted">{(order.order_items || []).map((item: any) => item.product_snapshot?.name).join(', ')}</p></div><div className="flex flex-wrap items-center gap-3 lg:justify-end"><strong>{money(order.total_amount)}</strong><span className="text-sm text-muted">Net {money(order.seller_net_amount)}</span><Link href={`/admin/orders/${order.id}`} className="rounded-lg border border-line px-4 py-3 font-black">View</Link></div></article>)}</div>}</main>;
}
