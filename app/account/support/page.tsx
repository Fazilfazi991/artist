import { redirect } from 'next/navigation';
import { AccountEmptyState, AccountShell } from '@/components/account-shell';
import { requireAuth } from '@/lib/services/auth';
import { getBuyerOrders } from '@/lib/services/checkout';
import { getBuyerSupportTickets } from '@/lib/services/account';
import { createSupportTicketAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function SupportPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const user = await requireAuth();
  if (!user) redirect('/login?next=/account/support');
  const params = await searchParams;
  const [tickets, orders] = await Promise.all([getBuyerSupportTickets(user.id), getBuyerOrders(user.id)]);
  return <AccountShell title="Support" copy="Create and track support requests for orders, delivery, or account help.">{params.error ? <p className="mb-4 rounded-lg border border-rust/30 bg-rust/10 p-3 font-bold text-rust">{params.error}</p> : null}<div className="grid gap-5 lg:grid-cols-[1fr_360px]"><section>{tickets.length ? <div className="grid gap-3">{tickets.map((ticket: any) => <article key={ticket.id} className="rounded-xl border border-line bg-white p-5"><h2 className="font-black">{ticket.ticket_number}</h2><p className="mt-1 text-sm text-muted">{ticket.subject} · {ticket.status} · {new Date(ticket.created_at).toLocaleDateString()}</p></article>)}</div> : <AccountEmptyState title="No support tickets" copy="Need help with an order or account? Create a ticket and we will track it here." href="/account/support" cta="Create Ticket" />}</section><form action={createSupportTicketAction} className="grid h-fit gap-3 rounded-xl border border-line bg-white p-5"><h2 className="font-black">Create Support Ticket</h2><select name="order_id" className="rounded-lg border border-line bg-paper px-4 py-3"><option value="">No related order</option>{orders.map((order: any) => <option key={order.id} value={order.id}>{order.order_number}</option>)}</select><input name="subject" placeholder="Subject" className="rounded-lg border border-line bg-paper px-4 py-3"/><textarea name="description" placeholder="How can we help?" className="min-h-28 rounded-lg border border-line bg-paper px-4 py-3"/><button className="rounded-lg bg-rust px-5 py-3 font-black text-white">Submit ticket</button></form></div></AccountShell>;
}
