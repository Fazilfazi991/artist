import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types/database.types';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return data;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireRole(role: UserRole) {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== role && profile.role !== 'admin')) redirect('/');
  return profile;
}

export async function requireAdmin() {
  return requireRole('admin');
}

export async function requireApprovedSeller() {
  const user = await requireAuth();
  const supabase = await createClient();
  const { data } = await supabase.from('seller_profiles').select('*').eq('user_id', user.id).eq('status', 'approved').single();
  if (!data) redirect('/seller/onboarding');
  return data;
}

export async function registerBuyer(email: string, password: string, fullName: string) {
  const supabase = await createClient();
  return supabase.auth.signUp({ email, password, options: { data: { full_name: fullName }, emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` } });
}

export async function login(email: string, password: string) {
  const supabase = await createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function logout() {
  const supabase = await createClient();
  return supabase.auth.signOut();
}
