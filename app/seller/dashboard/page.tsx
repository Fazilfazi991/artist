import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SectionHeading } from '@/components/ui';
import { createClient, hasSupabaseServerEnv } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SellerDashboardPage() {
  if (!hasSupabaseServerEnv()) return <SellerSetupMissing />;

  let seller: any = null;
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) return <SellerAuthUnavailable />;
    if (!user) redirect('/login?next=/seller/dashboard');
    const result = await supabase.from('seller_profiles').select('*').eq('user_id', user.id).maybeSingle();
    if (result.error) return <SellerAuthUnavailable />;
    seller = result.data;
  } catch (error) {
    console.error('seller dashboard failed', error);
    return <SellerAuthUnavailable />;
  }

  if (!seller || seller.status === 'draft') redirect('/seller/onboarding');
  if (seller.status === 'submitted' || seller.status === 'under_review') return <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6"><SectionHeading eyebrow="Seller dashboard" title="Your application is under review" copy="We will unlock your seller dashboard after admin approval." /><Link href="/seller/onboarding" className="font-black text-rust">View application</Link></main>;
  if (seller.status === 'rejected') return <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6"><SectionHeading eyebrow="Seller dashboard" title="Application needs updates" copy={seller.rejection_reason || 'Please review your application and resubmit.'} /><Link href="/seller/onboarding" className="font-black text-rust">Update application</Link></main>;
  if (seller.status !== 'approved') redirect('/seller/onboarding');
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><SectionHeading eyebrow="Seller dashboard" title={`Welcome, ${seller.store_name}`} copy="Your storefront is approved. Product creation arrives in the next sprint." /><div className="grid gap-4 md:grid-cols-4">{['Products','Orders','Revenue','Store views'].map((item) => <article key={item} className="rounded-xl border border-line bg-white p-6"><p className="text-sm text-muted">{item}</p><strong className="mt-2 block text-3xl">0</strong></article>)}</div><div className="mt-8 rounded-xl border border-line bg-white p-6"><h2 className="font-black">Next step</h2><p className="mt-2 text-muted">Add your first product will be enabled in Sprint 3.</p><button className="mt-4 rounded-lg bg-rust px-5 py-3 font-black text-white" disabled>Add your first product</button></div></main>;
}

function SellerSetupMissing() {
  return <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6"><SectionHeading eyebrow="Seller dashboard" title="Seller tools need setup" copy="Supabase environment variables are missing or invalid on this deployment. Add the project URL and anon key in Vercel, then redeploy." /><Link href="/" className="font-black text-rust">Back to marketplace</Link></main>;
}

function SellerAuthUnavailable() {
  return <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6"><SectionHeading eyebrow="Seller dashboard" title="Seller login is not ready" copy="Supabase Auth returned an error. Check Supabase Auth logs and the profile trigger, then try again." /><Link href="/login?next=/seller/dashboard" className="font-black text-rust">Go to login</Link></main>;
}