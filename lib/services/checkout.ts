import { randomUUID } from 'crypto';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { clearCart, getCart, summarizeCart, validateCartItems } from '@/lib/services/cart';
import type { CreatedOrderSummary } from '@/lib/types/checkout';

function money(value: number) {
  return Number(value.toFixed(2));
}

export async function requireBuyer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return user;
}

export async function getBuyerAddresses(userId: string) {
  const service = createServiceRoleClient();
  const { data, error } = await service.from('addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false }).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getOrCreateCheckoutSession(userId: string, cartId: string) {
  const service = createServiceRoleClient();
  const existing = await service.from('checkout_sessions').select('*').eq('buyer_id', userId).eq('cart_id', cartId).in('status', ['started', 'failed']).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (existing.data) return existing.data;
  const { data, error } = await service.from('checkout_sessions').insert({ buyer_id: userId, cart_id: cartId, token: randomUUID(), status: 'started' }).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createPendingPaymentOrders(input: { buyerId: string; addressId: string; checkoutToken: string; buyerNotes?: string }) {
  const service = createServiceRoleClient();
  const { data: session, error: sessionError } = await service.from('checkout_sessions').select('*').eq('token', input.checkoutToken).eq('buyer_id', input.buyerId).single();
  if (sessionError || !session) throw new Error('Checkout session is no longer valid.');
  if (session.status === 'completed' && session.created_order_ids?.length) return loadCreatedOrders(session.created_order_ids);
  if (session.status === 'processing') throw new Error('This checkout is already processing. Refresh the confirmation page in a moment.');

  await service.from('checkout_sessions').update({ status: 'processing', selected_address_id: input.addressId, error_message: null }).eq('id', session.id);

  const createdIds: string[] = [];
  try {
    const [{ data: address }, { data: setting }] = await Promise.all([
      service.from('addresses').select('*').eq('id', input.addressId).eq('user_id', input.buyerId).single(),
      service.from('platform_settings').select('*').eq('key', 'marketplace_commission_percentage').maybeSingle()
    ]);
    if (!address) throw new Error('Choose a delivery address.');
    const commissionRate = readCommission(setting?.value);
    const cartData = await service.from('carts').select('*, cart_items(*, products(*, seller_profiles(store_name, store_slug), categories(name, slug), product_images(*), product_variants(*), product_customization_fields(*)))').eq('id', session.cart_id).eq('user_id', input.buyerId).single();
    if (cartData.error || !cartData.data) throw new Error('Your cart is empty.');
    const cart = summarizeCart(cartData.data);
    if (!cart.items.length) throw new Error('Your cart is empty.');
    const errors = validateCartItems(cart.items);
    if (errors.length) throw new Error(errors[0]);

    for (const group of cart.groups) {
      const subtotal = money(group.items.reduce((sum, item) => sum + Number(item.unit_price) * Number(item.quantity), 0));
      const shippingFee = money(group.items.reduce((max, item) => Math.max(max, Number(item.products?.shipping_fee || 0)), 0));
      const platformCommission = money(subtotal * commissionRate / 100);
      const sellerNet = money(Math.max(subtotal - platformCommission, 0));
      const total = money(subtotal + shippingFee);
      const { data: order, error: orderError } = await service.from('orders').insert({
        buyer_id: input.buyerId,
        seller_id: group.seller.id,
        status: 'pending_payment',
        subtotal,
        shipping_fee: shippingFee,
        platform_commission: platformCommission,
        payment_gateway_fee: 0,
        total_amount: total,
        seller_net_amount: sellerNet,
        shipping_address: snapshotAddress(address),
        buyer_notes: input.buyerNotes || null
      }).select('*').single();
      if (orderError) throw new Error(orderError.message);
      createdIds.push(order.id);
      const rows = group.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        variant_data: item.variant_data,
        customization_data: item.customization_data,
        product_snapshot: productSnapshot(item.products, item.variant_data, item.customization_data)
      }));
      const { error: itemError } = await service.from('order_items').insert(rows);
      if (itemError) throw new Error(itemError.message);
    }

    await clearCart(session.cart_id);
    await service.from('checkout_sessions').update({ status: 'completed', created_order_ids: createdIds }).eq('id', session.id);
    return loadCreatedOrders(createdIds);
  } catch (error: any) {
    if (createdIds.length) await service.from('orders').delete().in('id', createdIds);
    await service.from('checkout_sessions').update({ status: 'failed', created_order_ids: [], error_message: error.message || 'Checkout failed.' }).eq('id', session.id);
    throw error;
  }
}

export async function getCheckoutState(userId: string) {
  const cart = await getCart();
  const addresses = await getBuyerAddresses(userId);
  const session = cart.cart?.id && cart.items.length ? await getOrCreateCheckoutSession(userId, cart.cart.id) : null;
  return { cart, addresses, session };
}

export async function getBuyerOrders(userId: string) {
  const service = createServiceRoleClient();
  const { data, error } = await service.from('orders').select('*, seller_profiles(store_name, store_slug), order_items(*)').eq('buyer_id', userId).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getBuyerOrder(orderId: string, userId: string) {
  const service = createServiceRoleClient();
  const { data, error } = await service.from('orders').select('*, seller_profiles(store_name, store_slug), order_items(*), order_status_history(*), order_progress_updates(*), order_issues(*)').eq('id', orderId).eq('buyer_id', userId).single();
  if (error) return null;
  return data;
}

export async function getSellerOrders(userId: string) {
  const service = createServiceRoleClient();
  const { data: seller } = await service.from('seller_profiles').select('*').eq('user_id', userId).eq('status', 'approved').maybeSingle();
  if (!seller) return { seller: null, orders: [] };
  const { data, error } = await service.from('orders').select('*, profiles!orders_buyer_id_fkey(email, full_name), order_items(*)').eq('seller_id', seller.id).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return { seller, orders: data || [] };
}

export async function getSellerOrder(orderId: string, userId: string) {
  const service = createServiceRoleClient();
  const { data: seller } = await service.from('seller_profiles').select('*').eq('user_id', userId).eq('status', 'approved').maybeSingle();
  if (!seller) return null;
  const { data, error } = await service.from('orders').select('*, profiles!orders_buyer_id_fkey(email, full_name, phone), order_items(*), order_status_history(*), order_progress_updates(*), order_issues(*)').eq('id', orderId).eq('seller_id', seller.id).single();
  if (error) return null;
  return data;
}

export async function getAdminOrders() {
  const service = createServiceRoleClient();
  const { data, error } = await service.from('orders').select('*, seller_profiles(store_name, store_slug), profiles!orders_buyer_id_fkey(email, full_name), order_items(*), order_issues(*)').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getAdminOrder(orderId: string) {
  const service = createServiceRoleClient();
  const { data, error } = await service.from('orders').select('*, seller_profiles(store_name, store_slug, user_id), profiles!orders_buyer_id_fkey(email, full_name, phone), order_items(*), order_status_history(*), order_progress_updates(*), order_issues(*)').eq('id', orderId).single();
  if (error) return null;
  return data;
}

async function loadCreatedOrders(ids: string[]): Promise<CreatedOrderSummary[]> {
  const service = createServiceRoleClient();
  const { data, error } = await service.from('orders').select('id, order_number, seller_id, total_amount, status, seller_profiles(store_name)').in('id', ids);
  if (error) throw new Error(error.message);
  return (data || []).map((order: any) => ({
    id: order.id,
    order_number: order.order_number,
    seller_id: order.seller_id,
    seller_name: order.seller_profiles?.store_name || 'Artisan',
    total_amount: Number(order.total_amount || 0),
    status: order.status
  }));
}

function readCommission(value: any) {
  if (typeof value === 'number') return value;
  if (value && typeof value.percent === 'number') return value.percent;
  const parsed = Number(value?.percent ?? value ?? 8);
  return Number.isFinite(parsed) ? parsed : 8;
}

function snapshotAddress(address: any) {
  return {
    label: address.label,
    full_name: address.full_name,
    phone: address.phone,
    address_line_1: address.address_line_1,
    address_line_2: address.address_line_2,
    city: address.city,
    state: address.state,
    postal_code: address.postal_code,
    country: address.country || 'India'
  };
}

function productSnapshot(product: any, variantData: any, customizationData: any) {
  return {
    name: product.name,
    slug: product.slug,
    product_type: product.product_type,
    primary_image: product.product_images?.[0]?.image_url || null,
    seller_id: product.seller_id,
    seller_store_name: product.seller_profiles?.store_name,
    category: product.categories?.name,
    base_price: product.base_price,
    selected_variant: variantData,
    selected_customization: customizationData,
    production_days: product.production_days,
    dispatch_days: product.dispatch_days
  };
}
