import { redirect } from 'next/navigation';
import { AccountShell } from '@/components/account-shell';
import { PhoneCountryField } from '@/components/phone-country-field';
import { requireAuth } from '@/lib/services/auth';
import { getBuyerAccountOverview } from '@/lib/services/account';
import { saveProfileAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const user = await requireAuth();
  if (!user) redirect('/login?next=/account/profile');
  const params = await searchParams;
  const { profile } = await getBuyerAccountOverview(user.id);
  return <AccountShell title="Profile" copy="Keep your buyer profile details up to date.">{params.error ? <p className="mb-4 rounded-lg border border-rust/30 bg-rust/10 p-3 font-bold text-rust">{params.error}</p> : null}{params.saved ? <p className="mb-4 rounded-lg border border-success/30 bg-sage/10 p-3 font-bold text-success">Profile saved.</p> : null}<form action={saveProfileAction} className="max-w-2xl rounded-xl border border-line bg-white p-5"><div className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-sand font-serif text-3xl">{(profile?.full_name || user.email || 'A').slice(0,1).toUpperCase()}</div><div className="grid gap-4"><Input name="full_name" label="Full name" defaultValue={profile?.full_name || ''}/><Input name="email" label="Email" defaultValue={profile?.email || user.email || ''} readOnly/><PhoneCountryField required={false} /><button className="w-fit rounded-lg bg-rust px-5 py-3 font-black text-white">Save changes</button></div></form></AccountShell>;
}
function Input({ name, label, defaultValue = '', readOnly = false, required = true }: { name: string; label: string; defaultValue?: string; readOnly?: boolean; required?: boolean }) { return <label className="grid gap-2 text-sm font-black"><span>{label}</span><input name={name} defaultValue={defaultValue} readOnly={readOnly} required={required} className="min-h-11 rounded-lg border border-line bg-paper px-4 outline-none read-only:opacity-70"/></label>; }
