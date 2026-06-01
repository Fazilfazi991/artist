import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Badge, EmptyState, SectionHeading } from '@/components/ui';
import { getBuyerOrders, requireBuyer } from '@/lib/services/checkout';

export const dynamic = 'force-dynamic';

function money(value: number) { return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`; }
function nextStep(status: string) {
  return ({ pending_payment: 'Payment pending', paid: 'Seller will confirm', seller_confirmed: 'Seller confirmed', in_production: 'In production', ready_to_ship: 'Ready to dispatch', dispatched: 'Track delivery', delivered: 'Delivery confirmed', completed: 'Completed' } as Record<string,string>)[status] || status;
}

export default async function BuyerOrdersPage() {
  const user = await requireBuyer();
  if (!user) redirect('/login?next=/account/orders');
  const orders = await getBuyerOrders(user.id);
  return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"><SectionHeading eyebrow="Account" title="Your orders" copy="Track each seller-specific order from payment through delivery." />{!orders.length ? <EmptyState title="No orders yet" copy="Your handmade purchases will appear here after checkout." /> : <div className="grid gap-3">{orders.map((order: any) => { const first = order.order_items?.[0]; return <article key={order.id} className="grid gap-4 rounded-xl border border-line bg-white p-5 md:grid-cols-[80px_1fr_auto] md:items-center"><img src={first?.product_snapshot?.primary_image || '/artisan-hero.png'} alt="" className="h-20 w-20 rounded-lg object-cover"/><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-black">{order.order_number}</h2><Badge>{order.status}</Badge></div><p className="mt-1 text-sm text-muted">{order.seller_profiles?.store_name} · {new Date(order.created_at).toLocaleDateString()} · {order.order_items?.length || 0} items</p><p className="mt-1 text-sm font-bold text-rust">{nextStep(order.status)}</p></div><div className="flex flex-wrap items-center gap-3 md:justify-end"><strong>{money(order.total_amount)}</strong><Link href={`/account/orders/${order.id}`} className="rounded-lg border border-line px-4 py-3 font-black">Track</Link></div></article>; })}</div>}</main>;
}
