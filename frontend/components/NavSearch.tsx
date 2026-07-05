"use client";

import { useState, useEffect, useRef } from "react";
import { searchItems } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function NavSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const router = useRouter();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }
        const timeout = setTimeout(async () => {
            try {
                const items = await searchItems(query);
                setResults(items.slice(0, 6));
            } catch {
                setResults([]);
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [query]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setResults([]);
                setQuery("");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleSelect(itemId: number) {
        setResults([]);
        setQuery("");
        router.push(`/items/${itemId}`);
    }

    return (
        <div ref={ref} className="relative">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search items..."
                className="bg-gray-800 border border-gray-700 rounded-full px-4 py-1.5 text-white text-sm focus:outline-none focus:border-yellow-400 w-48"
            />
            {results.length > 0 && (
                <div className="absolute right-0 top-9 z-50 w-64 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                    {results.map((item: any) => (
                        <button
                            key={item.id}
                            onClick={() => handleSelect(item.id)}
                            className="w-full text-left px-4 py-2.5 text-white hover:bg-gray-800 transition-colors text-sm border-b border-gray-800 last:border-0"
                        >
                            {item.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}