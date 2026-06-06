import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PhoneCountryField } from '@/components/phone-country-field';
import { EmptyState, SectionHeading } from '@/components/ui';
import { getCheckoutState, requireBuyer } from '@/lib/services/checkout';
import { deleteAddressAction, saveAddressAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function CheckoutAddressPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const params = await searchParams;
  const user = await requireBuyer();
  if (!user) redirect('/login?next=/checkout/address');
  const { cart, addresses } = await getCheckoutState(user.id);
  if (!cart.items.length) return <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6"><EmptyState title="Your cart is waiting for something special." copy="Add an item before choosing delivery details." /></main>;
  return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"><SectionHeading eyebrow="Checkout" title="Delivery address" copy="Choose where your artisan orders should be delivered." />{params.error ? <p className="mb-4 rounded-lg border border-rust/30 bg-rust/10 p-3 font-bold text-rust">{params.error}</p> : null}<div className="grid gap-6 lg:grid-cols-[1fr_1fr]"><section className="grid gap-3">{addresses.map((address: any) => <article key={address.id} className="rounded-xl border border-line bg-white p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-black">{address.label}{address.is_default ? ' · Default' : ''}</h2><p className="mt-2 text-sm leading-6 text-muted">{address.full_name}<br/>{address.phone}<br/>{address.address_line_1}{address.address_line_2 ? `, ${address.address_line_2}` : ''}<br/>{address.city}, {address.state} {address.postal_code}<br/>{address.country}</p></div><form action={deleteAddressAction}><input type="hidden" name="id" value={address.id}/><button className="text-sm font-black text-rust">Delete</button></form></div><Link href={`/checkout/review?address=${address.id}`} className="mt-4 inline-flex rounded-lg bg-rust px-4 py-3 font-black text-white">Deliver here</Link></article>)}{!addresses.length ? <div className="rounded-xl border border-line bg-white p-6 text-muted">No saved addresses yet.</div> : null}</section><AddressForm /></div></main>;
}

function AddressForm() {
  return <form action={saveAddressAction} className="grid gap-4 rounded-xl border border-line bg-white p-5"><h2 className="font-black">Add address</h2><Input name="label" label="Label" defaultValue="Home" /><Input name="full_name" label="Full name" /><PhoneCountryField /><Input name="address_line_1" label="Address line 1" /><Input name="address_line_2" label="Address line 2" required={false}/><div className="grid gap-4 sm:grid-cols-2"><Input name="city" label="City" /><Input name="state" label="State" /></div><div className="grid gap-4 sm:grid-cols-2"><Input name="postal_code" label="Postal code" /><Input name="country" label="Country" defaultValue="India" /></div><label className="text-sm font-bold"><input name="is_default" type="checkbox" defaultChecked /> Make default</label><button className="rounded-lg bg-rust px-5 py-3 font-black text-white">Save and review</button></form>;
}

function Input({ name, label, defaultValue = '', required = true }: { name: string; label: string; defaultValue?: string; required?: boolean }) {
  return <label className="grid gap-2 text-sm font-black"><span>{label}</span><input name={name} defaultValue={defaultValue} required={required} className="min-h-11 rounded-lg border border-line bg-paper px-4 outline-none" /></label>;
}
