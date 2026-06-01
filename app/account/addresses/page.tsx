import { redirect } from 'next/navigation';
import { AccountShell } from '@/components/account-shell';
import { requireAuth } from '@/lib/services/auth';
import { getBuyerAddresses } from '@/lib/services/account';
import { deleteAccountAddressAction, saveAccountAddressAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function AddressesPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const user = await requireAuth();
  if (!user) redirect('/login?next=/account/addresses');
  const params = await searchParams;
  const addresses = await getBuyerAddresses(user.id);
  return <AccountShell title="Delivery addresses" copy="Manage saved addresses for checkout and order delivery.">{params.error ? <p className="mb-4 rounded-lg border border-rust/30 bg-rust/10 p-3 font-bold text-rust">{params.error}</p> : null}<div className="grid gap-5 lg:grid-cols-[1fr_360px]"><section className="grid gap-3">{addresses.map((address: any) => <article key={address.id} className="rounded-xl border border-line bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-black">{address.label} {address.is_default ? <span className="rounded bg-sage/15 px-2 py-1 text-xs text-success">Default</span> : null}</h2><p className="mt-2 text-sm leading-6 text-muted">{address.full_name}<br/>{address.phone}<br/>{address.address_line_1}{address.address_line_2 ? `, ${address.address_line_2}` : ''}<br/>{address.city}, {address.state} {address.postal_code}<br/>{address.country}</p></div><form action={deleteAccountAddressAction}><input type="hidden" name="id" value={address.id}/><button className="text-sm font-black text-rust">Delete</button></form></div></article>)}{!addresses.length ? <div className="rounded-xl border border-line bg-white p-8 text-muted">No saved addresses yet.</div> : null}</section><AddressForm /></div></AccountShell>;
}

function AddressForm() {
  return <form action={saveAccountAddressAction} className="grid h-fit gap-3 rounded-xl border border-line bg-white p-5"><h2 className="font-black">Add address</h2><Input name="label" label="Label" defaultValue="Home"/><Input name="full_name" label="Full name"/><Input name="phone" label="Phone"/><Input name="address_line_1" label="Address line 1"/><Input name="address_line_2" label="Address line 2" required={false}/><Input name="city" label="City"/><Input name="state" label="State"/><Input name="postal_code" label="Postal code"/><Input name="country" label="Country" defaultValue="India"/><label className="text-sm font-bold"><input name="is_default" type="checkbox"/> Make default</label><button className="rounded-lg bg-rust px-5 py-3 font-black text-white">Save address</button></form>;
}
function Input({ name, label, defaultValue = '', required = true }: { name: string; label: string; defaultValue?: string; required?: boolean }) { return <label className="grid gap-2 text-sm font-black"><span>{label}</span><input name={name} defaultValue={defaultValue} required={required} className="min-h-11 rounded-lg border border-line bg-paper px-4 outline-none"/></label>; }
