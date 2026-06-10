'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { addCustomOrderMessageAsSeller, addMilestoneAsSeller, completeCustomOrderAsAdminOrSeller, createQuoteAsSeller, markFinalPaymentPendingAsSeller, markReadyForDeliveryAsSeller, markRequestReviewingAsSeller, startCustomOrderProductionAsSeller } from '@/lib/services/custom-orders';

function text(formData: FormData, key: string) { return String(formData.get(key) || '').trim(); }
function fail(id: string, message: string) { redirect(`/seller/custom-requests/${id}?error=${encodeURIComponent(message)}`); }

export async function startReviewAction(formData: FormData) {
  const id = text(formData, 'request_id');
  try { await markRequestReviewingAsSeller(id); } catch (error: any) { fail(id, error.message || 'Could not start review.'); }
  revalidatePath('/seller/custom-requests');
  redirect(`/seller/custom-requests/${id}?reviewing=1`);
}

export async function sendQuoteAction(formData: FormData) {
  const id = text(formData, 'request_id');
  try { await createQuoteAsSeller(formData); } catch (error: any) { fail(id, error.message || 'Could not send quote.'); }
  revalidatePath('/seller/custom-requests');
  redirect(`/seller/custom-requests/${id}?quote=1`);
}

export async function startProductionAction(formData: FormData) {
  const id = text(formData, 'request_id');
  try { await startCustomOrderProductionAsSeller(id); } catch (error: any) { fail(id, error.message || 'Could not start production.'); }
  revalidatePath('/seller/custom-requests');
  redirect(`/seller/custom-requests/${id}?production=1`);
}

export async function addMilestoneAction(formData: FormData) {
  const id = text(formData, 'request_id');
  try { await addMilestoneAsSeller(formData); } catch (error: any) { fail(id, error.message || 'Could not add milestone.'); }
  revalidatePath('/seller/custom-requests');
  redirect(`/seller/custom-requests/${id}?milestone=1`);
}

export async function markFinalPendingAction(formData: FormData) {
  const id = text(formData, 'request_id');
  try { await markFinalPaymentPendingAsSeller(id); } catch (error: any) { fail(id, error.message || 'Could not request final payment.'); }
  revalidatePath('/seller/custom-requests');
  redirect(`/seller/custom-requests/${id}?final=1`);
}

export async function markReadyForDeliveryAction(formData: FormData) {
  const id = text(formData, 'request_id');
  try { await markReadyForDeliveryAsSeller(id); } catch (error: any) { fail(id, error.message || 'Could not mark ready.'); }
  revalidatePath('/seller/custom-requests');
  redirect(`/seller/custom-requests/${id}?ready=1`);
}

export async function completeCustomRequestAction(formData: FormData) {
  const id = text(formData, 'request_id');
  try { await completeCustomOrderAsAdminOrSeller(id); } catch (error: any) { fail(id, error.message || 'Could not complete request.'); }
  revalidatePath('/seller/custom-requests');
  redirect(`/seller/custom-requests/${id}?completed=1`);
}

export async function addSellerCustomMessageAction(formData: FormData) {
  const id = text(formData, 'request_id');
  try { await addCustomOrderMessageAsSeller(formData); } catch (error: any) { fail(id, error.message || 'Could not add message.'); }
  revalidatePath('/seller/custom-requests');
  redirect(`/seller/custom-requests/${id}?message=1`);
}
