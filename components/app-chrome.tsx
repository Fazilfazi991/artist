"use client";

import { usePathname } from "next/navigation";
import { Footer, Header } from "@/components/ui";

export function AppChrome({ isSeller, children }: { isSeller: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const dashboardChrome = pathname.startsWith("/seller") || pathname.startsWith("/admin") || pathname.startsWith("/artisan/");
  if (dashboardChrome) return <>{children}</>;
  return <>
    <Header isSeller={isSeller} />
    {children}
    <Footer isSeller={isSeller} />
  </>;
}
