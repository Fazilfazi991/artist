import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui';
import { AccountEmptyState, AccountShell } from '@/components/account-shell';
import { requireAuth } from '@/lib/services/auth';
import { customOrderNextAction } from '@/lib/types/custom-orders';
import { getBuyerCustomOrderRequests } from '@/lib/services/custom-orders';

export const dynamic = 'force-dynamic';

function money(value: number | null | undefined) { return value == null ? 'Quote pending' : `Rs. ${Number(value).toLocaleString('en-IN')}`; }

export default async function BuyerCustomOrdersPage() {
  const user = await requireAuth();
  if (!user) redirect('/login?next=/account/custom-orders');
  const requests = await getBuyerCustomOrderRequests(user.id);
  return <AccountShell title="Custom Orders" copy="Track bespoke enquiries, artisan quotations, milestones, and manual payment status.">{!requests.length ? <AccountEmptyState title="No custom-order requests yet" copy="Start with an artisan storefront and share the handmade project you want quoted." href="/storefronts" cta="Find a Storefront" /> : <div className="grid gap-3">{requests.map((request: any) => { const quote = [...(request.custom_order_quotes || [])].sort((a: any, b: any) => Number(b.quote_version || 0) - Number(a.quote_version || 0))[0]; return <article key={request.id} className="grid gap-4 rounded-xl border border-line bg-white p-5 lg:grid-cols-[1fr_auto] lg:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="break-all font-black">{request.request_number}</h2><Badge>{request.status}</Badge></div><p className="mt-1 break-words text-sm text-muted">{request.seller_profiles?.store_name} / {new Date(request.created_at).toLocaleDateString()}</p><h3 className="mt-2 font-black">{request.title}</h3><p className="mt-1 text-sm font-bold text-rust">{customOrderNextAction(request.status)}</p></div><div className="flex flex-wrap items-center gap-3 lg:justify-end"><strong>{money(quote?.quote_amount)}</strong><Link href={`/account/custom-orders/${request.id}`} className="rounded-lg border border-line px-4 py-3 font-black">View</Link></div></article>; })}</div>}</AccountShell>;
}
