import Link from 'next/link';
import { BadgeCheck, Bell, FileCheck2, Globe2, Lock, Settings } from 'lucide-react';
import { Badge, SectionHeading } from '@/components/ui';
import { requireApprovedSeller } from '@/lib/services/auth';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SellerSettingsPage() {
  const seller = await requireApprovedSeller();
  const supabase = await createClient();
  const [{ data: profile }, { data: documents }, { data: settings }, { data: notifications }] = await Promise.all([
    supabase.from('profiles').select('email,full_name,phone,role,created_at').eq('id', seller.user_id).maybeSingle(),
    supabase.from('seller_documents').select('*').eq('seller_id', seller.id).order('created_at', { ascending: false }),
    supabase.from('storefront_settings').select('*').eq('seller_id', seller.id).maybeSingle(),
    supabase.from('notifications').select('id,is_read,created_at').eq('user_id', seller.user_id).order('created_at', { ascending: false }).limit(20)
  ]);

  const documentItems = documents || [];
  const shippingRegions = Array.isArray(seller.shipping_regions) ? seller.shipping_regions : [];
  const capabilities = [
    ['Ready to ship', seller.supports_ready_to_ship],
    ['Customized', seller.supports_customized],
    ['Bespoke', seller.supports_bespoke]
  ] as const;

  return <main className="mx-auto max-w-7xl">
    <SectionHeading eyebrow="Seller workspace" title="Settings" copy="Review account, verification, storefront, and notification settings for this seller workspace." />

    <section className="grid gap-4 md:grid-cols-4">
      <Metric icon={<BadgeCheck size={18} />} title="Seller status" value={seller.status} copy={seller.reviewed_at ? `Approved ${date(seller.reviewed_at)}` : 'Pending review'} />
      <Metric icon={<Globe2 size={18} />} title="Storefront" value={settings?.is_published ? 'Published' : 'Draft'} copy={`/artisan/${seller.store_slug}`} />
      <Metric icon={<FileCheck2 size={18} />} title="Documents" value={String(documentItems.length)} copy={`${documentItems.filter((item: any) => item.verification_status === 'verified').length} verified`} />
      <Metric icon={<Bell size={18} />} title="Notifications" value={String((notifications || []).filter((item: any) => !item.is_read).length)} copy="Unread workspace alerts" />
    </section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
      <Panel title="Account Details" icon={<Settings size={18} />}>
        <Info label="Owner name" value={profile?.full_name || 'Not set'} />
        <Info label="Email" value={profile?.email || 'Not set'} />
        <Info label="Phone" value={profile?.phone || 'Not set'} />
        <Info label="Role" value={profile?.role || 'seller'} />
        <Info label="Joined" value={profile?.created_at ? date(profile.created_at) : 'Not set'} />
      </Panel>

      <Panel title="Store Profile" icon={<Globe2 size={18} />}>
        <Info label="Store name" value={seller.store_name} />
        <Info label="Store slug" value={seller.store_slug} />
        <Info label="Location" value={[seller.city, seller.state].filter(Boolean).join(', ') || 'Not set'} />
        <Info label="Production days" value={seller.average_production_days ? `${seller.average_production_days} days` : 'Not set'} />
        <Info label="Shipping regions" value={shippingRegions.length ? shippingRegions.join(', ') : 'Not set'} />
      </Panel>
    </section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
      <Panel title="Selling Modes" icon={<BadgeCheck size={18} />}>
        <div className="flex flex-wrap gap-2">
          {capabilities.map(([label, enabled]) => <Badge key={label} tone={enabled ? 'sage' : 'sand'}>{label}: {enabled ? 'Enabled' : 'Off'}</Badge>)}
        </div>
        <p className="mt-4 text-sm leading-6 text-muted">Approved profile fields are locked by the current marketplace policy. Use storefront content, branding, and policies for buyer-facing updates.</p>
      </Panel>

      <Panel title="Workspace Actions" icon={<Lock size={18} />}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Action href="/seller/storefront/content" title="Edit storefront content" copy="Hero copy, story, contact links, and custom-order CTA." />
          <Action href="/seller/storefront/branding" title="Edit branding" copy="Logo, hero image, accent color, and subdomain." />
          <Action href="/seller/storefront/policies" title="Edit policies" copy="Shipping, returns, production, and custom-order notes." />
          <Action href="/seller/storefront/template" title="Switch template" copy="Choose the storefront layout buyers see." />
        </div>
      </Panel>
    </section>

    <section className="mt-5 rounded-xl border border-line bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-black">Verification Documents</h2><Badge tone={documentItems.every((item: any) => item.verification_status === 'verified') && documentItems.length ? 'sage' : 'sand'}>{documentItems.length ? 'Submitted' : 'No documents'}</Badge></div>
      {documentItems.length ? <div className="grid gap-3 md:grid-cols-2">
        {documentItems.map((document: any) => <article key={document.id} className="rounded-lg bg-paper p-4">
          <div className="flex items-center justify-between gap-3"><strong>{document.document_type}</strong><Badge tone={document.verification_status === 'verified' ? 'sage' : 'sand'}>{document.verification_status}</Badge></div>
          <p className="mt-2 text-xs text-muted">Uploaded {date(document.created_at)}</p>
          {document.admin_notes ? <p className="mt-2 text-sm text-muted">{document.admin_notes}</p> : null}
        </article>)}
      </div> : <p className="rounded-lg border border-dashed border-line bg-paper p-5 text-sm font-bold text-muted">Seller documents submitted during onboarding will appear here.</p>}
    </section>
  </main>;
}

function Metric({ icon, title, value, copy }: { icon: React.ReactNode; title: string; value: string; copy: string }) {
  return <article className="rounded-xl border border-line bg-white p-5"><div className="flex items-center gap-2 text-rust">{icon}<p className="text-sm font-black text-muted">{title}</p></div><strong className="mt-3 block truncate text-2xl capitalize">{value}</strong><p className="mt-2 truncate text-xs font-bold text-success">{copy}</p></article>;
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-xl border border-line bg-white p-5 shadow-[0_10px_30px_rgba(105,41,106,.08)]"><div className="mb-4 flex items-center gap-2 text-rust">{icon}<h2 className="font-black text-ink">{title}</h2></div>{children}</section>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-col gap-1 border-b border-line py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"><span className="text-sm font-bold text-muted">{label}</span><strong className="break-words text-sm sm:text-right">{value}</strong></div>;
}

function Action({ href, title, copy }: { href: string; title: string; copy: string }) {
  return <Link href={href} className="rounded-lg border border-line bg-paper p-4 transition hover:border-rust/50"><strong className="block">{title}</strong><span className="mt-2 block text-sm leading-6 text-muted">{copy}</span></Link>;
}

function date(value: string) {
  return new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}
