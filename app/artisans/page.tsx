import { ArtisanCards, SectionHeading } from "@/components/ui";
import { getApprovedArtisans } from "@/lib/services/public-marketplace";
export default async function ArtisansPage() { const artisans = await getApprovedArtisans(); return <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><SectionHeading eyebrow="Artisans" title="Approved storefronts" copy="Every seller has a shareable public catalog link for Instagram, WhatsApp, exhibitions, and repeat customers." /><ArtisanCards items={artisans} /></main>; }
