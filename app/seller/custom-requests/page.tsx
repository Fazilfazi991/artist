import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Badge, SectionHeading } from '@/components/ui';
import { requireAuth } from '@/lib/services/auth';
import { bespokeStatusLabels, customOrderNextAction } from '@/lib/types/custom-orders';
import { getSellerCustomOrderRequests } from '@/lib/services/custom-orders';

export const dynamic = 'force-dynamic';

function money(value: number | null | undefined) { return value == null ? 'Quote pending' : `Rs. ${Number(value).toLocaleString('en-IN')}`; }

export default async function SellerCustomRequestsPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const user = await requireAuth();
  if (!user) redirect('/login?next=/seller/custom-requests');
  const params = await searchParams;
  const { seller, requests } = await getSellerCustomOrderRequests(user.id);
  if (!seller) redirect('/seller/dashboard');
  const filtered = params.status && params.status !== 'all' ? requests.filter((item: any) => item.status === params.status) : requests;
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><SectionHeading eyebrow="Seller dashboard" title="Custom requests" copy="Review bespoke enquiries, send quotations, track manual payment states, and add project milestones." /><form className="mb-5 flex flex-wrap gap-3 rounded-xl border border-line bg-white p-4"><select name="status" defaultValue={params.status || 'all'} className="min-h-11 rounded-lg border border-line bg-paper px-3"><option value="all">All</option>{['request_submitted','seller_reviewing','quote_sent','revision_requested','deposit_paid','in_progress','final_payment_pending','fully_paid','ready_for_delivery','completed','cancelled'].map((status) => <option key={status} value={status}>{bespokeStatusLabels[status]}</option>)}</select><button className="rounded-lg bg-ink px-5 py-3 font-black text-white">Filter</button></form>{!filtered.length ? <div className="rounded-xl border border-line bg-white p-8 text-muted">No custom requests match this view.</div> : <div className="grid gap-3">{filtered.map((request: any) => { const quote = [...(request.custom_order_quotes || [])].sort((a: any, b: any) => Number(b.quote_version || 0) - Number(a.quote_version || 0))[0]; return <article key={request.id} className="grid gap-4 rounded-xl border border-line bg-white p-5 lg:grid-cols-[1fr_auto] lg:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="break-all font-black">{request.request_number}</h2><Badge>{request.status}</Badge></div><p className="mt-1 break-words text-sm text-muted">Buyer: {request.profiles?.full_name || request.profiles?.email} / Deadline: {request.deadline || 'Not set'}</p><h3 className="mt-2 font-black">{request.title}</h3><p className="mt-1 text-sm font-bold text-rust">{customOrderNextAction(request.status)}</p></div><div className="flex flex-wrap items-center gap-3 lg:justify-end"><strong>{money(quote?.quote_amount)}</strong><Link href={`/seller/custom-requests/${request.id}`} className="rounded-lg border border-line px-4 py-3 font-black">View</Link></div></article>; })}</div>}</main>;
}
