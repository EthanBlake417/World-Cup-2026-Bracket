import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "World Cup 2026 Bracket",
  description: "Pick the knockout bracket and compete with friends.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="bg-pitch text-white shadow">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="text-xl">⚽</span>
              <span>World Cup 2026 Bracket</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <Link href="/leaderboard" className="hover:underline">
                Leaderboard
              </Link>
              <Link
                href="/bracket/new"
                className="rounded bg-white px-3 py-1.5 font-semibold text-pitch hover:bg-emerald-50"
              >
                Create bracket
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-slate-400">
          Share the link with friends — no sign-up needed.
        </footer>
      </body>
    </html>
  );
}
