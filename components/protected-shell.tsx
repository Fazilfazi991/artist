import Link from "next/link";

export function ProtectedShell({ role, children }: { role: "Buyer" | "Seller" | "Admin"; children: React.ReactNode }) {
  return <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="mb-8 rounded-lg border border-line bg-white p-5"><p className="text-xs font-black uppercase tracking-[.12em] text-rust">{role} workspace</p><h1 className="mt-2 font-serif text-4xl">Operations dashboard</h1><p className="mt-3 text-muted">Use the tools below to manage marketplace workflows.</p><Link href="/" className="mt-4 inline-block font-black text-teal">Back to marketplace</Link></div>{children}</main>;
}
