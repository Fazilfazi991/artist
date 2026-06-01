'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { acceptQuoteAsBuyer, declineQuoteAsBuyer, requestQuoteRevisionAsBuyer } from '@/lib/services/custom-orders';

function text(formData: FormData, key: string) { return String(formData.get(key) || '').trim(); }
function fail(id: string, message: string) { redirect(`/account/custom-orders/${id}?error=${encodeURIComponent(message)}`); }

export async function acceptCustomQuoteAction(formData: FormData) {
  const id = text(formData, 'request_id');
  try { await acceptQuoteAsBuyer(id); } catch (error: any) { fail(id, error.message || 'Could not accept quote.'); }
  revalidatePath('/account/custom-orders');
  redirect(`/account/custom-orders/${id}?accepted=1`);
}

export async function declineCustomQuoteAction(formData: FormData) {
  const id = text(formData, 'request_id');
  try { await declineQuoteAsBuyer(id); } catch (error: any) { fail(id, error.message || 'Could not decline quote.'); }
  revalidatePath('/account/custom-orders');
  redirect(`/account/custom-orders/${id}?declined=1`);
}

export async function requestQuoteRevisionAction(formData: FormData) {
  const id = text(formData, 'request_id');
  try { await requestQuoteRevisionAsBuyer(id, text(formData, 'revision_note')); } catch (error: any) { fail(id, error.message || 'Could not request revision.'); }
  revalidatePath('/account/custom-orders');
  redirect(`/account/custom-orders/${id}?revision=1`);
}
