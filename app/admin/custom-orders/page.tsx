import Link from 'next/link';
import { Badge, SectionHeading } from '@/components/ui';
import { bespokeStatusLabels } from '@/lib/types/custom-orders';
import { getAdminCustomOrderRequests } from '@/lib/services/custom-orders';

export const dynamic = 'force-dynamic';

function money(value: number | null | undefined) { return value == null ? 'Quote pending' : `Rs. ${Number(value).toLocaleString('en-IN')}`; }

export default async function AdminCustomOrdersPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const params = await searchParams;
  const requests = await getAdminCustomOrderRequests();
  const filtered = params.status && params.status !== 'all' ? requests.filter((request: any) => request.status === params.status) : requests;
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><SectionHeading eyebrow="Admin" title="Custom orders" copy="Monitor bespoke requests, quotations, milestones, and development-only payment markers." /><form className="mb-5 flex flex-wrap gap-3 rounded-xl border border-line bg-white p-4"><select name="status" defaultValue={params.status || 'all'} className="min-h-11 rounded-lg border border-line bg-paper px-3"><option value="all">All</option>{Object.entries(bespokeStatusLabels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}</select><button className="rounded-lg bg-ink px-5 py-3 font-black text-white">Filter</button></form>{!filtered.length ? <div className="rounded-xl border border-line bg-white p-8 text-muted">No custom orders yet.</div> : <div className="grid gap-3">{filtered.map((request: any) => { const quote = (request.custom_order_quotes || [])[0]; return <article key={request.id} className="grid gap-4 rounded-xl border border-line bg-white p-5 lg:grid-cols-[1fr_auto] lg:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="break-all font-black">{request.request_number}</h2><Badge>{request.status}</Badge></div><p className="mt-1 break-words text-sm text-muted">Buyer: {request.profiles?.full_name || request.profiles?.email} / Seller: {request.seller_profiles?.store_name} / Deadline: {request.deadline || 'Not set'}</p><h3 className="mt-2 font-black">{request.title}</h3></div><div className="flex flex-wrap items-center gap-3 lg:justify-end"><strong>{money(quote?.quote_amount)}</strong><Link href={`/admin/custom-orders/${request.id}`} className="rounded-lg border border-line px-4 py-3 font-black">View</Link></div></article>; })}</div>}</main>;
}
