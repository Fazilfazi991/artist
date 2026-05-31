import { ProtectedShell } from "@/components/protected-shell";
export default function SellerOnboardingPage() { return <ProtectedShell role="Seller"><div className="grid gap-3 md:grid-cols-5">{["Account", "Store", "Capability", "Documents", "Submit"].map((step) => <div key={step} className="rounded-lg border border-line bg-white p-5 font-black">{step}</div>)}</div></ProtectedShell>; }
