'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { confirmOrderAsSeller, createOrderProgressUpdate, dispatchOrderAsSeller, markReadyToShipAsSeller, startProductionAsSeller } from '@/lib/services/order-fulfilment';

function text(formData: FormData, key: string) { return String(formData.get(key) || '').trim(); }
function fail(orderId: string, message: string) { redirect(`/seller/orders/${orderId}?error=${encodeURIComponent(message)}`); }

export async function confirmOrderAction(formData: FormData) {
  const orderId = text(formData, 'order_id');
  try { await confirmOrderAsSeller(orderId); } catch (error: any) { fail(orderId, error.message || 'Could not confirm order.'); }
  revalidatePath('/seller/orders');
  redirect(`/seller/orders/${orderId}?updated=1`);
}

export async function startProductionAction(formData: FormData) {
  const orderId = text(formData, 'order_id');
  try { await startProductionAsSeller(orderId); } catch (error: any) { fail(orderId, error.message || 'Could not start production.'); }
  revalidatePath('/seller/orders');
  redirect(`/seller/orders/${orderId}?updated=1`);
}

export async function markReadyToShipAction(formData: FormData) {
  const orderId = text(formData, 'order_id');
  try { await markReadyToShipAsSeller(orderId); } catch (error: any) { fail(orderId, error.message || 'Could not mark ready to ship.'); }
  revalidatePath('/seller/orders');
  redirect(`/seller/orders/${orderId}?updated=1`);
}

export async function dispatchOrderAction(formData: FormData) {
  const orderId = text(formData, 'order_id');
  try {
    await dispatchOrderAsSeller(orderId, { courierName: text(formData, 'courier_name'), trackingNumber: text(formData, 'tracking_number'), trackingUrl: text(formData, 'tracking_url') || undefined });
  } catch (error: any) { fail(orderId, error.message || 'Could not dispatch order.'); }
  revalidatePath('/seller/orders');
  redirect(`/seller/orders/${orderId}?updated=1`);
}

export async function addProgressUpdateAction(formData: FormData) {
  const orderId = text(formData, 'order_id');
  try { await createOrderProgressUpdate(formData); } catch (error: any) { fail(orderId, error.message || 'Could not add progress update.'); }
  revalidatePath(`/seller/orders/${orderId}`);
  redirect(`/seller/orders/${orderId}?progress=1`);
}
