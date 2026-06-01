import { createServiceRoleClient } from '@/lib/supabase/server';

export async function getBuyerAccountOverview(userId: string) {
  const supabase = createServiceRoleClient();
  const [profile, orders, addresses, wishlist, notifications, tickets] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('orders').select('*, seller_profiles(store_name, store_slug), order_items(*)').eq('buyer_id', userId).order('created_at', { ascending: false }).limit(5),
    supabase.from('addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('wishlists').select('*, wishlist_items(*, products(*, product_images(*), seller_profiles(store_name)))').eq('user_id', userId).maybeSingle(),
    supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(8),
    supabase.from('support_tickets').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
  ]);
  const orderRows = orders.data || [];
  return {
    profile: profile.data,
    orders: orderRows,
    addresses: addresses.data || [],
    wishlist: wishlist.data,
    notifications: notifications.data || [],
    tickets: tickets.data || [],
    stats: {
      totalOrders: orderRows.length,
      activeOrders: orderRows.filter((order: any) => !['completed','cancelled','refunded'].includes(order.status)).length,
      awaitingDelivery: orderRows.filter((order: any) => ['ready_to_ship','dispatched'].includes(order.status)).length,
      wishlistItems: wishlist.data?.wishlist_items?.length || 0
    }
  };
}

export async function getBuyerAddresses(userId: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from('addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false }).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getBuyerNotifications(userId: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getBuyerSupportTickets(userId: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from('support_tickets').select('*, orders(order_number)').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getBuyerWishlist(userId: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from('wishlists').select('*, wishlist_items(*, products(*, product_images(*), seller_profiles(store_name)))').eq('user_id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
