'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { mergeGuestCartIntoUserCart } from '@/lib/services/cart';

function requireString(formData: FormData, key: string) { return String(formData.get(key) || '').trim(); }
function fail(path: string, message: string) { redirect(`${path}?error=${encodeURIComponent(message)}`); }
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
function sellerSlug(value: string, userId: string) { return `${slugify(value) || 'seller'}-${userId.slice(0, 8)}`; }

async function getRequestOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  const headerStore = await headers();
  const host = headerStore.get('x-forwarded-host') || headerStore.get('host');
  if (!host) return 'http://127.0.0.1:3001';
  const forwardedProto = headerStore.get('x-forwarded-proto');
  const protocol = forwardedProto || (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
  return `${protocol}://${host}`;
}

export async function registerAction(formData: FormData) {
  const accountType = requireString(formData, 'accountType') === 'seller' ? 'seller' : 'buyer';
  const failPath = accountType === 'seller' ? '/seller/register' : '/register';
  const fullName = requireString(formData, 'fullName');
  const email = requireString(formData, 'email');
  const countryCode = requireString(formData, 'phoneCountryCode') || '+91';
  const phoneLocal = requireString(formData, 'phoneLocal');
  const phone = requireString(formData, 'phone') || `${countryCode} ${phoneLocal}`.trim();
  const password = requireString(formData, 'password');
  const confirm = requireString(formData, 'confirmPassword');
  const acceptedTerms = formData.get('terms') === 'on';
  const businessName = requireString(formData, 'businessName');
  const country = requireString(formData, 'country');
  const businessCategory = requireString(formData, 'businessCategory');
  const businessDescription = requireString(formData, 'businessDescription');
  if (!fullName || !email || !phoneLocal || !password) fail(failPath, 'Please complete all required fields.');
  if (accountType === 'seller' && (!businessName || !country || !businessCategory || !businessDescription)) fail(failPath, 'Please complete the seller business details.');
  if (!acceptedTerms) fail(failPath, 'Please accept the terms and conditions.');
  if (!/^\S+@\S+\.\S+$/.test(email)) fail(failPath, 'Enter a valid email address.');
  if (password.length < 8) fail(failPath, 'Password must be at least 8 characters.');
  if (password !== confirm) fail(failPath, 'Passwords do not match.');
  const supabase = await createClient();
  const siteOrigin = await getRequestOrigin();
  const next = accountType === 'seller' ? '/seller/onboarding' : '/account';
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone, account_type: accountType, business_name: businessName, business_description: businessDescription, country, business_category: businessCategory },
      emailRedirectTo: `${siteOrigin}/auth/callback?next=${encodeURIComponent(next)}`
    }
  });
  if (error) fail(failPath, error.message);
  if (data.user) {
    const profilePatch = { phone, full_name: fullName, role: accountType };
    if (accountType === 'seller') {
      try {
        const admin = createServiceRoleClient();
        await admin.from('profiles').update(profilePatch).eq('id', data.user.id);
        await admin.from('seller_profiles').upsert({
          user_id: data.user.id,
          store_name: businessName,
          store_slug: sellerSlug(businessName || fullName, data.user.id),
          short_bio: businessDescription,
          shipping_regions: [country],
          status: 'draft'
        }, { onConflict: 'user_id' });
      } catch (error) {
        console.error('seller draft creation failed', error);
      }
    } else {
      await supabase.from('profiles').update(profilePatch).eq('id', data.user.id);
    }
    if (accountType === 'seller' && data.session) {
      await supabase.from('seller_profiles').upsert({
        user_id: data.user.id,
        store_name: businessName,
        store_slug: sellerSlug(businessName || fullName, data.user.id),
        short_bio: businessDescription,
        shipping_regions: [country],
        status: 'draft'
      }, { onConflict: 'user_id' });
    }
  }
  if (!data.session) redirect(`/auth/confirm?email=${encodeURIComponent(email)}&type=${accountType}`);
  redirect(next);
}

export async function resendConfirmationAction(formData: FormData) {
  const email = requireString(formData, 'email');
  const accountType = requireString(formData, 'type') === 'seller' ? 'seller' : 'buyer';
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) fail('/auth/confirm', 'Enter a valid email address.');
  const supabase = await createClient();
  const siteOrigin = await getRequestOrigin();
  const next = accountType === 'seller' ? '/seller/onboarding' : '/account';
  const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: `${siteOrigin}/auth/callback?next=${encodeURIComponent(next)}` } });
  if (error) fail(`/auth/confirm?email=${encodeURIComponent(email)}&type=${accountType}`, error.message);
  redirect(`/auth/confirm?email=${encodeURIComponent(email)}&type=${accountType}&resent=1`);
}

export async function loginAction(formData: FormData) {
  const email = requireString(formData, 'email');
  const password = requireString(formData, 'password');
  const next = requireString(formData, 'next') || '/account';
  if (!email || !password) fail('/login', 'Enter email and password.');
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) fail('/login', error.message);
  if (data.user) await mergeGuestCartIntoUserCart(data.user.id);
  if (!formData.get('next')) {
    const [{ data: profile }, { data: seller }] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle(),
      supabase.from('seller_profiles').select('id,status').eq('user_id', data.user.id).maybeSingle()
    ]);
    if (profile?.role === 'admin') redirect('/admin/dashboard');
    if (seller?.status === 'approved') redirect('/seller/dashboard');
    if (seller && seller.status !== 'approved') redirect('/seller/onboarding');
  }
  redirect(next.startsWith('/') ? next : '/account');
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
