import Link from 'next/link';
import { logoutAction } from '@/app/auth/actions';

const accountLinks = [
  ['Overview', '/account'],
  ['Orders', '/account/orders'],
  ['Addresses', '/account/addresses'],
  ['Wishlist', '/account/wishlist'],
  ['Notifications', '/account/notifications'],
  ['Support', '/account/support'],
  ['Profile', '/account/profile']
] as const;

export function AccountShell({ title, copy, children }: { title: string; copy?: string; children: React.ReactNode }) {
  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><section className="mb-6 flex flex-col justify-between gap-4 rounded-xl border border-line bg-white p-5 sm:p-6 lg:flex-row lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.12em] text-rust">Buyer account</p><h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">{title}</h1>{copy ? <p className="mt-3 max-w-3xl leading-7 text-muted">{copy}</p> : null}</div><Link href="/shop" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-rust px-5 py-3 font-black text-white">Continue Shopping</Link></section><div className="grid gap-5 lg:grid-cols-[240px_1fr]"><aside className="lg:sticky lg:top-28 lg:h-fit"><nav className="flex gap-2 overflow-x-auto rounded-xl border border-line bg-white p-3 lg:grid lg:overflow-visible">{accountLinks.map(([label, href]) => <Link key={href} href={href} className="whitespace-nowrap rounded-lg px-4 py-3 text-sm font-black text-ink hover:bg-paper hover:text-rust">{label}</Link>)}<form action={logoutAction}><button className="w-full whitespace-nowrap rounded-lg px-4 py-3 text-left text-sm font-black text-rust hover:bg-rust/10">Logout</button></form></nav></aside><section className="min-w-0">{children}</section></div></main>;
}

export function AccountEmptyState({ title, copy, href = '/shop', cta = 'Start Shopping' }: { title: string; copy: string; href?: string; cta?: string }) {
  return <div className="rounded-xl border border-dashed border-line bg-white p-8 text-center"><h2 className="font-serif text-3xl">{title}</h2><p className="mx-auto mt-2 max-w-xl text-muted">{copy}</p><Link href={href} className="mt-5 inline-flex rounded-lg bg-rust px-5 py-3 font-black text-white">{cta}</Link></div>;
}
