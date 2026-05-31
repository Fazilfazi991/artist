import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function getRedirectOrigin(requestUrl: URL) {
  return (process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin).replace(/\/$/, '');
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/account';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, getRedirectOrigin(requestUrl)));
  }

  return NextResponse.redirect(new URL(next.startsWith('/') ? next : '/account', getRedirectOrigin(requestUrl)));
}