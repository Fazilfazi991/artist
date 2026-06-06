"use client";

import { usePathname } from "next/navigation";
import { Footer, Header } from "@/components/ui";

export function AppChrome({ isSeller, accountKind, children }: { isSeller: boolean; accountKind: "guest" | "buyer" | "seller"; children: React.ReactNode }) {
  const pathname = usePathname();
  const dashboardChrome = pathname.startsWith("/seller") || pathname.startsWith("/admin") || pathname.startsWith("/artisan/");
  if (dashboardChrome) return <>{children}</>;
  return <>
    <Header isSeller={isSeller} accountKind={accountKind} />
    {children}
    <Footer isSeller={isSeller} />
  </>;
}
