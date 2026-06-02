import { CreditCard, ReceiptText, ShieldCheck, Wallet } from 'lucide-react';
import { Badge, SectionHeading } from '@/components/ui';
import { requireApprovedSeller } from '@/lib/services/auth';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SellerPayoutsPage() {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  const [{ data: payouts }, { data: commissions }, { data: settings }] = await Promise.all([
    supabase.from('seller_payouts').select('*').eq('seller_id', seller.id).order('created_at', { ascending: false }).limit(50),
    supabase.from('commission_records').select('*, orders(order_number,status,created_at)').eq('seller_id', seller.id).order('created_at', { ascending: false }).limit(100),
    supabase.from('platform_settings').select('value').eq('key', 'marketplace_commission_percentage').maybeSingle()
  ]);

  const payoutItems = payouts || [];
  const commissionItems = commissions || [];
  const totalEarned = commissionItems.reduce((sum: number, item: any) => sum + Number(item.seller_net_amount || 0), 0);
  const paidOut = payoutItems.filter((item: any) => item.status === 'paid').reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  const inProgress = payoutItems.filter((item: any) => ['pending', 'eligible', 'processing'].includes(item.status)).reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  const available = Math.max(totalEarned - paidOut - inProgress, 0);
  const commissionRate = parseCommission(settings?.value);

  return <main className="mx-auto max-w-7xl">
    <SectionHeading eyebrow="Seller workspace" title="Payouts" copy="Review seller earnings, marketplace commissions, payout history, and amounts waiting for payout processing." />

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={<Wallet size={18} />} title="Available balance" value={money(available)} copy="Estimated after recorded payouts" />
      <Metric icon={<CreditCard size={18} />} title="Paid out" value={money(paidOut)} copy={`${payoutItems.filter((item: any) => item.status === 'paid').length} completed payouts`} />
      <Metric icon={<ReceiptText size={18} />} title="Processing" value={money(inProgress)} copy="Pending, eligible, or processing" />
      <Metric icon={<ShieldCheck size={18} />} title="Commission" value={`${commissionRate}%`} copy="Current marketplace rate" />
    </section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <Panel title="Payout History">
        {payoutItems.length ? <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="text-xs font-black uppercase text-muted"><tr><th className="py-2">Period</th><th>Amount</th><th>Status</th><th>Reference</th><th>Paid</th></tr></thead>
            <tbody className="divide-y divide-line">
              {payoutItems.map((payout: any) => <tr key={payout.id}>
                <td className="py-3 font-bold">{period(payout.period_start, payout.period_end)}</td>
                <td className="font-black">{money(payout.amount)}</td>
                <td><Badge tone={payout.status === 'paid' ? 'sage' : payout.status === 'held' ? 'rust' : 'sand'}>{payout.status}</Badge></td>
                <td className="text-muted">{payout.payout_reference || 'Not assigned'}</td>
                <td className="text-muted">{payout.paid_at ? date(payout.paid_at) : 'Not paid'}</td>
              </tr>)}
            </tbody>
          </table>
        </div> : <Empty copy="No payout records have been created yet." />}
      </Panel>

      <Panel title="Recent Earnings">
        {commissionItems.length ? <div className="grid gap-3">
          {commissionItems.slice(0, 8).map((item: any) => <article key={item.id} className="rounded-lg bg-paper p-4 text-sm">
            <div className="flex items-start justify-between gap-3"><div><strong>{item.orders?.order_number || 'Order'}</strong><p className="mt-1 text-xs text-muted">{date(item.created_at)}</p></div><strong>{money(item.seller_net_amount)}</strong></div>
            <div className="mt-3 grid gap-2 text-xs text-muted">
              <span className="flex justify-between"><span>Gross</span><strong>{money(item.gross_amount)}</strong></span>
              <span className="flex justify-between"><span>Commission ({Number(item.commission_percentage || 0).toFixed(1)}%)</span><strong>{money(item.commission_amount)}</strong></span>
              <span className="flex justify-between"><span>Gateway fee</span><strong>{money(item.payment_gateway_fee)}</strong></span>
            </div>
          </article>)}
        </div> : <Empty copy="Paid orders will create commission records here." />}
      </Panel>
    </section>
  </main>;
}

function Metric({ icon, title, value, copy }: { icon: React.ReactNode; title: string; value: string; copy: string }) {
  return <article className="rounded-xl border border-line bg-white p-5"><div className="flex items-center gap-2 text-rust">{icon}<p className="text-sm font-black text-muted">{title}</p></div><strong className="mt-3 block text-3xl">{value}</strong><p className="mt-2 text-xs font-bold text-success">{copy}</p></article>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-line bg-white p-5 shadow-[0_10px_30px_rgba(42,39,36,.04)]"><h2 className="mb-4 font-black">{title}</h2>{children}</section>;
}

function Empty({ copy }: { copy: string }) {
  return <p className="rounded-lg border border-dashed border-line bg-paper p-5 text-sm font-bold text-muted">{copy}</p>;
}

function parseCommission(value: unknown) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 8;
  if (value && typeof value === 'object' && 'percent' in value) return Number((value as { percent?: unknown }).percent) || 8;
  return 8;
}

function period(start?: string | null, end?: string | null) {
  if (!start && !end) return 'Open period';
  return `${start ? date(start) : 'Start'} - ${end ? date(end) : 'Now'}`;
}

function money(value: number | string | null | undefined) {
  return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
}

function date(value: string) {
  return new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}
