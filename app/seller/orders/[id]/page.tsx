import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { SectionHeading } from '@/components/ui';
import { getSellerOrder, requireBuyer } from '@/lib/services/checkout';

export const dynamic = 'force-dynamic';

function money(value: number) { return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`; }

export default async function SellerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireBuyer();
  if (!user) redirect('/login?next=/seller/orders');
  const { id } = await params;
  const order = await getSellerOrder(id, user.id);
  if (!order) notFound();
  const address = order.shipping_address || {};
  return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"><SectionHeading eyebrow="Seller order" title={order.order_number} copy={`${order.status} · Buyer: ${order.profiles?.full_name || order.profiles?.email || 'Buyer'}`} action={<Link href="/seller/orders" className="rounded-lg border border-line px-4 py-3 font-black">All orders</Link>} /><div className="grid gap-5 lg:grid-cols-[1fr_320px]"><section className="grid gap-4">{order.order_items?.map((item: any) => <article key={item.id} className="rounded-xl border border-line bg-white p-5"><h2 className="font-black">{item.product_snapshot?.name || 'Product'}</h2><p className="mt-1 text-sm text-muted">Qty {item.quantity} · {money(item.unit_price)}</p><Snapshot data={item.customization_data} /></article>)}</section><aside className="grid h-fit gap-4"><article className="rounded-xl border border-line bg-white p-5"><h2 className="font-black">Ship to</h2><p className="mt-2 text-sm leading-6 text-muted">{address.full_name}<br/>{address.phone}<br/>{address.address_line_1}{address.address_line_2 ? `, ${address.address_line_2}` : ''}<br/>{address.city}, {address.state} {address.postal_code}</p></article><article className="rounded-xl border border-line bg-white p-5"><h2 className="font-black">Seller totals</h2><Line label="Subtotal" value={money(order.subtotal)} /><Line label="Commission" value={money(order.platform_commission)} /><Line label="Seller net" value={money(order.seller_net_amount)} strong /></article></aside></div></main>;
}

function Line({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) { return <p className={`mt-3 flex justify-between ${strong ? 'border-t border-line pt-3 font-black' : 'text-sm text-muted'}`}><span>{label}</span><span>{value}</span></p>; }
function Snapshot({ data }: { data: any }) { const entries = Object.values(data || {}); if (!entries.length) return null; return <div className="mt-3 rounded-lg bg-paper p-3 text-sm text-muted"><p className="font-black text-ink">Customization</p>{entries.map((entry: any, index) => <p key={index}>{entry.label || 'Field'}: {entry.value || entry.name || 'Private file attached'}</p>)}</div>; }
