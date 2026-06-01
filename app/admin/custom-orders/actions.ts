'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminOverrideCustomOrderStatus, markDepositPaidAsAdminForTesting, markFinalPaymentPaidAsAdminForTesting } from '@/lib/services/custom-orders';
import type { BespokeOrderStatus } from '@/lib/types/custom-orders';

function text(formData: FormData, key: string) { return String(formData.get(key) || '').trim(); }
function fail(id: string, message: string) { redirect(`/admin/custom-orders/${id}?error=${encodeURIComponent(message)}`); }

export async function markCustomDepositPaidAction(formData: FormData) {
  const id = text(formData, 'request_id');
  try { await markDepositPaidAsAdminForTesting(id); } catch (error: any) { fail(id, error.message || 'Could not mark deposit paid.'); }
  revalidatePath('/admin/custom-orders');
  redirect(`/admin/custom-orders/${id}?deposit=1`);
}

export async function markCustomFinalPaidAction(formData: FormData) {
  const id = text(formData, 'request_id');
  try { await markFinalPaymentPaidAsAdminForTesting(id); } catch (error: any) { fail(id, error.message || 'Could not mark final payment paid.'); }
  revalidatePath('/admin/custom-orders');
  redirect(`/admin/custom-orders/${id}?final=1`);
}

export async function adminOverrideCustomStatusAction(formData: FormData) {
  const id = text(formData, 'request_id');
  try { await adminOverrideCustomOrderStatus(id, text(formData, 'status') as BespokeOrderStatus, text(formData, 'reason')); } catch (error: any) { fail(id, error.message || 'Could not override status.'); }
  revalidatePath('/admin/custom-orders');
  redirect(`/admin/custom-orders/${id}?override=1`);
}
