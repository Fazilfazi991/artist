import Image from 'next/image';
import Link from 'next/link';
import { BarChart3, Bell, Box, ChevronDown, CreditCard, Grid2X2, Heart, Home, Layers3, Leaf, MessageSquare, Package, Palette, Settings, ShoppingBag, Star, Store, TrendingUp } from 'lucide-react';
import { SectionHeading } from '@/components/ui';
import { requireApprovedSeller } from '@/lib/services/auth';
import { createClient, hasSupabaseServerEnv } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const orderStatuses = ['draft', 'in_production', 'ready_to_ship', 'dispatched', 'delivered'] as const;

const navItems = [
  ['Overview', '/seller/dashboard', Grid2X2],
  ['Orders', '/seller/orders', ShoppingBag],
  ['Products', '/seller/products', Box],
  ['Collections', '/seller/collections', Layers3],
  ['Storefront', '/seller/storefront', Store],
  ['Custom Orders', '/seller/custom-requests', Palette],
  ['Payouts', '#', CreditCard],
  ['Analytics', '#', BarChart3],
  ['Reviews', '#', Star],
  ['Messages', '#', MessageSquare],
  ['Settings', '#', Settings]
] as const;

export default async function SellerDashboardPage() {
  if (!hasSupabaseServerEnv()) return <SellerSetupMissing />;

  let seller: any = null;
  try {
    seller = await requireApprovedSeller();
  } catch (error) {
    if ((error as any)?.digest?.startsWith?.('NEXT_REDIRECT')) throw error;
    console.error('seller dashboard failed', error);
    return <SellerAuthUnavailable />;
  }

  const supabase = await createClient();
  const [{ data: products }, { data: orders }, { data: customRequests }] = await Promise.all([
    supabase.from('products').select('*, product_images(*)').eq('seller_id', seller.id).order('updated_at', { ascending: false }).limit(24),
    supabase.from('orders').select('*, order_items(*)').eq('seller_id', seller.id).order('created_at', { ascending: false }).limit(24),
    supabase.from('custom_order_requests').select('*').eq('seller_id', seller.id).order('created_at', { ascending: false }).limit(24)
  ]);

  const productItems = products || [];
  const orderItems = orders || [];
  const requestItems = customRequests || [];
  const totalSales = orderItems.reduce((sum: number, order: any) => sum + Number(order.seller_net_amount || 0), 0);
  const pendingOrders = orderItems.filter((order: any) => ['paid', 'seller_confirmed', 'in_production', 'ready_to_ship'].includes(order.status)).length;
  const pendingCustom = requestItems.filter((request: any) => !['completed', 'cancelled'].includes(request.status)).length;
  const totalStock = productItems.reduce((sum: number, product: any) => sum + Number(product.stock_quantity || 0), 0);
  const statusCounts = orderStatuses.map((status) => [status, orderItems.filter((order: any) => normalizeOrderStatus(order.status) === status).length] as const);
  const topProducts = productItems.slice(0, 3);
  const tableProducts = productItems.slice(0, 5);

  return <main className="bg-[#fbf3e8] bg-[radial-gradient(circle_at_0%_100%,rgba(201,138,107,.18),transparent_28%),radial-gradient(circle_at_100%_10%,rgba(126,148,120,.16),transparent_24%)] px-3 py-6 text-ink sm:px-5 lg:px-8">
    <section className="mx-auto max-w-7xl text-center">
      <p className="font-serif text-3xl font-bold uppercase tracking-[.08em] text-rust sm:text-4xl">Warm & Artisanal</p>
      <p className="mt-1 text-sm font-semibold text-muted">A friendly seller dashboard designed for artisan brands.</p>
      <div className="mx-auto mt-2 h-px w-16 bg-rust/40" />
    </section>

    <section className="mx-auto mt-5 grid max-w-7xl overflow-hidden rounded-lg border border-clay/50 bg-white/70 shadow-soft backdrop-blur lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-clay/30 bg-[#fff8ef]/80 p-5 lg:border-b-0 lg:border-r">
        <Link href={`/artisan/${seller.store_slug}`} className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full border border-clay/50 bg-sand text-rust"><Leaf size={24} /></span>
          <span className="min-w-0">
            <strong className="block truncate font-serif text-xl">{seller.store_name}</strong>
            <span className="text-xs font-bold text-muted">Seller Dashboard</span>
          </span>
        </Link>
        <nav className="mt-6 grid gap-1">
          {navItems.map(([label, href, Icon]) => href === '#'
            ? <span key={label} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-muted/70"><span className="flex items-center gap-3"><Icon size={17} />{label}</span><span className="text-[10px] uppercase">Soon</span></span>
            : <Link key={label} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-black transition hover:bg-rust/10 hover:text-rust ${label === 'Overview' ? 'bg-rust text-white hover:bg-rust hover:text-white' : ''}`}><Icon size={17} />{label}</Link>)}
        </nav>
        <div className="mt-8 flex items-center gap-3 rounded-lg bg-white/80 p-3 shadow-[0_8px_22px_rgba(42,39,36,.06)]">
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-sand">
            {seller.profile_image_url ? <Image src={seller.profile_image_url} alt="" fill sizes="48px" className="object-cover" /> : <div className="grid h-full place-items-center font-serif text-xl text-rust">{seller.store_name?.[0] || 'S'}</div>}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black">{seller.store_name}</p>
            <Link href={`/artisan/${seller.store_slug}`} className="text-xs font-bold text-rust">View Store {'->'}</Link>
          </div>
        </div>
      </aside>

      <div className="min-w-0 p-4 sm:p-6">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="font-serif text-3xl font-bold leading-tight">Welcome back, {seller.store_name}</h1>
            <p className="mt-1 text-sm font-semibold text-muted">Here is what is happening with your artisan business today.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-xs font-black">This Month <ChevronDown size={14} /></button>
            <span className="relative grid h-10 w-10 place-items-center rounded-full bg-white text-rust"><Bell size={17} />{pendingCustom ? <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-rust text-[10px] font-black text-white">{Math.min(pendingCustom, 9)}</span> : null}</span>
          </div>
        </header>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total Sales" value={money(totalSales)} note={`${orderItems.length} orders tracked`} />
          <Metric label="Orders" value={String(orderItems.length)} note={`${pendingOrders} need attention`} />
          <Metric label="Custom Requests" value={String(pendingCustom)} note={`${requestItems.length} total enquiries`} />
          <Metric label="Product Stock" value={String(totalStock)} note={`${productItems.length} products listed`} />
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.15fr_.95fr]">
          <Panel title="Order Overview" action={<Link href="/seller/orders">View all orders {'->'}</Link>}>
            <div className="grid gap-2">
              {statusCounts.map(([status, count], index) => <div key={status} className="flex items-center justify-between rounded-lg border border-line/70 bg-[#fffaf3] px-3 py-2 text-sm">
                <span className="flex min-w-0 items-center gap-2 font-bold"><span className={`h-3 w-3 rounded ${['bg-marigold','bg-clay','bg-rust','bg-sage','bg-success'][index]}`} />{statusLabel(status)}</span>
                <strong>{count}</strong>
              </div>)}
            </div>
          </Panel>
          <Panel title="Sales Overview" action={<Link href="/seller/orders">Orders {'->'}</Link>}>
            <div className="flex h-40 items-end gap-2 border-b border-line px-1 pb-3">
              {[18, 32, 24, 46, 58, 43, 76, 54, 90].map((height, index) => <span key={index} className="flex-1 rounded-t bg-rust/20" style={{ height: `${height}%` }}><span className="block h-full rounded-t bg-gradient-to-t from-rust/55 to-clay/35" /></span>)}
            </div>
            <div className="mt-3 flex justify-between text-xs font-bold text-muted"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span></div>
          </Panel>
          <Panel title="Top Products" action={<Link href="/seller/products">View all products {'->'}</Link>}>
            <div className="grid gap-3">
              {topProducts.length ? topProducts.map((product: any) => <ProductMini key={product.id} product={product} />) : <p className="rounded-lg bg-[#fffaf3] p-4 text-sm font-semibold text-muted">Add products to see them here.</p>}
            </div>
          </Panel>
        </section>

        <Panel title="Recent Orders" className="mt-4" action={<Link href="/seller/orders">View all orders {'->'}</Link>}>
          <div className="grid gap-2">
            {orderItems.slice(0, 3).length ? orderItems.slice(0, 3).map((order: any) => <div key={order.id} className="grid gap-2 rounded-lg border-b border-line/80 px-1 py-2 text-sm last:border-b-0 sm:grid-cols-[1fr_auto_auto] sm:items-center">
              <div><strong>{order.order_number}</strong><p className="text-xs text-muted">{formatDate(order.created_at)}</p></div>
              <strong>{money(order.seller_net_amount)}</strong>
              <StatusPill>{statusLabel(normalizeOrderStatus(order.status))}</StatusPill>
            </div>) : <p className="rounded-lg bg-[#fffaf3] p-4 text-sm font-semibold text-muted">No orders yet.</p>}
          </div>
        </Panel>
      </div>
    </section>

    <section className="mx-auto mt-4 max-w-7xl rounded-lg border border-clay/50 bg-white/75 p-4 shadow-soft backdrop-blur sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="font-serif text-2xl font-bold">Products</h2>
        <Link href="/seller/products/new" className="inline-flex min-h-10 items-center justify-center rounded-lg bg-rust px-4 text-sm font-black text-white">+ Add Product</Link>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="border-y border-line text-xs uppercase text-muted">
            <tr><th className="py-3 pr-4">Product</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">Updated</th></tr>
          </thead>
          <tbody>
            {tableProducts.length ? tableProducts.map((product: any) => <tr key={product.id} className="border-b border-line/70">
              <td className="py-3 pr-4"><div className="flex items-center gap-3"><ProductThumb product={product} /><strong>{product.name}</strong></div></td>
              <td className="px-4 py-3 font-bold">{product.base_price == null ? 'Quote' : money(product.base_price)}</td>
              <td className="px-4 py-3"><StatusPill tone={product.status === 'active' ? 'sage' : product.status === 'pending_review' ? 'gold' : 'rust'}>{product.status === 'pending_review' ? 'Pending Review' : product.status}</StatusPill></td>
              <td className="px-4 py-3 font-bold">{product.stock_quantity ?? 'N/A'}</td>
              <td className="px-4 py-3 font-bold">{countProductOrders(product.id, orderItems)}</td>
              <td className="px-4 py-3 text-muted">{formatDate(product.updated_at)}</td>
            </tr>) : <tr><td colSpan={6} className="py-8 text-center font-semibold text-muted">No products yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>

    <section className="mx-auto mt-4 grid max-w-7xl gap-4 rounded-lg border border-clay/50 bg-white/75 p-5 shadow-soft backdrop-blur md:grid-cols-4">
      <Feature icon={<Home size={26} />} title="Why sellers love this dashboard" copy="Warm, earthy, and focused on artisan business flow." />
      <Feature icon={<Heart size={26} />} title="Warm & Friendly" copy="A calm interface for products, orders, and custom work." />
      <Feature icon={<Palette size={26} />} title="Handmade Aesthetic" copy="Soft colors and rounded cards that match the marketplace." />
      <Feature icon={<TrendingUp size={26} />} title="Everything at a Glance" copy="Quick access to the numbers and actions that matter." />
    </section>
  </main>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="rounded-lg border border-line bg-white/85 p-5 shadow-[0_8px_22px_rgba(42,39,36,.05)]"><p className="text-sm font-black">{label}</p><strong className="mt-2 block text-3xl">{value}</strong><p className="mt-2 text-xs font-bold text-success">{note}</p></article>;
}

function Panel({ title, action, className = '', children }: { title: string; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return <section className={`rounded-lg border border-line bg-white/85 p-5 shadow-[0_8px_22px_rgba(42,39,36,.05)] ${className}`}><div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-black">{title}</h2>{action ? <div className="text-xs font-black text-rust">{action}</div> : null}</div>{children}</section>;
}

function ProductMini({ product }: { product: any }) {
  return <div className="grid grid-cols-[52px_1fr_auto] items-center gap-3"><ProductThumb product={product} /><div className="min-w-0"><p className="truncate text-sm font-black">{product.name}</p><p className="text-xs font-bold text-muted">{product.base_price == null ? 'Quote' : money(product.base_price)}</p></div><span className="text-xs font-black text-muted">{product.stock_quantity ?? 0} stock</span></div>;
}

function ProductThumb({ product }: { product: any }) {
  const image = product.product_images?.[0]?.image_url;
  return <span className="relative block h-12 w-12 overflow-hidden rounded-lg bg-sand">{image ? <Image src={image} alt="" fill sizes="48px" className="object-cover" /> : <Package className="m-3 text-rust" size={24} />}</span>;
}

function StatusPill({ children, tone = 'rust' }: { children: React.ReactNode; tone?: 'rust' | 'sage' | 'gold' }) {
  const cls = tone === 'sage' ? 'bg-success/15 text-success' : tone === 'gold' ? 'bg-marigold/20 text-rust' : 'bg-rust/10 text-rust';
  return <span className={`inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-black ${cls}`}>{children}</span>;
}

function Feature({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="flex gap-4 border-line md:border-r md:pr-4 md:last:border-r-0"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-clay/40 bg-sand text-rust">{icon}</span><div><h3 className="font-black">{title}</h3><p className="mt-1 text-sm leading-5 text-muted">{copy}</p></div></div>;
}

function normalizeOrderStatus(status: string) {
  if (['paid', 'seller_confirmed'].includes(status)) return 'draft';
  if (status === 'ready_to_ship') return 'ready_to_ship';
  if (status === 'delivered' || status === 'completed') return 'delivered';
  if (status === 'dispatched') return 'dispatched';
  return status === 'in_production' ? 'in_production' : 'draft';
}

function statusLabel(status: string) {
  return status.split('_').map((part) => part[0]?.toUpperCase() + part.slice(1)).join(' ');
}

function countProductOrders(productId: string, orders: any[]) {
  return orders.reduce((sum, order) => sum + (order.order_items || []).filter((item: any) => item.product_id === productId).length, 0);
}

function money(value: number | string | null | undefined) {
  return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function SellerSetupMissing() {
  return <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6"><SectionHeading eyebrow="Seller dashboard" title="Seller tools need setup" copy="Supabase environment variables are missing or invalid on this deployment. Add the project URL and anon key in Vercel, then redeploy." /><Link href="/" className="font-black text-rust">Back to marketplace</Link></main>;
}

function SellerAuthUnavailable() {
  return <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6"><SectionHeading eyebrow="Seller dashboard" title="Seller login is not ready" copy="Supabase Auth returned an error. Check Supabase Auth logs and the profile trigger, then try again." /><Link href="/login?next=/seller/dashboard" className="font-black text-rust">Go to login</Link></main>;
}
