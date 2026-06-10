'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type ToggleWishlistInput = {
  productId?: string;
  productSlug?: string;
  next?: string;
};

type ToggleWishlistResult =
  | { ok: true; saved: boolean }
  | { ok: false; loginUrl?: string; message: string };

export async function toggleWishlistAction(input: ToggleWishlistInput): Promise<ToggleWishlistResult> {
  const next = input.next || '/shop';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, loginUrl: `/login?next=${encodeURIComponent(next)}`, message: 'Please log in to save wishlist items.' };
  }

  let productId = input.productId;
  if (!productId && input.productSlug) {
    const { data: product, error: productError } = await supabase.from('products').select('id').eq('slug', input.productSlug).maybeSingle();
    if (productError) return { ok: false, message: productError.message };
    productId = product?.id;
  }

  if (!productId) return { ok: false, message: 'Product could not be found.' };

  const { data: wishlist, error: wishlistError } = await supabase
    .from('wishlists')
    .upsert({ user_id: user.id }, { onConflict: 'user_id' })
    .select('id')
    .single();

  if (wishlistError) return { ok: false, message: wishlistError.message };

  const { data: existing, error: existingError } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('wishlist_id', wishlist.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (existingError) return { ok: false, message: existingError.message };

  if (existing) {
    const { error } = await supabase.from('wishlist_items').delete().eq('id', existing.id);
    if (error) return { ok: false, message: error.message };
    revalidatePath('/account');
    revalidatePath('/account/wishlist');
    return { ok: true, saved: false };
  }

  const { error } = await supabase.from('wishlist_items').insert({ wishlist_id: wishlist.id, product_id: productId });
  if (error) return { ok: false, message: error.message };

  revalidatePath('/account');
  revalidatePath('/account/wishlist');
  return { ok: true, saved: true };
}
