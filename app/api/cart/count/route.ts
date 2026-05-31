import { NextResponse } from 'next/server';
import { getCartCount } from '@/lib/services/cart';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ count: await getCartCount() });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
