import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link'; // Next.js fast-linking engine
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TAKSHA P2P Portal',
  description: 'Engineering and Physics Peer-to-Peer Learning Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-slate-950">
      <body className={`${inter.className} antialiased selection:bg-violet-500/30`}>

        {/* Global Dark-Mode Header Navbar */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

            {/* Branding Logo */}
            <Link href="/search" className="flex items-center space-x-2 group">
              <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 group-hover:from-violet-300 group-hover:to-cyan-300 transition">
                TAKSHA
              </span>
              <span className="bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">
                v2.0
              </span>
            </Link>

            {/* Navigation Menu Links */}
            <nav className="flex items-center space-x-1 md:space-x-4">
              <Link
                href="/search"
                className="text-xs md:text-sm font-medium text-slate-400 hover:text-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-900/60 transition"
              >
                🔍 Search Lectures
              </Link>
              <Link
                href="/forum"
                className="text-xs md:text-sm font-medium text-slate-400 hover:text-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-900/60 transition"
              >
                💬 P2P Forum
              </Link>
              <Link
                href="/profile"
                className="text-xs md:text-sm font-semibold text-violet-400 hover:text-violet-300 border border-violet-900/40 hover:border-violet-700 bg-violet-950/20 px-3.5 py-1.5 rounded-lg transition shadow-sm"
              >
                👤 Profile Card
              </Link>
            </nav>

          </div>
        </header>

        {/* Core Page Component Injections */}
        <main>
          {children}
        </main>

      </body>
    </html>
  );
}