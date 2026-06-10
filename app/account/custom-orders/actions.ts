'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { acceptQuoteAsBuyer, addCustomOrderMessageAsBuyer, approveMilestoneAsBuyer, declineQuoteAsBuyer, requestQuoteRevisionAsBuyer } from '@/lib/services/custom-orders';

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

export async function addBuyerCustomMessageAction(formData: FormData) {
  const id = text(formData, 'request_id');
  try { await addCustomOrderMessageAsBuyer(formData); } catch (error: any) { fail(id, error.message || 'Could not add message.'); }
  revalidatePath('/account/custom-orders');
  redirect(`/account/custom-orders/${id}?message=1`);
}

export async function approveCustomMilestoneAction(formData: FormData) {
  const id = text(formData, 'request_id');
  try { await approveMilestoneAsBuyer(formData); } catch (error: any) { fail(id, error.message || 'Could not approve milestone.'); }
  revalidatePath('/account/custom-orders');
  redirect(`/account/custom-orders/${id}?milestone_approved=1`);
}
