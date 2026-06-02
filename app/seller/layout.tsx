import { SellerWorkspace } from "@/components/seller/seller-workspace";
import { createClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

async function getSellerShellProfile() {
  if (!hasSupabaseServerEnv()) return null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from("seller_profiles").select("store_name,store_slug,profile_image_url,status").eq("user_id", user.id).eq("status", "approved").maybeSingle();
    if (!data) return null;
    return { storeName: data.store_name, storeSlug: data.store_slug, profileImageUrl: data.profile_image_url };
  } catch {
    return null;
  }
}

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const seller = await getSellerShellProfile();
  return <SellerWorkspace seller={seller}>{children}</SellerWorkspace>;
}
