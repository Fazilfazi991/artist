import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AccountEmptyState, AccountShell } from '@/components/account-shell';
import { requireAuth } from '@/lib/services/auth';
import { getBuyerNotifications } from '@/lib/services/account';
import { markNotificationReadAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const user = await requireAuth();
  if (!user) redirect('/login?next=/account/notifications');
  const notifications = await getBuyerNotifications(user.id);
  return <AccountShell title="Notifications" copy="Order updates, seller messages, and support notices appear here.">{notifications.length ? <div className="grid gap-3">{notifications.map((item: any) => <article key={item.id} className={`rounded-xl border border-line bg-white p-5 ${item.is_read ? 'opacity-75' : ''}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-black">{item.title}</h2><p className="mt-2 text-sm leading-6 text-muted">{item.message}</p><p className="mt-2 text-xs font-bold text-muted">{new Date(item.created_at).toLocaleString()}</p></div><div className="flex gap-2">{item.link ? <Link href={item.link} className="rounded-lg border border-line px-3 py-2 text-sm font-black">Open</Link> : null}{!item.is_read ? <form action={markNotificationReadAction}><input type="hidden" name="id" value={item.id}/><button className="rounded-lg border border-line px-3 py-2 text-sm font-black">Mark read</button></form> : null}</div></div></article>)}</div> : <AccountEmptyState title="No notifications yet" copy="Important order updates and support replies will appear here." href="/account" cta="Back to Account" />}</AccountShell>;
}
