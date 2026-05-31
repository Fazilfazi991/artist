import Link from 'next/link';
import { EmptyState, SectionHeading } from '@/components/ui';
import { getCart } from '@/lib/services/cart';
import { removeCartItemAction, updateCartQuantityAction } from './actions';

export const dynamic = 'force-dynamic';

function money(value: number) {
  return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
}

export default async function CartPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const params = await searchParams;
  const cart = await getCart();
  return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"><SectionHeading eyebrow="Cart" title="Your cart" copy="Review handmade products grouped by artisan before checkout." />{params.error ? <p className="mb-4 rounded-lg border border-rust/30 bg-rust/10 p-3 font-bold text-rust">{params.error}</p> : null}{params.added ? <p className="mb-4 rounded-lg border border-success/30 bg-sage/10 p-3 font-bold text-success">Added to cart.</p> : null}{!cart.items.length ? <EmptyState title="Your cart is waiting for something special." copy="Explore handmade products and add a piece you love." /> : <div className="grid gap-6 lg:grid-cols-[1fr_340px]"><section className="grid gap-5">{cart.errors.map((error) => <p key={error} className="rounded-lg border border-rust/30 bg-rust/10 p-3 text-sm font-bold text-rust">{error}</p>)}{cart.groups.map((group) => <article key={group.seller.id} className="rounded-xl border border-line bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4"><div><h2 className="font-serif text-2xl">{group.seller.store_name}</h2><p className="text-sm text-muted">Seller subtotal {money(group.subtotal)} · Shipping estimate {money(group.shippingFee)}</p></div><Link href={`/artisan/${group.seller.store_slug}`} className="text-sm font-black text-rust">Visit storefront</Link></div><div className="mt-4 grid gap-4">{group.items.map((item: any) => <div key={item.id} className="grid gap-4 rounded-lg border border-line bg-paper p-3 sm:grid-cols-[96px_1fr_auto]"><img src={item.products?.product_images?.[0]?.image_url || '/artisan-hero.png'} alt={item.products?.name || 'Product'} className="h-24 w-24 rounded-lg object-cover"/><div><Link href={`/product/${item.products?.slug}`} className="font-black hover:text-rust">{item.products?.name}</Link><p className="mt-1 text-sm text-muted">{item.products?.product_type} · {money(item.unit_price)}</p>{item.variant_data ? <p className="mt-1 text-xs font-bold text-muted">Variant: {String((item.variant_data as any).name)} {String((item.variant_data as any).value)}</p> : null}<CustomizationSummary data={item.customization_data}/><div className="mt-3 flex flex-wrap gap-2"><form action={updateCartQuantityAction} className="flex items-center gap-2"><input type="hidden" name="item_id" value={item.id}/><input name="quantity" type="number" min="1" defaultValue={item.quantity} className="h-10 w-20 rounded-lg border border-line px-3"/><button className="h-10 rounded-lg border border-line bg-white px-3 text-sm font-black">Update</button></form><form action={removeCartItemAction}><input type="hidden" name="item_id" value={item.id}/><button className="h-10 rounded-lg border border-line bg-white px-3 text-sm font-black text-rust">Remove</button></form></div></div><strong className="sm:text-right">{money(Number(item.unit_price) * Number(item.quantity))}</strong></div>)}</div></article>)}</section><aside className="h-fit rounded-xl border border-line bg-white p-5"><h2 className="font-black">Cart summary</h2><SummaryLine label="Subtotal" value={money(cart.subtotal)} /><SummaryLine label="Shipping estimate" value={money(cart.shippingFee)} /><SummaryLine label="Total" value={money(cart.total)} strong />{cart.errors.length ? <p className="mt-4 rounded-lg bg-rust/10 p-3 text-sm font-bold text-rust">Resolve cart issues before checkout.</p> : <Link href="/checkout" className="mt-5 flex min-h-12 items-center justify-center rounded-lg bg-rust px-5 py-3 font-black text-white">Proceed to Checkout</Link>}<Link href="/shop" className="mt-3 flex min-h-11 items-center justify-center rounded-lg border border-line bg-paper px-5 py-3 font-black">Explore handmade products</Link></aside></div>}</main>;
}

function SummaryLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className={`mt-4 flex items-center justify-between gap-3 ${strong ? 'border-t border-line pt-4 text-lg font-black' : 'text-sm text-muted'}`}><span>{label}</span><span>{value}</span></div>;
}

function CustomizationSummary({ data }: { data: any }) {
  const entries = Object.values(data || {});
  if (!entries.length) return null;
  return <div className="mt-2 grid gap-1 text-xs text-muted">{entries.map((entry: any, index) => <p key={index}><span className="font-bold">{entry.label || 'Customization'}:</span> {entry.value || entry.name || 'File attached privately'}</p>)}</div>;
}
