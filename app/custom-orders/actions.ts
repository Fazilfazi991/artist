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
  try {
    const request = await createCustomOrderRequest(formData);
    revalidatePath('/account/custom-orders');
    redirect(`/account/custom-orders/${request.id}?created=1`);
  } catch (error: any) {
    redirect(`${next}?error=${encodeURIComponent(error.message || 'Could not submit custom request.')}`);
  }
}
