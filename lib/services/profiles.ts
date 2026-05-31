import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/services/auth';

export async function getProfile(id: string) {
  const supabase = await createClient();
  return supabase.from('profiles').select('*').eq('id', id).single();
}

export async function updateOwnProfile(values: Record<string, unknown>) {
  const user = await requireAuth();
  const supabase = await createClient();
  return supabase.from('profiles').update(values).eq('id', user.id).select('*').single();
}
