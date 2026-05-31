'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { checkoutAddressSchema } from '@/lib/validators/checkout';
import { createPendingPaymentOrders, requireBuyer } from '@/lib/services/checkout';

function text(formData: FormData, key: string) {
  return String(formData.get(key) || '').trim();
}

function fail(path: string, message: string) {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function saveAddressAction(formData: FormData) {
  const user = await requireBuyer();
  if (!user) redirect('/login?next=/checkout/address');
  let parsed: any;
  try {
    parsed = checkoutAddressSchema.parse({
      id: text(formData, 'id') || undefined,
      label: text(formData, 'label') || 'Home',
      full_name: text(formData, 'full_name'),
      phone: text(formData, 'phone'),
      address_line_1: text(formData, 'address_line_1'),
      address_line_2: text(formData, 'address_line_2') || undefined,
      city: text(formData, 'city'),
      state: text(formData, 'state'),
      postal_code: text(formData, 'postal_code'),
      country: text(formData, 'country') || 'India',
      is_default: formData.get('is_default') === 'on'
    });
  } catch (error: any) {
    fail('/checkout/address', error.errors?.[0]?.message || 'Check address details.');
  }
  if (!parsed) fail('/checkout/address', 'Check address details.');
  const service = createServiceRoleClient();
  const payload = { ...parsed, user_id: user.id };
  delete (payload as any).id;
  const result = parsed.id
    ? await service.from('addresses').update(payload).eq('id', parsed.id).eq('user_id', user.id)
    : await service.from('addresses').insert(payload);
  if (result.error) fail('/checkout/address', result.error.message);
  revalidatePath('/checkout/address');
  redirect('/checkout/review');
}

export async function deleteAddressAction(formData: FormData) {
  const user = await requireBuyer();
  if (!user) redirect('/login?next=/checkout/address');
  const service = createServiceRoleClient();
  await service.from('addresses').delete().eq('id', text(formData, 'id')).eq('user_id', user.id);
  revalidatePath('/checkout/address');
  redirect('/checkout/address');
}

export async function placeOrderAction(formData: FormData) {
  const user = await requireBuyer();
  if (!user) redirect('/login?next=/checkout/review');
  let ids = '';
  try {
    const orders = await createPendingPaymentOrders({
      buyerId: user.id,
      addressId: text(formData, 'address_id'),
      checkoutToken: text(formData, 'checkout_token'),
      buyerNotes: text(formData, 'buyer_notes') || undefined
    });
    ids = orders.map((order) => order.id).join(',');
  } catch (error: any) {
    fail('/checkout/review', error.message || 'Checkout failed. Please try again.');
  }
  redirect(`/checkout/confirmation?orders=${encodeURIComponent(ids)}`);
}
