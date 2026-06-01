'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/services/auth';
import { addressSchema } from '@/lib/validators/address';

function text(formData: FormData, key: string) { return String(formData.get(key) || '').trim(); }
function fail(path: string, message: string) { redirect(`${path}?error=${encodeURIComponent(message)}`); }

export async function saveAccountAddressAction(formData: FormData) {
  const user = await requireAuth();
  const path = '/account/addresses';
  let parsed: any;
  try {
    parsed = addressSchema.parse({
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
  } catch (error: any) { fail(path, error.errors?.[0]?.message || 'Check address details.'); }
  const supabase = createServiceRoleClient();
  const id = text(formData, 'id');
  if (parsed.is_default) await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
  const result = id ? await supabase.from('addresses').update(parsed).eq('id', id).eq('user_id', user.id) : await supabase.from('addresses').insert({ ...parsed, user_id: user.id });
  if (result.error) fail(path, result.error.message);
  revalidatePath(path);
  redirect(`${path}?saved=1`);
}

export async function setDefaultAccountAddressAction(formData: FormData) {
  const user = await requireAuth();
  const supabase = createServiceRoleClient();
  const id = text(formData, 'id');
  await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
  const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id).eq('user_id', user.id);
  if (error) fail('/account/addresses', error.message);
  revalidatePath('/account/addresses');
  redirect('/account/addresses?saved=1');
}

export async function deleteAccountAddressAction(formData: FormData) {
  const user = await requireAuth();
  const supabase = createServiceRoleClient();
  await supabase.from('addresses').delete().eq('id', text(formData, 'id')).eq('user_id', user.id);
  revalidatePath('/account/addresses');
  redirect('/account/addresses?deleted=1');
}

export async function saveProfileAction(formData: FormData) {
  const user = await requireAuth();
  const fullName = text(formData, 'full_name');
  const phone = text(formData, 'phone');
  if (fullName.length < 2) fail('/account/profile', 'Full name is required.');
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from('profiles').update({ full_name: fullName, phone: phone || null }).eq('id', user.id);
  if (error) fail('/account/profile', error.message);
  revalidatePath('/account/profile');
  redirect('/account/profile?saved=1');
}

export async function markNotificationReadAction(formData: FormData) {
  const user = await requireAuth();
  const supabase = createServiceRoleClient();
  await supabase.from('notifications').update({ is_read: true }).eq('id', text(formData, 'id')).eq('user_id', user.id);
  revalidatePath('/account/notifications');
  redirect('/account/notifications');
}

export async function createSupportTicketAction(formData: FormData) {
  const user = await requireAuth();
  const subject = text(formData, 'subject');
  const description = text(formData, 'description');
  if (subject.length < 3 || description.length < 10) fail('/account/support', 'Add a subject and a short description.');
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from('support_tickets').insert({ user_id: user.id, subject, description, order_id: text(formData, 'order_id') || null });
  if (error) fail('/account/support', error.message);
  revalidatePath('/account/support');
  redirect('/account/support?created=1');
}
