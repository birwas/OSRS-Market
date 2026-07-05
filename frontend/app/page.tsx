"use client";

import { useState, useEffect } from "react";
import { searchItems } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Home() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }
        const timeout = setTimeout(async () => {
            try {
                const items = await searchItems(query);
                setResults(items.slice(0, 8));
            } catch {
                setResults([]);
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [query]);

    function handleSelect(itemId: number) {
        router.push(`/items/${itemId}`);
    }

    return (
        <main className="flex flex-col items-center justify-center min-h-[80vh]">
            <h1 className="text-4xl font-bold text-yellow-400 mb-2">⚔ OSRS Market</h1>
            <p className="text-gray-400 mb-8 text-sm">Grand Exchange price tracker</p>

            <div className="relative w-full max-w-xl">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for an item..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-full px-6 py-3 text-white focus:outline-none focus:border-yellow-400 text-sm"
                    autoFocus
                />
                {results.length > 0 && (
                    <div className="absolute z-10 w-full bg-gray-900 border border-gray-700 rounded-2xl mt-2 overflow-hidden">
                        {results.map((item: any) => (
                            <button
                                key={item.id}
                                onClick={() => handleSelect(item.id)}
                                className="w-full text-left px-6 py-3 text-white hover:bg-gray-800 transition-colors text-sm border-b border-gray-800 last:border-0"
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
        </main>
    );
}