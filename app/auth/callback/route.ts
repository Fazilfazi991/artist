import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function getRedirectOrigin(requestUrl: URL) {
  return (process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin).replace(/\/$/, '');
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const oauthError = requestUrl.searchParams.get('error_description') || requestUrl.searchParams.get('error');
  const next = requestUrl.searchParams.get('next') ?? '/account';

  if (oauthError) {
    return NextResponse.redirect(new URL(`/auth/confirm?error=${encodeURIComponent(oauthError)}`, getRedirectOrigin(requestUrl)));
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL(`/auth/confirm?error=${encodeURIComponent(error.message)}`, getRedirectOrigin(requestUrl)));
  }

  return NextResponse.redirect(new URL(next.startsWith('/') ? next : '/account', getRedirectOrigin(requestUrl)));
}
