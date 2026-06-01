import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AccountEmptyState, AccountShell } from '@/components/account-shell';
import { requireAuth } from '@/lib/services/auth';
import { getBuyerWishlist } from '@/lib/services/account';

export const dynamic = 'force-dynamic';

function money(value: number | null) { return value == null ? 'Quote required' : `Rs. ${Number(value).toLocaleString('en-IN')}`; }

export default async function WishlistPage() {
  const user = await requireAuth();
  if (!user) redirect('/login?next=/account/wishlist');
  const wishlist = await getBuyerWishlist(user.id);
  const items = wishlist?.wishlist_items || [];
  return <AccountShell title="Wishlist" copy="Saved handmade pieces you love, ready when you want to return.">{items.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((item: any) => <Link key={item.id} href={`/product/${item.products?.slug}`} className="rounded-xl border border-line bg-white p-4"><img src={item.products?.product_images?.[0]?.image_url || '/artisan-hero.png'} alt="" className="aspect-[4/3] w-full rounded-lg object-cover"/><h2 className="mt-3 font-black">{item.products?.name}</h2><p className="mt-1 text-sm text-muted">{item.products?.seller_profiles?.store_name}</p><p className="mt-2 font-black">{money(item.products?.base_price)}</p></Link>)}</div> : <AccountEmptyState title="Save handmade pieces you love and return to them anytime." copy="Wishlist persistence is ready through the existing wishlist tables; product save/remove controls can be expanded in a later polish pass." href="/shop" cta="Explore Products" />}</AccountShell>;
}
