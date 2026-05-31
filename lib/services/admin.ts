import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/services/auth';

export async function listPendingSellerApplications() {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from('seller_profiles').select('*, profiles(email, full_name)').in('status', ['submitted', 'under_review']).order('created_at');
}

export async function approveSeller(sellerId: string) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  return supabase.from('seller_profiles').update({ status: 'approved', reviewed_by: admin.id, reviewed_at: new Date().toISOString(), rejection_reason: null }).eq('id', sellerId).select('*').single();
}

export async function rejectSeller(sellerId: string, reason: string) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  return supabase.from('seller_profiles').update({ status: 'rejected', rejection_reason: reason, reviewed_by: admin.id, reviewed_at: new Date().toISOString() }).eq('id', sellerId).select('*').single();
}

export async function suspendSeller(sellerId: string, reason: string) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  return supabase.from('seller_profiles').update({ status: 'suspended', rejection_reason: reason, reviewed_by: admin.id, reviewed_at: new Date().toISOString() }).eq('id', sellerId).select('*').single();
}
