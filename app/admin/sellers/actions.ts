'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/services/auth';

async function ensureStorefrontDefaults(supabase: any, seller: any) {
  await supabase.from('storefront_settings').upsert({
    seller_id: seller.id,
    template_key: 'warm-editorial',
    custom_subdomain: seller.store_slug,
    hero_title: seller.store_name,
    hero_subtitle: seller.short_bio,
    about_title: `About ${seller.store_name}`,
    about_content: seller.full_story || seller.short_bio,
    artisan_story: seller.full_story || seller.short_bio,
    craft_process_content: 'Each piece is shaped with careful materials, patient hands, and a small-batch process.',
    custom_order_cta_text: 'Request a custom piece',
    is_published: false
  }, { onConflict: 'seller_id', ignoreDuplicates: true });
  for (const item of [
    { name: 'Featured', slug: 'featured', description: 'Handpicked pieces from this storefront.', display_order: 0, is_featured: true },
    { name: 'New Arrivals', slug: 'new-arrivals', description: 'Fresh work recently added by the artisan.', display_order: 1, is_featured: false }
  ]) {
    await supabase.from('seller_collections').upsert({ seller_id: seller.id, ...item, is_active: true }, { onConflict: 'seller_id,slug', ignoreDuplicates: true });
  }
}

export async function markSellerUnderReview(formData: FormData) { await requireAdmin(); const id = String(formData.get('sellerId')); const supabase = createAdminClient(); await supabase.from('seller_profiles').update({ status: 'under_review' }).eq('id', id); revalidatePath('/admin/sellers'); revalidatePath(`/admin/sellers/${id}`); }
export async function approveSellerAction(formData: FormData) { const admin = await requireAdmin(); const id = String(formData.get('sellerId')); const supabase = createAdminClient(); const { data: seller } = await supabase.from('seller_profiles').update({ status: 'approved', reviewed_by: admin.id, reviewed_at: new Date().toISOString(), rejection_reason: null }).eq('id', id).select('*').single(); if (seller) { await supabase.from('profiles').update({ role: 'seller' }).eq('id', seller.user_id); await ensureStorefrontDefaults(supabase, seller); await supabase.from('notifications').insert({ user_id: seller.user_id, title: 'Seller application approved', message: 'Your artisan account is approved. Set up your storefront and add your first product.' }); } revalidatePath('/admin/sellers'); revalidatePath(`/admin/sellers/${id}`); }
export async function rejectSellerAction(formData: FormData) { const admin = await requireAdmin(); const id = String(formData.get('sellerId')); const reason = String(formData.get('reason') || '').trim(); if (!reason) redirect(`/admin/sellers/${id}?error=Rejection reason is required`); const supabase = createAdminClient(); const { data: seller } = await supabase.from('seller_profiles').update({ status: 'rejected', rejection_reason: reason, reviewed_by: admin.id, reviewed_at: new Date().toISOString() }).eq('id', id).select('*').single(); if (seller) await supabase.from('notifications').insert({ user_id: seller.user_id, title: 'Seller application needs updates', message: reason }); revalidatePath('/admin/sellers'); revalidatePath(`/admin/sellers/${id}`); }
export async function suspendSellerAction(formData: FormData) { const admin = await requireAdmin(); const id = String(formData.get('sellerId')); const reason = String(formData.get('reason') || 'Suspended by admin'); const supabase = createAdminClient(); await supabase.from('seller_profiles').update({ status: 'suspended', rejection_reason: reason, reviewed_by: admin.id, reviewed_at: new Date().toISOString() }).eq('id', id); revalidatePath('/admin/sellers'); revalidatePath(`/admin/sellers/${id}`); }