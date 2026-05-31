'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const imageTypes = ['image/jpeg','image/png','image/webp'];
const documentTypes = ['application/pdf','image/jpeg','image/png'];
function text(formData: FormData, key: string) { return String(formData.get(key) || '').trim(); }
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
async function userOrRedirect() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/login?next=/seller/onboarding'); return { supabase, user }; }
function validFile(file: File, types: string[], maxMb: number) { return file && file.size > 0 && types.includes(file.type) && file.size <= maxMb * 1024 * 1024; }

export async function saveSellerApplication(formData: FormData) {
  const { supabase, user } = await userOrRedirect();
  const storeName = text(formData, 'storeName');
  const storeSlug = slugify(text(formData, 'storeSlug') || storeName);
  if (!storeName || !storeSlug) redirect('/seller/onboarding?error=Store name and slug are required');
  const payload: Record<string, unknown> = {
    user_id: user.id,
    store_name: storeName,
    store_slug: storeSlug,
    short_bio: text(formData, 'shortBio'),
    full_story: text(formData, 'fullStory'),
    city: text(formData, 'city'),
    state: text(formData, 'state'),
    instagram_url: text(formData, 'instagramUrl') || null,
    whatsapp_number: text(formData, 'whatsappNumber'),
    years_experience: Number(text(formData, 'yearsExperience') || 0),
    average_production_days: Number(text(formData, 'productionDays') || 7),
    shipping_regions: text(formData, 'shippingRegions').split(',').map((item) => item.trim()).filter(Boolean),
    supports_ready_to_ship: formData.get('readyToShip') === 'on',
    supports_customized: formData.get('customized') === 'on',
    supports_bespoke: formData.get('bespoke') === 'on',
    status: text(formData, 'intent') === 'submit' ? 'submitted' : 'draft'
  };
  const categoryId = text(formData, 'primaryCategoryId');
  if (categoryId) payload.primary_category_id = categoryId;
  const { data: existing } = await supabase.from('seller_profiles').select('id,status').eq('user_id', user.id).maybeSingle();
  if (existing?.status && !['draft','rejected'].includes(existing.status) && text(formData, 'intent') !== 'submit') redirect('/seller/onboarding?error=Submitted applications are read-only');
  const query = existing ? supabase.from('seller_profiles').update(payload).eq('id', existing.id) : supabase.from('seller_profiles').insert(payload);
  const { data: seller, error } = await query.select('*').single();
  if (error) redirect(`/seller/onboarding?error=${encodeURIComponent(error.message)}`);
  for (const [field, column, bucket, maxMb] of [
    ['profileImage', 'profile_image_url', 'avatars', 5],
    ['coverImage', 'cover_image_url', 'seller-covers', 10]
  ] as const) {
    const file = formData.get(field) as File | null;
    if (file && file.size > 0) {
      if (!validFile(file, imageTypes, maxMb)) redirect('/seller/onboarding?error=Images must be JPG, PNG, or WebP and within the upload limit');
      const storagePath = `${seller.id}/${field}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-')}`;
      const upload = await supabase.storage.from(bucket).upload(storagePath, file, { upsert: true });
      if (upload.error) redirect(`/seller/onboarding?error=${encodeURIComponent(upload.error.message)}`);
      const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(storagePath);
      const update = await supabase.from('seller_profiles').update({ [column]: publicUrl.publicUrl }).eq('id', seller.id);
      if (update.error) redirect(`/seller/onboarding?error=${encodeURIComponent(update.error.message)}`);
    }
  }

  for (const [field, docType] of [['identityDocument','identity'], ['addressProof','address_proof'], ['panDocument','pan'], ['gstDocument','gst'], ['bankProof','bank_proof']] as const) {
    const file = formData.get(field) as File | null;
    if (file && file.size > 0) {
      if (!validFile(file, documentTypes, 5)) redirect('/seller/onboarding?error=Documents must be PDF, JPG, or PNG and under 5 MB');
      const storagePath = `${seller.id}/${docType}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-')}`;
      const upload = await supabase.storage.from('seller-documents').upload(storagePath, file, { upsert: true });
      if (upload.error) redirect(`/seller/onboarding?error=${encodeURIComponent(upload.error.message)}`);
      await supabase.from('seller_documents').delete().eq('seller_id', seller.id).eq('document_type', docType);
      const documentInsert = await supabase.from('seller_documents').insert({ seller_id: seller.id, document_type: docType, storage_path: storagePath });
      if (documentInsert.error) redirect(`/seller/onboarding?error=${encodeURIComponent(documentInsert.error.message)}`);
    }
  }
  revalidatePath('/seller/onboarding');
  redirect(text(formData, 'intent') === 'submit' ? '/seller/onboarding?submitted=1' : '/seller/onboarding?saved=1');
}
