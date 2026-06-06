import Link from "next/link";
import { MailCheck } from "lucide-react";
import { resendConfirmationAction } from "@/app/auth/actions";
import { SectionHeading } from "@/components/ui";

export default async function AuthConfirmPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const params = await searchParams;
  const email = params.email || "";
  const type = params.type === "seller" ? "seller" : "buyer";
  return <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
    <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-soft">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rust-soft text-rust"><MailCheck size={24} /></div>
      <SectionHeading eyebrow="Email confirmation" title="Please check your inbox" copy={type === "seller" ? "Confirm your email to continue seller onboarding." : "Confirm your email to start shopping, saving favourites, and tracking orders."} />
      {params.resent ? <p className="mb-4 rounded-lg border border-success/30 bg-sage/10 p-3 text-sm font-bold text-success">Confirmation email sent again.</p> : null}
      {params.error ? <p className="mb-4 rounded-lg border border-rust/30 bg-rust/10 p-3 text-sm font-bold text-rust">{params.error}</p> : null}
      <form action={resendConfirmationAction} className="mx-auto mt-5 grid max-w-md gap-3 text-left">
        <input type="hidden" name="type" value={type} />
        <input name="email" defaultValue={email} className="min-h-12 rounded-lg border border-line px-4 outline-none focus:border-rust" placeholder="Email address" type="email" required />
        <button className="rounded-lg bg-rust px-5 py-3 font-black text-white">Resend confirmation email</button>
      </form>
      <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-bold">
        <Link href="/login" className="text-rust">Back to login</Link>
        <Link href={type === "seller" ? "/seller/register" : "/register"} className="text-muted">Edit registration details</Link>
      </div>
    </div>
  </main>;
}
