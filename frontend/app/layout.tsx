import type { Metadata } from "next";
import Link from "next/link";
import NavSearch from "@/components/NavSearch";
import "./globals.css";

export const metadata: Metadata = {
    title: "OSRS Market Tracker",
    description: "Live Grand Exchange flipping data",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <nav className="bg-gray-900 border-b border-gray-800 px-6 h-14 flex items-center justify-between">
                    <Link href="/" className="text-yellow-400 font-semibold text-lg">⚔ OSRS Market</Link>
                    <NavSearch />
                    <div className="flex gap-4">
                        <Link href="/margins" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
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
                <div>
                    {children}
                </div>
            </body>
        </html>
    );
}