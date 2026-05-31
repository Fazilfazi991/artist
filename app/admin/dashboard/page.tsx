import Link from 'next/link';
import { ProtectedShell } from '@/components/protected-shell';

export default function AdminDashboardPage() {
  return (
    <ProtectedShell role="Admin">
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/sellers" className="rounded-lg border border-line bg-white p-6 transition hover:border-rust">
          <p className="text-sm font-bold text-muted">Seller review</p>
          <h2 className="mt-2 font-serif text-2xl">Seller applications</h2>
          <p className="mt-2 text-sm text-muted">Review, approve, reject, or suspend artisan storefront applications.</p>
        </Link>
        <Link href="/admin/products" className="rounded-lg border border-line bg-white p-6 transition hover:border-rust">
          <p className="text-sm font-bold text-muted">Product moderation</p>
          <h2 className="mt-2 font-serif text-2xl">Product queue</h2>
          <p className="mt-2 text-sm text-muted">Approve, reject, hide, or archive seller product submissions.</p>
        </Link>
        <div className="rounded-lg border border-line bg-white p-6 opacity-70">
          <p className="text-sm font-bold text-muted">Operations</p>
          <h2 className="mt-2 font-serif text-2xl">Marketplace controls</h2>
          <p className="mt-2 text-sm text-muted">Orders, disputes, and commissions arrive in later sprints.</p>
        </div>
      </div>
    </ProtectedShell>
  );
}