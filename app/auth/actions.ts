'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { mergeGuestCartIntoUserCart } from '@/lib/services/cart';

function requireString(formData: FormData, key: string) { return String(formData.get(key) || '').trim(); }
function fail(path: string, message: string) { redirect(`${path}?error=${encodeURIComponent(message)}`); }

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
  const fullName = requireString(formData, 'fullName');
  const email = requireString(formData, 'email');
  const phone = requireString(formData, 'phone');
  const password = requireString(formData, 'password');
  const confirm = requireString(formData, 'confirmPassword');
  if (!fullName || !email || !phone || !password) fail('/register', 'Please complete all required fields.');
  if (!/^\S+@\S+\.\S+$/.test(email)) fail('/register', 'Enter a valid email address.');
  if (password.length < 8) fail('/register', 'Password must be at least 8 characters.');
  if (password !== confirm) fail('/register', 'Passwords do not match.');
  const supabase = await createClient();
  const siteOrigin = await getRequestOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
      emailRedirectTo: `${siteOrigin}/auth/callback`
    }
  });
  if (error) fail('/register', error.message);
  if (data.user) await supabase.from('profiles').update({ phone, full_name: fullName }).eq('id', data.user.id);
  redirect('/account');
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
