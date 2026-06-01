'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createOrderIssue, markDeliveredAsBuyer } from '@/lib/services/order-fulfilment';

function text(formData: FormData, key: string) { return String(formData.get(key) || '').trim(); }
function fail(orderId: string, message: string) { redirect(`/account/orders/${orderId}?error=${encodeURIComponent(message)}`); }

export async function confirmDeliveryAction(formData: FormData) {
  const orderId = text(formData, 'order_id');
  try { await markDeliveredAsBuyer(orderId); } catch (error: any) { fail(orderId, error.message || 'Could not confirm delivery.'); }
  revalidatePath('/account/orders');
  redirect(`/account/orders/${orderId}?delivered=1`);
}

export async function reportOrderIssueAction(formData: FormData) {
  const orderId = text(formData, 'order_id');
  try { await createOrderIssue(formData); } catch (error: any) { fail(orderId, error.message || 'Could not report issue.'); }
  revalidatePath(`/account/orders/${orderId}`);
  redirect(`/account/orders/${orderId}?issue=1`);
}
