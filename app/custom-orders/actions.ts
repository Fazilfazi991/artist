'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/services/auth';
import { createCustomOrderRequest } from '@/lib/services/custom-orders';

function text(formData: FormData, key: string) { return String(formData.get(key) || '').trim(); }

export async function submitCustomOrderRequestAction(formData: FormData) {
  const next = text(formData, 'next') || '/custom-orders';
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  let requestId = '';
  try {
    const request = await createCustomOrderRequest(formData);
    requestId = request.id;
    revalidatePath('/account/custom-orders');
    revalidatePath('/seller/custom-requests');
    revalidatePath('/seller/messages');
    revalidatePath('/seller/dashboard');
    revalidatePath('/seller/analytics');
  } catch (error: any) {
    const message = error?.issues?.[0]?.message || error?.message || 'Could not submit custom request.';
    redirect(`${next}?error=${encodeURIComponent(message)}`);
  }
  redirect(`/account/custom-orders/${requestId}?created=1`);
}
