import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import type { CartSummary, SellerCartGroup } from '@/lib/types/cart';

const CART_COOKIE = 'artisan_cart_session';
const CART_SELECT = '*, cart_items(*, products(*, seller_profiles(store_name, store_slug), categories(name, slug), product_images(*), product_variants(*), product_customization_fields(*)))';

function toMoney(value: unknown) {
  return Number(Number(value || 0).toFixed(2));
}

export async function getCartOwner(options: { createSession?: boolean } = {}) {
  const cookieStore = await cookies();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let sessionId = cookieStore.get(CART_COOKIE)?.value;
  if (!user && !sessionId && options.createSession) {
    sessionId = randomUUID();
    cookieStore.set(CART_COOKIE, sessionId, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 45 });
  }
  return { user, sessionId };
}

export async function getOrCreateCart() {
  const service = createServiceRoleClient();
  const { user, sessionId } = await getCartOwner({ createSession: true });
  const match = user ? { user_id: user.id } : { session_id: sessionId };
  const existing = await service.from('carts').select('*').match(match).maybeSingle();
  if (existing.data) return existing.data;
  const { data, error } = await service.from('carts').insert(match).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getCart(): Promise<CartSummary> {
  const service = createServiceRoleClient();
  const { user, sessionId } = await getCartOwner();
  const match = user ? { user_id: user.id } : sessionId ? { session_id: sessionId } : null;
  if (!match) return emptyCart();
  const { data, error } = await service.from('carts').select(CART_SELECT).match(match).maybeSingle();
  if (error) throw new Error(error.message);
  return summarizeCart(data);
}

export async function getCartCount() {
  const summary = await getCart();
  return summary.count;
}

export async function addItemToCart(formData: FormData) {
  const service = createServiceRoleClient();
  const cart = await getOrCreateCart();
  const productId = String(formData.get('product_id') || '');
  const quantity = Number(formData.get('quantity') || 1);
  const variantId = String(formData.get('variant_id') || '');

  if (!productId || !Number.isInteger(quantity) || quantity < 1) throw new Error('Choose a valid quantity.');

  const { data: product, error } = await service
    .from('products')
    .select('*, seller_profiles(store_name, store_slug, status), categories(name, slug), product_images(*), product_variants(*), product_customization_fields(*)')
    .eq('id', productId)
    .single();
  if (error || !product) throw new Error('This product is no longer available.');
  if (product.status !== 'active' || product.seller_profiles?.status !== 'approved') throw new Error('This product is not available for checkout.');
  if (product.product_type === 'bespoke') throw new Error('Bespoke products need a custom quote.');
  if (product.product_type === 'ready_to_ship' && Number(product.stock_quantity || 0) < quantity) throw new Error('Requested quantity is above available stock.');

  const variant = variantId ? (product.product_variants || []).find((item: any) => item.id === variantId) : null;
  if (variantId && !variant) throw new Error('Selected variant is not available.');
  if (variant && variant.stock_quantity != null && Number(variant.stock_quantity) < quantity) throw new Error('Selected variant does not have enough stock.');

  const customizationData = await collectCustomizationData(formData, product, cart.id);
  const unitPrice = toMoney(Number(product.base_price || 0) + Number(variant?.price_adjustment || 0) + customizationAdjustment(product, customizationData));
  const variantData = variant ? { id: variant.id, name: variant.name, value: variant.value, price_adjustment: Number(variant.price_adjustment || 0) } : null;

  const { data: item, error: insertError } = await service.from('cart_items').insert({
    cart_id: cart.id,
    product_id: product.id,
    quantity,
    unit_price: unitPrice,
    variant_data: variantData,
    customization_data: customizationData
  }).select('*').single();
  if (insertError) throw new Error(insertError.message);

  const dataWithFiles = await uploadCustomizationFiles(formData, product, item.id, customizationData);
  if (dataWithFiles !== customizationData) {
    await service.from('cart_items').update({ customization_data: dataWithFiles }).eq('id', item.id);
  }
  return item;
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const service = createServiceRoleClient();
  const summary = await getCart();
  const item = summary.items.find((line) => line.id === itemId);
  if (!item) throw new Error('Cart item not found.');
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Quantity must be at least 1.');
  const product = item.products;
  if (product?.product_type === 'ready_to_ship' && Number(product.stock_quantity || 0) < quantity) throw new Error('Requested quantity is above available stock.');
  const { error } = await service.from('cart_items').update({ quantity }).eq('id', itemId);
  if (error) throw new Error(error.message);
}

export async function removeCartItem(itemId: string) {
  const service = createServiceRoleClient();
  const summary = await getCart();
  if (!summary.items.some((line) => line.id === itemId)) throw new Error('Cart item not found.');
  const { error } = await service.from('cart_items').delete().eq('id', itemId);
  if (error) throw new Error(error.message);
}

export async function clearCart(cartId?: string) {
  const service = createServiceRoleClient();
  const cart = cartId ? { id: cartId } : await getOrCreateCart();
  await service.from('cart_items').delete().eq('cart_id', cart.id);
}

export async function mergeGuestCartIntoUserCart(userId: string) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_COOKIE)?.value;
  if (!sessionId) return;
  const service = createServiceRoleClient();
  const [{ data: guest }, { data: userCart }] = await Promise.all([
    service.from('carts').select('*, cart_items(*)').eq('session_id', sessionId).maybeSingle(),
    service.from('carts').select('*').eq('user_id', userId).maybeSingle()
  ]);
  if (!guest) return;
  const cart = userCart || (await service.from('carts').insert({ user_id: userId }).select('*').single()).data;
  const rows = (guest.cart_items || []).map((item: any) => ({
    cart_id: cart.id,
    product_id: item.product_id,
    quantity: item.quantity,
    variant_data: item.variant_data,
    customization_data: item.customization_data,
    unit_price: item.unit_price,
    metadata: item.metadata || {}
  }));
  if (rows.length) await service.from('cart_items').insert(rows);
  await service.from('carts').delete().eq('id', guest.id);
  cookieStore.delete(CART_COOKIE);
}

export function summarizeCart(cart: any): CartSummary {
  if (!cart) return emptyCart();
  const items = (cart.cart_items || []) as any[];
  const errors = validateCartItems(items);
  const groupsMap = new Map<string, SellerCartGroup>();
  for (const item of items) {
    const product = item.products;
    const seller = product?.seller_profiles;
    const sellerId = product?.seller_id || 'unknown';
    if (!groupsMap.has(sellerId)) {
      groupsMap.set(sellerId, {
        seller: { id: sellerId, store_name: seller?.store_name || 'Artisan', store_slug: seller?.store_slug || '' },
        items: [],
        subtotal: 0,
        shippingFee: 0
      });
    }
    const group = groupsMap.get(sellerId)!;
    group.items.push(item);
    group.subtotal += toMoney(Number(item.unit_price || 0) * Number(item.quantity || 0));
    group.shippingFee = Math.max(group.shippingFee, toMoney(product?.shipping_fee || 0));
  }
  const groups = Array.from(groupsMap.values()).map((group) => ({ ...group, subtotal: toMoney(group.subtotal), shippingFee: toMoney(group.shippingFee) }));
  const subtotal = toMoney(groups.reduce((sum, group) => sum + group.subtotal, 0));
  const shippingFee = toMoney(groups.reduce((sum, group) => sum + group.shippingFee, 0));
  return { cart, items, groups, subtotal, shippingFee, total: toMoney(subtotal + shippingFee), count: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0), errors };
}

export function validateCartItems(items: any[]) {
  const errors: string[] = [];
  for (const item of items) {
    const product = item.products;
    if (!product || product.status !== 'active') errors.push(`${product?.name || 'A product'} is no longer active.`);
    if (product?.product_type === 'bespoke') errors.push(`${product.name} needs a custom quote.`);
    if (product?.product_type === 'ready_to_ship' && Number(product.stock_quantity || 0) < Number(item.quantity || 0)) errors.push(`${product.name} has only ${product.stock_quantity || 0} in stock.`);
    for (const field of product?.product_customization_fields || []) {
      if (field.is_required && product.product_type === 'customized' && !item.customization_data?.[field.id]) errors.push(`${product.name} is missing ${field.label}.`);
    }
  }
  return errors;
}

function emptyCart(): CartSummary {
  return { cart: null, items: [], groups: [], subtotal: 0, shippingFee: 0, total: 0, count: 0, errors: [] };
}

async function collectCustomizationData(formData: FormData, product: any, cartId: string) {
  const data: Record<string, any> = {};
  if (product.product_type !== 'customized') return data;
  for (const field of product.product_customization_fields || []) {
    const key = `custom_${field.id}`;
    const value = formData.get(key);
    if (field.field_type === 'file') {
      const file = value instanceof File ? value : null;
      if (field.is_required && (!file || file.size === 0)) throw new Error(`${field.label} is required.`);
      if (file && file.size > 0) data[field.id] = { pending: true, label: field.label };
    } else {
      const text = String(value || '').trim();
      if (field.is_required && !text) throw new Error(`${field.label} is required.`);
      if (text) data[field.id] = { label: field.label, value: text };
    }
  }
  return data;
}

async function uploadCustomizationFiles(formData: FormData, product: any, cartItemId: string, current: Record<string, any>) {
  const fields = (product.product_customization_fields || []).filter((field: any) => field.field_type === 'file');
  if (!fields.length) return current;
  const service = createServiceRoleClient();
  const { user, sessionId } = await getCartOwner();
  const owner = user?.id || sessionId || 'guest';
  const next = { ...current };
  for (const field of fields) {
    const file = formData.get(`custom_${field.id}`);
    if (!(file instanceof File) || file.size === 0) continue;
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) throw new Error('Customization files must be JPG, PNG, WEBP, or PDF.');
    if (file.size > 5 * 1024 * 1024) throw new Error('Customization files must be under 5 MB.');
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
    const path = `${owner}/${cartItemId}/${Date.now()}-${safeName}`;
    const { error } = await service.storage.from('custom-order-files').upload(path, file, { upsert: false, contentType: file.type });
    if (error) throw new Error(error.message);
    next[field.id] = { label: field.label, path, name: file.name, type: file.type, size: file.size };
  }
  return next;
}

function customizationAdjustment(product: any, data: Record<string, any>) {
  return (product.product_customization_fields || []).reduce((sum: number, field: any) => sum + (data[field.id] ? Number(field.price_adjustment || 0) : 0), 0);
}
