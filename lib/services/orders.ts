import { createClient } from '@/lib/supabase/server';

export async function getOrder(orderId: string) {
  const supabase = await createClient();
  return supabase.from('orders').select('*, order_items(*)').eq('id', orderId).single();
}

export async function listMyOrders(userId: string) {
  const supabase = await createClient();
  return supabase.from('orders').select('*').eq('buyer_id', userId).order('created_at', { ascending: false });
}
