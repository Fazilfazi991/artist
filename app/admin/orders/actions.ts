'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { completeOrderAsAdminOrSystem, overrideOrderStatusAsAdmin, simulateOrderPaidAsAdmin } from '@/lib/services/order-fulfilment';
import type { StandardOrderStatus } from '@/lib/types/order-fulfilment';

function text(formData: FormData, key: string) { return String(formData.get(key) || '').trim(); }
function fail(orderId: string, message: string) { redirect(`/admin/orders/${orderId}?error=${encodeURIComponent(message)}`); }

export async function simulatePaidAction(formData: FormData) {
  const orderId = text(formData, 'order_id');
  try { await simulateOrderPaidAsAdmin(orderId); } catch (error: any) { fail(orderId, error.message || 'Could not mark paid.'); }
  revalidatePath('/admin/orders');
  redirect(`/admin/orders/${orderId}?paid=1`);
}

export async function adminOverrideStatusAction(formData: FormData) {
  const orderId = text(formData, 'order_id');
  try { await overrideOrderStatusAsAdmin(orderId, text(formData, 'status') as StandardOrderStatus, text(formData, 'reason')); } catch (error: any) { fail(orderId, error.message || 'Could not override status.'); }
  revalidatePath('/admin/orders');
  redirect(`/admin/orders/${orderId}?override=1`);
}

export async function adminCompleteOrderAction(formData: FormData) {
  const orderId = text(formData, 'order_id');
  try { await completeOrderAsAdminOrSystem(orderId); } catch (error: any) { fail(orderId, error.message || 'Could not complete order.'); }
  revalidatePath('/admin/orders');
  redirect(`/admin/orders/${orderId}?completed=1`);
}
