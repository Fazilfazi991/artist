import type { Metadata } from "next";
import "./globals.css";
import { AppChrome } from "@/components/app-chrome";
import { createClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Heritage Guild",
  description: "Modern Indian craftsmanship marketplace"
};

async function getIsSellerSession() {
  if (!hasSupabaseServerEnv()) return false;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.from("seller_profiles").select("id").eq("user_id", user.id).eq("status", "approved").maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const isSeller = await getIsSellerSession();
  return (
    <html lang="en">
      <body className="font-sans">
        <AppChrome isSeller={isSeller}>{children}</AppChrome>
      </body>
    </html>
  );
}
