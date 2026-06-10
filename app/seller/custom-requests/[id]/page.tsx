import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Badge, SectionHeading } from '@/components/ui';
import { requireAuth } from '@/lib/services/auth';
import { bespokeStatusLabels } from '@/lib/types/custom-orders';
import { getSellerCustomOrderRequestById } from '@/lib/services/custom-orders';
import { addMilestoneAction, addSellerCustomMessageAction, completeCustomRequestAction, markFinalPendingAction, markReadyForDeliveryAction, sendQuoteAction, startProductionAction, startReviewAction } from '../actions';

export const dynamic = 'force-dynamic';

function money(value: number | null | undefined) { return value == null ? 'Not set' : `Rs. ${Number(value).toLocaleString('en-IN')}`; }
function date(value: string | null | undefined) { return value ? new Date(value).toLocaleDateString() : 'Not set'; }

export default async function SellerCustomRequestDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string,string|undefined>> }) {
  const user = await requireAuth();
  if (!user) redirect('/login?next=/seller/custom-requests');
  const { id } = await params;
  const query = await searchParams;
  const request = await getSellerCustomOrderRequestById(id, user.id);
  if (!request) notFound();
  const quotes = request.custom_order_quotes || [];
  const latest = quotes[0];

  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <SectionHeading eyebrow="Custom request" title={request.request_number} copy={`${request.title} / ${bespokeStatusLabels[request.status] || request.status}`} action={<Link href="/seller/custom-requests" className="rounded-lg border border-line px-4 py-3 font-black">All requests</Link>} />
    {query.error ? <p className="mb-4 rounded-lg border border-rust/30 bg-rust/10 p-3 font-bold text-rust">{query.error}</p> : null}
    <div className="grid gap-5 xl:grid-cols-[1fr_400px]">
      <section className="grid gap-4">
        <BriefCard request={request}/>
        <QuoteHistory quotes={quotes}/>
        <Milestones request={request}/>
        <MessageForm request={request}/>
        <Timeline history={request.custom_order_status_history || []}/>
      </section>
      <aside className="grid h-fit gap-4">
        <SellerActions request={request}/>
        <QuoteForm request={request} latest={latest}/>
        <MilestoneForm request={request}/>
        <References files={request.reference_files || []} links={request.reference_links || []}/>
      </aside>
    </div>
  </main>;
}

function BriefCard({ request }: { request: any }) {
  const flexibility = request.flexibility || {};
  return <article className="rounded-xl border border-line bg-white p-5">
    <div className="flex flex-wrap gap-2"><Badge>{request.status}</Badge><Badge tone="sage">{request.profiles?.full_name || request.profiles?.email}</Badge></div>
    <p className="mt-4 leading-7 text-muted">{request.description}</p>
    {request.buyer_notes ? <p className="mt-3 rounded-lg bg-paper p-3 text-sm leading-6 text-muted"><strong className="text-ink">Buyer notes:</strong> {request.buyer_notes}</p> : null}
    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
      <Info label="Category" value={request.project_category || 'Not set'}/><Info label="Occasion" value={request.occasion || 'Not set'}/><Info label="Product" value={request.products?.name || 'General request'}/>
      <Info label="Budget" value={`${money(request.budget_min)} - ${money(request.budget_max)}`}/><Info label="Quantity" value={String(request.quantity || 'Not set')}/><Info label="Deadline" value={date(request.deadline)}/>
      <Info label="Delivery" value={request.delivery_location || 'Not set'}/><Info label="Dimensions" value={request.dimensions || 'Not set'}/><Info label="Colors" value={request.preferred_colors || 'Not set'}/>
      <Info label="Materials" value={request.preferred_materials || 'Not set'}/><Info label="Flexible On" value={['budget','deadline','design'].filter((key) => flexibility[key]).join(', ') || 'Not marked'}/>
    </div>
  </article>;
}

function SellerActions({ request }: { request: any }) { return <article className="grid gap-3 rounded-xl border border-line bg-white p-5"><h2 className="font-black">Actions</h2>{request.status === 'request_submitted' ? <Action action={startReviewAction} id={request.id} label="Start Review" primary/> : null}{request.status === 'deposit_paid' ? <Action action={startProductionAction} id={request.id} label="Start Production" primary/> : null}{request.status === 'in_progress' ? <Action action={markFinalPendingAction} id={request.id} label="Request Final Payment"/> : null}{request.status === 'fully_paid' ? <Action action={markReadyForDeliveryAction} id={request.id} label="Mark Ready for Delivery" primary/> : null}{request.status === 'ready_for_delivery' ? <Action action={completeCustomRequestAction} id={request.id} label="Mark Completed"/> : null}<p className="text-xs text-muted">Production can start only after the deposit is confirmed.</p></article>; }
function Action({ action, id, label, primary = false }: { action: any; id: string; label: string; primary?: boolean }) { return <form action={action}><input type="hidden" name="request_id" value={id}/><button className={`w-full rounded-lg px-5 py-3 font-black ${primary ? 'bg-rust text-white' : 'border border-line bg-paper'}`}>{label}</button></form>; }
function QuoteForm({ request, latest }: { request: any; latest: any }) { const canQuote = ['seller_reviewing','revision_requested'].includes(request.status); return <form action={sendQuoteAction} className="grid gap-3 rounded-xl border border-line bg-white p-5"><h2 className="font-black">{latest ? 'Send revised quote' : 'Send quote'}</h2><input type="hidden" name="request_id" value={request.id}/><div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1"><Input name="quote_amount" label="Quote amount" type="number"/><Input name="deposit_amount" label="Deposit amount" type="number"/><Input name="final_amount" label="Final amount" type="number"/></div><Input name="estimated_completion_date" label="Estimated completion date" type="date" required={false}/><Textarea name="quote_notes" label="Quote notes" required={false} placeholder="Timeline, assumptions, next approval step, delivery notes."/><Textarea name="inclusions" label="Inclusions" required={false} placeholder="One per line or comma separated"/><Textarea name="exclusions" label="Exclusions" required={false} placeholder="One per line or comma separated"/><button disabled={!canQuote} className="rounded-lg bg-rust px-5 py-3 font-black text-white disabled:opacity-50">Send Quote</button>{!canQuote ? <p className="text-xs text-muted">Start review or wait for a revision request before sending a quote.</p> : null}</form>; }
function MilestoneForm({ request }: { request: any }) { const canAdd = ['in_progress','final_payment_pending','fully_paid'].includes(request.status); return <form action={addMilestoneAction} className="grid gap-3 rounded-xl border border-line bg-white p-5"><h2 className="font-black">Add milestone</h2><input type="hidden" name="request_id" value={request.id}/><Input name="title" label="Title"/><Textarea name="description" label="Description" required={false}/><Input name="display_order" label="Display order" type="number" required={false}/><label className="grid gap-2 text-sm font-black"><span>Status</span><select name="status" className="min-h-11 rounded-lg border border-line bg-paper px-4"><option value="pending">Pending</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></label><label className="text-sm font-bold"><input name="is_visible_to_buyer" type="checkbox" defaultChecked className="mr-2 accent-rust"/>Visible to buyer</label><label className="text-sm font-bold"><input name="requires_buyer_approval" type="checkbox" className="mr-2 accent-rust"/>Requires buyer approval</label><input name="milestone_files" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf" className="rounded-lg border border-dashed border-line bg-paper px-4 py-3"/><button disabled={!canAdd} className="rounded-lg border border-line bg-paper px-5 py-3 font-black disabled:opacity-50">Add Milestone</button></form>; }
function QuoteHistory({ quotes }: { quotes: any[] }) { return <article className="rounded-xl border border-line bg-white p-5"><h2 className="font-black">Quote history</h2>{quotes.length ? <div className="mt-4 grid gap-3">{quotes.map((quote) => <div key={quote.id} className="rounded-lg bg-paper p-3"><div className="flex flex-wrap justify-between gap-2"><strong>v{quote.quote_version} / {money(quote.quote_amount)}</strong><Badge>{quote.status}</Badge></div><p className="mt-1 text-sm text-muted">Deposit {money(quote.deposit_amount)} / Final {money(quote.final_amount)}</p><List title="Included" items={quote.inclusions || []}/><List title="Not included" items={quote.exclusions || []}/></div>)}</div> : <p className="mt-2 text-sm text-muted">No quotes sent yet.</p>}</article>; }
function Milestones({ request }: { request: any }) { const milestones = request.custom_order_milestones || []; return <article className="rounded-xl border border-line bg-white p-5"><h2 className="font-black">Milestones</h2>{milestones.length ? <div className="mt-4 grid gap-3">{milestones.map((item: any) => <div key={item.id} className="rounded-lg bg-paper p-3"><div className="flex flex-wrap justify-between gap-2"><strong>{item.title}</strong><Badge>{item.status}</Badge></div><p className="mt-1 text-sm text-muted">{item.description}</p>{item.requires_buyer_approval ? <p className="mt-2 text-xs font-bold text-rust">{item.buyer_approved_at ? `Buyer approved ${date(item.buyer_approved_at)}` : 'Waiting for buyer approval'}</p> : null}</div>)}</div> : <p className="mt-2 text-sm text-muted">No milestones yet.</p>}</article>; }
function MessageForm({ request }: { request: any }) { return <form action={addSellerCustomMessageAction} className="grid gap-3 rounded-xl border border-line bg-white p-5"><h2 className="font-black">Add message</h2><input type="hidden" name="request_id" value={request.id}/><textarea name="message" required placeholder="Ask a question, clarify the quote, or share an update." className="min-h-24 rounded-lg border border-line bg-paper px-4 py-3 outline-none"/><button className="w-fit rounded-lg border border-line bg-paper px-5 py-3 font-black">Send Message</button></form>; }
function Timeline({ history }: { history: any[] }) { return <article className="rounded-xl border border-line bg-white p-5"><h2 className="font-black">Conversation and timeline</h2><div className="mt-4 grid gap-3">{history.map((entry) => <div key={entry.id} className="rounded-lg bg-paper p-3 text-sm"><strong>{bespokeStatusLabels[entry.status] || entry.status}</strong><p className="text-muted">{entry.note || 'Status updated.'}</p></div>)}</div></article>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-paper p-3"><p className="text-xs font-bold uppercase tracking-[.08em] text-muted">{label}</p><p className="mt-1 break-words font-black">{value}</p></div>; }
function Input({ name, label, type = 'text', required = true }: { name: string; label: string; type?: string; required?: boolean }) { return <label className="grid gap-2 text-sm font-black"><span>{label}</span><input name={name} type={type} required={required} className="min-h-11 rounded-lg border border-line bg-paper px-4 outline-none"/></label>; }
function Textarea({ name, label, placeholder = '', required = true }: { name: string; label: string; placeholder?: string; required?: boolean }) { return <label className="grid gap-2 text-sm font-black"><span>{label}</span><textarea name={name} required={required} placeholder={placeholder} className="min-h-24 rounded-lg border border-line bg-paper px-4 py-3 outline-none"/></label>; }
function List({ title, items }: { title: string; items: string[] }) { return items.length ? <div className="mt-3 rounded bg-white p-3"><p className="text-xs font-bold uppercase tracking-[.08em] text-muted">{title}</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">{items.map((item) => <li key={item}>{item}</li>)}</ul></div> : null; }
function References({ files, links }: { files: any[]; links: string[] }) { return <article className="rounded-xl border border-line bg-white p-5"><h2 className="font-black">References</h2>{files.length ? <div className="mt-3 grid gap-2 text-sm text-muted">{files.map((file: any) => <p className="break-all" key={file.storagePath}>{file.name} <span className="text-xs">({file.type})</span></p>)}</div> : null}{links.length ? <div className="mt-3 grid gap-2 text-sm">{links.map((link) => <a key={link} href={link} target="_blank" rel="noreferrer" className="break-all font-bold text-rust">{link}</a>)}</div> : null}{!files.length && !links.length ? <p className="mt-2 text-sm text-muted">No reference files or links uploaded.</p> : null}</article>; }
