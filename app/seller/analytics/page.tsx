import Link from 'next/link';
import { BarChart3, Boxes, MessageSquare, ShoppingBag, Star } from 'lucide-react';
import { SectionHeading } from '@/components/ui';
import { requireApprovedSeller } from '@/lib/services/auth';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SellerAnalyticsPage() {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  const [{ data: orders }, { data: products }, { data: customRequests }, { data: reviews }] = await Promise.all([
    supabase.from('orders').select('id,status,subtotal,total_amount,seller_net_amount,created_at,order_items(quantity,product_snapshot)').eq('seller_id', seller.id).order('created_at', { ascending: false }).limit(100),
    supabase.from('products').select('id,name,status,stock_quantity,base_price,created_at').eq('seller_id', seller.id).order('created_at', { ascending: false }).limit(100),
    supabase.from('custom_order_requests').select('id,status,budget_min,budget_max,created_at').eq('seller_id', seller.id).order('created_at', { ascending: false }).limit(100),
    supabase.from('reviews').select('id,rating,is_visible,created_at').eq('seller_id', seller.id).order('created_at', { ascending: false }).limit(100)
  ]);

  const orderItems = orders || [];
  const productItems = products || [];
  const requestItems = customRequests || [];
  const reviewItems = reviews || [];
  const netSales = orderItems.reduce((sum: number, order: any) => sum + Number(order.seller_net_amount || 0), 0);
  const grossSales = orderItems.reduce((sum: number, order: any) => sum + Number(order.total_amount || 0), 0);
  const unitsSold = orderItems.flatMap((order: any) => order.order_items || []).reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0);
  const averageRating = reviewItems.length ? reviewItems.reduce((sum: number, review: any) => sum + Number(review.rating || 0), 0) / reviewItems.length : 0;
  const monthly = buildMonthly(orderItems);
  const maxMonthly = Math.max(...monthly.map((item) => item.total), 1);
  const statusRows = ['pending_payment', 'paid', 'seller_confirmed', 'in_production', 'ready_to_ship', 'dispatched', 'delivered', 'completed'].map((status) => ({
    status,
    count: orderItems.filter((order: any) => order.status === status).length
  }));
  const topProducts = productPerformance(orderItems).slice(0, 5);

  return <main className="mx-auto max-w-7xl">
    <SectionHeading eyebrow="Seller workspace" title="Analytics" copy="Track recent sales, product movement, custom-order demand, and review quality from one operational view." />

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Metric icon={<ShoppingBag size={18} />} title="Net sales" value={money(netSales)} copy={`${orderItems.length} recent orders`} />
      <Metric icon={<BarChart3 size={18} />} title="Gross sales" value={money(grossSales)} copy="Before commissions and fees" />
      <Metric icon={<Boxes size={18} />} title="Units sold" value={String(unitsSold)} copy={`${productItems.filter((item: any) => item.status === 'active').length} active products`} />
      <Metric icon={<MessageSquare size={18} />} title="Custom demand" value={String(requestItems.length)} copy={`${requestItems.filter((item: any) => !['completed', 'cancelled'].includes(item.status)).length} open requests`} />
      <Metric icon={<Star size={18} />} title="Avg rating" value={averageRating ? averageRating.toFixed(1) : 'N/A'} copy={`${reviewItems.length} visible reviews`} />
    </section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
      <Panel title="Sales Trend">
        <div className="flex h-64 items-end gap-2 border-b border-line px-1 pb-3">
          {monthly.map((item) => <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <span className="w-full rounded-t bg-rust/15" style={{ height: `${Math.max((item.total / maxMonthly) * 100, 7)}%` }}><span className="block h-full rounded-t bg-gradient-to-t from-rust/80 to-clay/40" /></span>
          </div>)}
        </div>
        <div className="mt-3 grid grid-cols-6 gap-2 text-center text-xs font-black text-muted">
          {monthly.map((item) => <span key={item.label}>{item.label}</span>)}
        </div>
      </Panel>

      <Panel title="Order Status">
        <div className="grid gap-2">
          {statusRows.map((row) => <div key={row.status} className="flex items-center justify-between rounded-lg bg-paper px-3 py-2 text-sm">
            <span className="font-bold">{label(row.status)}</span>
            <strong>{row.count}</strong>
          </div>)}
        </div>
      </Panel>
    </section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
      <Panel title="Product Performance" action={<Link href="/seller/products">Manage products</Link>}>
        {topProducts.length ? <div className="grid gap-3">
          {topProducts.map((product) => <div key={product.name} className="grid grid-cols-[1fr_auto_auto] gap-3 rounded-lg bg-paper px-3 py-3 text-sm">
            <strong className="truncate">{product.name}</strong>
            <span className="font-bold text-muted">{product.quantity} sold</span>
            <span className="font-black">{money(product.revenue)}</span>
          </div>)}
        </div> : <Empty copy="Orders with products will appear here." />}
      </Panel>

      <Panel title="Custom Request Pipeline" action={<Link href="/seller/custom-requests">View requests</Link>}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {['request_submitted', 'seller_reviewing', 'quote_sent', 'in_progress'].map((status) => <article key={status} className="rounded-lg bg-paper p-4">
            <p className="text-xs font-black uppercase text-muted">{label(status)}</p>
            <strong className="mt-2 block text-2xl">{requestItems.filter((item: any) => item.status === status).length}</strong>
          </article>)}
        </div>
      </Panel>
    </section>
  </main>;
}

function Metric({ icon, title, value, copy }: { icon: React.ReactNode; title: string; value: string; copy: string }) {
  return <article className="rounded-xl border border-line bg-white p-5 shadow-[0_10px_30px_rgba(42,39,36,.04)]"><div className="flex items-center gap-2 text-rust">{icon}<p className="text-sm font-black text-muted">{title}</p></div><strong className="mt-3 block text-3xl">{value}</strong><p className="mt-2 text-xs font-bold text-success">{copy}</p></article>;
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-xl border border-line bg-white p-5 shadow-[0_10px_30px_rgba(42,39,36,.04)]"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-black">{title}</h2>{action ? <div className="text-xs font-black text-rust">{action}</div> : null}</div>{children}</section>;
}

function Empty({ copy }: { copy: string }) {
  return <p className="rounded-lg border border-dashed border-line bg-paper p-5 text-sm font-bold text-muted">{copy}</p>;
}

function buildMonthly(orders: any[]) {
  const formatter = new Intl.DateTimeFormat('en-IN', { month: 'short' });
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const month = date.getMonth();
    const year = date.getFullYear();
    return {
      label: formatter.format(date),
      total: orders.filter((order) => {
        const created = new Date(order.created_at);
        return created.getMonth() === month && created.getFullYear() === year;
      }).reduce((sum, order) => sum + Number(order.seller_net_amount || 0), 0)
    };
  });
}

function productPerformance(orders: any[]) {
  const map = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const order of orders) {
    for (const item of order.order_items || []) {
      const name = item.product_snapshot?.name || 'Product';
      const current = map.get(name) || { name, quantity: 0, revenue: 0 };
      current.quantity += Number(item.quantity || 0);
      current.revenue += Number(item.quantity || 0) * Number(item.product_snapshot?.price || item.product_snapshot?.base_price || 0);
      map.set(name, current);
    }
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
}

function money(value: number | string | null | undefined) {
  return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
}

function label(status: string) {
  return status.split('_').map((part) => part[0]?.toUpperCase() + part.slice(1)).join(' ');
}
