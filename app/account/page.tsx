import { ProtectedShell } from "@/components/protected-shell";
import Link from "next/link";
export default function AccountPage() { return <ProtectedShell role="Buyer"><div className="grid gap-4 rounded-lg border border-line bg-white p-6"><h2 className="font-black">Buyer account</h2><p className="text-muted">Track seller-specific orders and checkout status.</p><Link href="/account/orders" className="w-fit rounded-lg bg-rust px-5 py-3 font-black text-white">View orders</Link></div></ProtectedShell>; }
