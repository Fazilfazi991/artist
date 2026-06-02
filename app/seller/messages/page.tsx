import Link from 'next/link';
import { AlertCircle, MessageSquare, Palette, ShoppingBag } from 'lucide-react';
import { Badge, SectionHeading } from '@/components/ui';
import { requireApprovedSeller } from '@/lib/services/auth';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SellerMessagesPage() {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  const [{ data: customRequests }, { data: orderIssues }, { data: notifications }] = await Promise.all([
    supabase.from('custom_order_requests').select('*, profiles!custom_order_requests_buyer_id_fkey(full_name,email)').eq('seller_id', seller.id).order('updated_at', { ascending: false }).limit(30),
    supabase.from('order_issues').select('*, orders!inner(id,order_number,seller_id,status)').eq('orders.seller_id', seller.id).order('created_at', { ascending: false }).limit(30),
    supabase.from('notifications').select('*').eq('user_id', seller.user_id).order('created_at', { ascending: false }).limit(20)
  ]);

  const requestItems = customRequests || [];
  const issueItems = orderIssues || [];
  const notificationItems = notifications || [];
  const inboxItems = [
    ...requestItems.map((item: any) => ({
      id: item.id,
      type: 'Custom request',
      title: item.title,
      copy: item.description,
      status: item.status,
      date: item.updated_at || item.created_at,
      href: `/seller/custom-requests/${item.id}`,
      buyer: item.profiles?.full_name || item.profiles?.email || 'Buyer',
      icon: <Palette size={17} />
    })),
    ...issueItems.map((item: any) => ({
      id: item.id,
      type: 'Order issue',
      title: item.subject,
      copy: item.description,
      status: item.status,
      date: item.updated_at || item.created_at,
      href: item.orders?.id ? `/seller/orders/${item.orders.id}` : '/seller/orders',
      buyer: item.orders?.order_number || 'Order',
      icon: <AlertCircle size={17} />
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return <main className="mx-auto max-w-7xl">
    <SectionHeading eyebrow="Seller workspace" title="Messages" copy="Review buyer-facing conversations from custom requests, order issues, and seller notifications." />

    <section className="grid gap-4 sm:grid-cols-3">
      <Summary icon={<Palette size={18} />} title="Custom requests" value={String(requestItems.length)} copy={`${requestItems.filter((item: any) => !['completed', 'cancelled'].includes(item.status)).length} open`} />
      <Summary icon={<ShoppingBag size={18} />} title="Order issues" value={String(issueItems.length)} copy={`${issueItems.filter((item: any) => ['open', 'reviewing'].includes(item.status)).length} need review`} />
      <Summary icon={<MessageSquare size={18} />} title="Notifications" value={String(notificationItems.length)} copy={`${notificationItems.filter((item: any) => !item.is_read).length} unread`} />
    </section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
      <Panel title="Conversation Inbox">
        {inboxItems.length ? <div className="grid gap-3">
          {inboxItems.map((item) => <Link key={`${item.type}-${item.id}`} href={item.href} className="grid gap-3 rounded-xl border border-line bg-white p-4 transition hover:border-rust/50 md:grid-cols-[auto_1fr_auto] md:items-center">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-rust/10 text-rust">{item.icon}</span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2"><strong>{item.title}</strong><Badge tone={item.type === 'Order issue' ? 'rust' : 'sage'}>{item.status}</Badge></span>
              <span className="mt-1 block line-clamp-2 text-sm leading-6 text-muted">{item.buyer} - {item.copy}</span>
            </span>
            <span className="text-xs font-black text-muted">{date(item.date)}</span>
          </Link>)}
        </div> : <Empty copy="No buyer conversations need attention right now." />}
      </Panel>

      <Panel title="Seller Notifications">
        {notificationItems.length ? <div className="grid gap-3">
          {notificationItems.map((item: any) => <Link key={item.id} href={item.link || '/seller/dashboard'} className={`block rounded-lg border px-4 py-3 ${item.is_read ? 'border-line bg-paper' : 'border-rust/30 bg-rust/10'}`}>
            <strong className="block text-sm">{item.title}</strong>
            <span className="mt-1 block text-sm leading-6 text-muted">{item.message}</span>
            <span className="mt-2 block text-xs font-black text-muted">{date(item.created_at)}</span>
          </Link>)}
        </div> : <Empty copy="No seller notifications yet." />}
      </Panel>
    </section>
  </main>;
}

function Summary({ icon, title, value, copy }: { icon: React.ReactNode; title: string; value: string; copy: string }) {
  return <article className="rounded-xl border border-line bg-white p-5"><div className="flex items-center gap-2 text-rust">{icon}<p className="text-sm font-black text-muted">{title}</p></div><strong className="mt-3 block text-3xl">{value}</strong><p className="mt-2 text-xs font-bold text-success">{copy}</p></article>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-line bg-white p-5 shadow-[0_10px_30px_rgba(42,39,36,.04)]"><h2 className="mb-4 font-black">{title}</h2>{children}</section>;
}

function Empty({ copy }: { copy: string }) {
  return <p className="rounded-lg border border-dashed border-line bg-paper p-5 text-sm font-bold text-muted">{copy}</p>;
}

function date(value: string) {
  return new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}
