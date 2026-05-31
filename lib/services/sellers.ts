import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/services/auth';

export async function createSellerDraft(values: Record<string, unknown>) {
  const user = await requireAuth();
  const supabase = await createClient();
  return supabase.from('seller_profiles').insert({ ...values, user_id: user.id, status: 'draft' }).select('*').single();
}

export async function updateSellerOnboardingProfile(sellerId: string, values: Record<string, unknown>) {
  const supabase = await createClient();
  return supabase.from('seller_profiles').update(values).eq('id', sellerId).select('*').single();
}

export async function submitSellerApplication(sellerId: string) {
  const supabase = await createClient();
  return supabase.from('seller_profiles').update({ status: 'submitted' }).eq('id', sellerId).select('*').single();
}

export async function uploadDocumentMetadata(sellerId: string, documentType: string, storagePath: string) {
  const supabase = await createClient();
  return supabase.from('seller_documents').insert({ seller_id: sellerId, document_type: documentType, storage_path: storagePath }).select('*').single();
}
