import Link from 'next/link';
import { logoutAction } from '@/app/auth/actions';

const accountLinks = [
  ['Overview', '/account'],
  ['Orders', '/account/orders'],
  ['Custom Orders', '/account/custom-orders'],
  ['Storefronts', '/account/storefronts'],
  ['Addresses', '/account/addresses'],
  ['Wishlist', '/account/wishlist'],
  ['Notifications', '/account/notifications'],
  ['Support', '/account/support'],
  ['Profile', '/account/profile']
] as const;

export function AccountShell({ title, copy, children }: { title: string; copy?: string; children: React.ReactNode }) {
  return <main className="heritage-container py-10"><section className="mb-8 border-b border-line pb-8"><p className="heritage-label">Buyer account</p><h1 className="mt-3 font-serif text-4xl font-semibold leading-tight sm:text-6xl">{title}</h1>{copy ? <p className="mt-4 max-w-3xl leading-8 text-muted">{copy}</p> : null}</section><div className="grid gap-6 lg:grid-cols-[260px_1fr]"><aside className="lg:sticky lg:top-28 lg:h-fit"><nav className="flex gap-2 overflow-x-auto border border-line bg-surface p-3 lg:grid lg:overflow-visible">{accountLinks.map(([label, href]) => <Link key={href} href={href} className="whitespace-nowrap rounded px-4 py-3 text-sm font-extrabold text-ink hover:bg-surface-low hover:text-rust">{label}</Link>)}<form action={logoutAction}><button className="w-full whitespace-nowrap rounded px-4 py-3 text-left text-sm font-extrabold text-rust hover:bg-rust-soft">Logout</button></form></nav></aside><section className="min-w-0">{children}</section></div></main>;
}

export function AccountEmptyState({ title, copy, href = '/shop', cta = 'Start Shopping' }: { title: string; copy: string; href?: string; cta?: string }) {
  return <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center"><h2 className="font-serif text-3xl font-semibold">{title}</h2><p className="mx-auto mt-3 max-w-xl leading-7 text-muted">{copy}</p><Link href={href} className="mt-6 inline-flex rounded bg-rust px-5 py-3 text-sm font-extrabold text-white">{cta}</Link></div>;
}
