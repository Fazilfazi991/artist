import Image from 'next/image';
import Link from 'next/link';
import { Bell, ChevronDown, Package, Palette, Plus, ShoppingBag, Store } from 'lucide-react';
import { SectionHeading } from '@/components/ui';
import { requireApprovedSeller } from '@/lib/services/auth';
import { createClient, hasSupabaseServerEnv } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const trackedStatuses = ['paid', 'in_production', 'ready_to_ship', 'dispatched', 'delivered'] as const;

export default async function SellerDashboardPage() {
  if (!hasSupabaseServerEnv()) return <SellerSetupMissing />;
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  const [{ data: products }, { data: orders }, { data: customRequests }, { data: settings }] = await Promise.all([
    supabase.from('products').select('*, product_images(*)').eq('seller_id', seller.id).order('updated_at', { ascending: false }).limit(24),
    supabase.from('orders').select('*, order_items(*)').eq('seller_id', seller.id).order('created_at', { ascending: false }).limit(24),
    supabase.from('custom_order_requests').select('*').eq('seller_id', seller.id).order('created_at', { ascending: false }).limit(12),
    supabase.from('storefront_settings').select('*').eq('seller_id', seller.id).maybeSingle()
  ]);

  const productItems = products || [];
  const orderItems = orders || [];
  const requestItems = customRequests || [];
  const totalSales = orderItems.reduce((sum: number, order: any) => sum + Number(order.seller_net_amount || 0), 0);
  const pendingOrders = orderItems.filter((order: any) => ['paid', 'seller_confirmed', 'in_production', 'ready_to_ship'].includes(order.status)).length;
  const activeRequests = requestItems.filter((request: any) => !['completed', 'cancelled'].includes(request.status)).length;
  const topProducts = productItems.slice(0, 4);
  const orderCounts = trackedStatuses.map((status) => [status, orderItems.filter((order: any) => normalizeStatus(order.status) === status).length] as const);

  return <div className="mx-auto grid max-w-7xl gap-5">
    <section className="rounded-xl border border-line bg-white p-5 shadow-[0_10px_30px_rgba(105,41,106,.09)] sm:p-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[.12em] text-rust">{seller.store_name}</p>
          <h2 className="mt-2 font-serif text-4xl leading-tight">Welcome back, {seller.store_name}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Here is what is happening with your artisan business today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-paper px-4 text-sm font-black">This month <ChevronDown size={15} /></button>
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-paper text-rust"><Bell size={18} /></span>
          <Link href={`/artisan/${seller.store_slug}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-rust px-4 text-sm font-black text-white">View Storefront</Link>
        </div>
      </div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric title="Total Sales" value={money(totalSales)} copy="Seller net from recent orders" />
      <Metric title="Orders" value={String(orderItems.length)} copy={`${pendingOrders} need attention`} />
      <Metric title="Custom Requests" value={String(activeRequests)} copy="Open bespoke conversations" />
      <Metric title="Store Visits" value="--" copy="Analytics placeholder" />
    </section>

    <section className="grid gap-5 xl:grid-cols-[1fr_1.1fr_.95fr]">
      <Panel title="Order Overview" action={<Link href="/seller/orders">View orders</Link>}>
        <div className="grid gap-2">
          {orderCounts.map(([status, count]) => <div key={status} className="flex items-center justify-between rounded-lg bg-paper px-3 py-2 text-sm">
            <span className="font-bold">{label(status)}</span>
            <strong>{count}</strong>
          </div>)}
        </div>
      </Panel>
      <Panel title="Sales Overview">
        <div className="flex h-44 items-end gap-2 border-b border-line px-1 pb-3">
          {[22, 38, 28, 62, 54, 76, 48, 88].map((height, index) => <span key={index} className="flex-1 rounded-t bg-rust/20" style={{ height: `${height}%` }}><span className="block h-full rounded-t bg-gradient-to-t from-rust/70 to-clay/35" /></span>)}
        </div>
        <div className="mt-3 flex justify-between text-xs font-bold text-muted"><span>W1</span><span>W2</span><span>W3</span><span>W4</span></div>
      </Panel>
      <Panel title="Top Products" action={<Link href="/seller/products">View products</Link>}>
        <div className="grid gap-3">
          {topProducts.length ? topProducts.map((product: any) => <ProductRow key={product.id} product={product} />) : <p className="rounded-lg bg-paper p-4 text-sm font-semibold text-muted">Add products to see performance here.</p>}
        </div>
      </Panel>
    </section>

    <section className="grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
      <Panel title="Recent Orders" action={<Link href="/seller/orders">View all orders</Link>}>
        <div className="grid gap-2">
          {orderItems.slice(0, 4).length ? orderItems.slice(0, 4).map((order: any) => <div key={order.id} className="grid gap-2 rounded-lg border border-line bg-white px-3 py-3 text-sm md:grid-cols-[1fr_auto_auto_auto] md:items-center">
            <div><strong>{order.order_number}</strong><p className="text-xs text-muted">{formatDate(order.created_at)}</p></div>
            <span className="text-muted">{order.profiles?.full_name || 'Buyer'}</span>
            <strong>{money(order.seller_net_amount)}</strong>
            <Link href={`/seller/orders/${order.id}`} className="font-black text-rust">View</Link>
          </div>) : <p className="rounded-lg bg-paper p-4 text-sm font-semibold text-muted">No recent orders yet.</p>}
        </div>
      </Panel>
      <Panel title="Quick Actions">
        <div className="grid gap-2">
          <QuickAction href="/seller/products/new" icon={<Plus size={17} />} label="Add Product" />
          <QuickAction href="/seller/storefront" icon={<Store size={17} />} label="Manage Storefront" />
          <QuickAction href="/seller/orders" icon={<ShoppingBag size={17} />} label="View Orders" />
          <QuickAction href="/seller/custom-requests" icon={<Palette size={17} />} label="Check Custom Requests" />
        </div>
        <div className="mt-4 rounded-lg border border-line bg-paper p-4 text-sm">
          <strong>Storefront status</strong>
          <p className="mt-1 text-muted">{settings?.is_published ? 'Published and visible to buyers.' : 'Unpublished. Finish setup and publish when ready.'}</p>
        </div>
      </Panel>
    </section>
  </div>;
}

function Metric({ title, value, copy }: { title: string; value: string; copy: string }) {
  return <article className="rounded-xl border border-line bg-white p-5 shadow-[0_10px_30px_rgba(105,41,106,.08)]"><p className="text-sm font-black text-muted">{title}</p><strong className="mt-2 block text-3xl">{value}</strong><p className="mt-2 text-xs font-bold text-success">{copy}</p></article>;
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-xl border border-line bg-white p-5 shadow-[0_10px_30px_rgba(105,41,106,.08)]"><div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-black">{title}</h3>{action ? <div className="text-xs font-black text-rust">{action}</div> : null}</div>{children}</section>;
}

function ProductRow({ product }: { product: any }) {
  const image = product.product_images?.[0]?.image_url;
  return <div className="grid grid-cols-[48px_1fr_auto] items-center gap-3"><span className="relative h-12 w-12 overflow-hidden rounded-lg bg-sand">{image ? <Image src={image} alt="" fill sizes="48px" className="object-cover" /> : <Package className="m-3 text-rust" size={22} />}</span><div className="min-w-0"><p className="truncate text-sm font-black">{product.name}</p><p className="text-xs text-muted">{product.base_price == null ? 'Quote' : money(product.base_price)}</p></div><span className="text-xs font-black text-muted">{product.stock_quantity ?? 0} stock</span></div>;
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return <Link href={href} className="flex min-h-11 items-center gap-3 rounded-lg border border-line bg-paper px-3 text-sm font-black text-ink hover:text-rust">{icon}{label}</Link>;
}

function normalizeStatus(status: string) {
  if (['paid', 'seller_confirmed'].includes(status)) return 'paid';
  if (status === 'completed') return 'delivered';
  return status;
}

function label(status: string) {
  if (status === 'paid') return 'New Orders';
  return status.split('_').map((part) => part[0]?.toUpperCase() + part.slice(1)).join(' ');
}

function money(value: number | string | null | undefined) {
  return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function SellerSetupMissing() {
  return <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6"><SectionHeading eyebrow="Seller dashboard" title="Seller tools need setup" copy="Supabase environment variables are missing or invalid on this deployment." /></div>;
}
