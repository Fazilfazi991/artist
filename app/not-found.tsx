import Link from "next/link";
export default function NotFound() { return <main className="mx-auto max-w-3xl px-4 py-20 text-center"><h1 className="font-serif text-5xl">Page not found</h1><p className="mt-4 text-muted">This marketplace route is not available yet.</p><Link href="/" className="mt-6 inline-block rounded-lg bg-rust px-5 py-3 font-black text-white">Go home</Link></main>; }
