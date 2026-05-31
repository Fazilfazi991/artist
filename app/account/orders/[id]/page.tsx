import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { SectionHeading } from '@/components/ui';
import { getBuyerOrder, requireBuyer } from '@/lib/services/checkout';

export const dynamic = 'force-dynamic';

function money(value: number) { return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`; }

export default async function BuyerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireBuyer();
  if (!user) redirect('/login?next=/account/orders');
  const { id } = await params;
  const order = await getBuyerOrder(id, user.id);
  if (!order) notFound();
  const address = order.shipping_address || {};
  return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"><SectionHeading eyebrow="Order detail" title={order.order_number} copy={`From ${order.seller_profiles?.store_name || 'Artisan'} · ${order.status}`} action={<Link href="/account/orders" className="rounded-lg border border-line px-4 py-3 font-black">All orders</Link>} /><div className="grid gap-5 lg:grid-cols-[1fr_320px]"><section className="grid gap-4">{order.order_items?.map((item: any) => <article key={item.id} className="rounded-xl border border-line bg-white p-5"><h2 className="font-black">{item.product_snapshot?.name || 'Product'}</h2><p className="mt-1 text-sm text-muted">Qty {item.quantity} · {money(item.unit_price)}</p><Snapshot data={item.variant_data} title="Variant" /><Snapshot data={item.customization_data} title="Customization" /></article>)}<article className="rounded-xl border border-line bg-white p-5"><h2 className="font-black">Status timeline</h2><div className="mt-3 grid gap-2 text-sm text-muted">{(order.order_status_history || []).map((entry: any) => <p key={entry.id}>{entry.status} · {new Date(entry.created_at).toLocaleString()}</p>)}</div></article></section><aside className="grid h-fit gap-4"><article className="rounded-xl border border-line bg-white p-5"><h2 className="font-black">Delivery address</h2><p className="mt-2 text-sm leading-6 text-muted">{address.full_name}<br/>{address.address_line_1}{address.address_line_2 ? `, ${address.address_line_2}` : ''}<br/>{address.city}, {address.state} {address.postal_code}<br/>{address.phone}</p></article><article className="rounded-xl border border-line bg-white p-5"><h2 className="font-black">Price summary</h2><Line label="Subtotal" value={money(order.subtotal)} /><Line label="Shipping" value={money(order.shipping_fee)} /><Line label="Total" value={money(order.total_amount)} strong /><p className="mt-4 rounded-lg bg-gold/20 p-3 text-sm font-bold">Pending payment. Online payment arrives in the next sprint.</p></article></aside></div></main>;
}

function Line({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) { return <p className={`mt-3 flex justify-between ${strong ? 'border-t border-line pt-3 font-black' : 'text-sm text-muted'}`}><span>{label}</span><span>{value}</span></p>; }
function Snapshot({ title, data }: { title: string; data: any }) { const entries = Object.values(data || {}); if (!entries.length) return null; return <div className="mt-3 rounded-lg bg-paper p-3 text-sm text-muted"><p className="font-black text-ink">{title}</p>{entries.map((entry: any, index) => <p key={index}>{entry.label || entry.name || 'Option'}: {entry.value || entry.name || 'Private file attached'}</p>)}</div>; }
