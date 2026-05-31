'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { addItemToCart, removeCartItem, updateCartItemQuantity } from '@/lib/services/cart';

function go(path: string, message?: string) {
  redirect(message ? `${path}?error=${encodeURIComponent(message)}` : path);
}

export async function addToCartAction(formData: FormData) {
  const next = String(formData.get('next') || '/cart');
  try {
    await addItemToCart(formData);
  } catch (error: any) {
    go(next, error.message || 'Could not add this product to cart.');
  }
  revalidatePath('/cart');
  redirect('/cart?added=1');
}

export async function updateCartQuantityAction(formData: FormData) {
  try {
    await updateCartItemQuantity(String(formData.get('item_id') || ''), Number(formData.get('quantity') || 1));
  } catch (error: any) {
    go('/cart', error.message || 'Could not update quantity.');
  }
  revalidatePath('/cart');
  redirect('/cart');
}

export async function removeCartItemAction(formData: FormData) {
  try {
    await removeCartItem(String(formData.get('item_id') || ''));
  } catch (error: any) {
    go('/cart', error.message || 'Could not remove item.');
  }
  revalidatePath('/cart');
  redirect('/cart');
}
