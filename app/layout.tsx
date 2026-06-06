import type { Metadata } from "next";
import "./globals.css";
import { AppChrome } from "@/components/app-chrome";
import { createClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Heritage Guild",
  description: "Modern Indian craftsmanship marketplace"
};

async function getSessionChrome() {
  if (!hasSupabaseServerEnv()) return { isSeller: false, accountKind: "guest" as const };
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { isSeller: false, accountKind: "guest" as const };
    const [{ data: profile }, { data: seller }] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
      supabase.from("seller_profiles").select("id,status").eq("user_id", user.id).maybeSingle()
    ]);
    const isSeller = seller?.status === "approved" || profile?.role === "seller";
    return { isSeller, accountKind: isSeller ? "seller" as const : "buyer" as const };
  } catch {
    return { isSeller: false, accountKind: "guest" as const };
  }
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isSeller, accountKind } = await getSessionChrome();
  return (
    <html lang="en">
      <body className="font-sans">
        <AppChrome isSeller={isSeller} accountKind={accountKind}>{children}</AppChrome>
      </body>
    </html>
  );
}
