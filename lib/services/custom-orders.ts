import { createClient } from '@/lib/supabase/server';

export async function createCustomOrderRequest(values: Record<string, unknown>) {
  const supabase = await createClient();
  return supabase.from('custom_order_requests').insert(values).select('*').single();
}

export async function createCustomOrderQuote(values: Record<string, unknown>) {
  const supabase = await createClient();
  return supabase.from('custom_order_quotes').insert(values).select('*').single();
}
