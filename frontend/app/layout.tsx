import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
    title: "OSRS Market Tracker",
    description: "Live Grand Exchange flipping data",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-gray-950 min-h-screen text-white">
                <nav className="bg-gray-900 border-b border-gray-800 px-8 h-14 flex items-center justify-between">
                    <span className="text-yellow-400 font-semibold text-lg">⚔ OSRS Market</span>
                    <div className="flex gap-8">
                        <Link href="/" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                            Top Margins
                        </Link>
                        <Link href="/movers" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                            Top Movers
                        </Link>
                        <Link href="/alch" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                            Alch Profit
                        </Link>
                    </div>
                </nav>
                {children}
            </body>
        </html>
    );
}