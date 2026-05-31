import type { Metadata } from "next";
import "./globals.css";
import { Footer, Header } from "@/components/ui";

export const metadata: Metadata = {
  title: "Artisan Marketplace",
  description: "Curated Indian handmade marketplace MVP"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
