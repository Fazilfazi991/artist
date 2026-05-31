import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getStoreSlugFromHostname } from '@/lib/storefront/get-store-slug';

const roleRoutes = [
  { prefix: '/admin', role: 'admin' },
  { prefix: '/seller', role: 'seller' },
  { prefix: '/account', role: 'buyer' }
] as const;

function hasSupabaseMiddlewareEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  try {
    new URL(url);
    return key.length > 20;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const matchedRoute = roleRoutes.find((route) => request.nextUrl.pathname.startsWith(route.prefix));
  if (!matchedRoute || !hasSupabaseMiddlewareEnv()) return response;

  try {
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('next', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (request.nextUrl.pathname.startsWith('/seller/onboarding') || request.nextUrl.pathname.startsWith('/seller/dashboard')) return response;

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const role = profile?.role;
    const allowed = role === 'admin' || role === matchedRoute.role || (matchedRoute.role === 'buyer' && role === 'seller');
    if (!allowed) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = '/';
      homeUrl.search = '';
      return NextResponse.redirect(homeUrl);
    }
  } catch (error) {
    console.error('middleware auth check failed', error);
    return response;
  }

  return response;
}

export const config = { matcher: ['/account/:path*', '/seller/:path*', '/admin/:path*'] };