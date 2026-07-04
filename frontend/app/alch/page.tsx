"use client";

import { useState, useEffect } from "react";
import { searchItems, getAlchProfit } from "@/lib/api";

export default function AlchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [alchData, setAlchData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }
        const timeout = setTimeout(async () => {
            setLoading(true);
            try {
                const items = await searchItems(query);
                setResults(items.slice(0, 8));
            } catch {
                setResults([]);
            }
            setLoading(false);
        }, 300);

        return () => clearTimeout(timeout);
    }, [query]);

    async function handleSelectItem(itemId: number) {
        setLoading(true);
        setResults([]);
        setQuery("");
        try {
            const data = await getAlchProfit(itemId);
            setAlchData(data);
        } catch {
            setAlchData(null);
        }
        setLoading(false);
    }

    return (
        <main className="min-h-screen p-8 max-w-[1400px] mx-auto">
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">Alch Profit</h1>
            <p className="text-gray-400 mb-8">Search for an item to calculate high alch profit</p>

            <div className="relative w-80 mb-8">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setAlchData(null);
                    }}
                    placeholder="Search for an item..."
                    className="bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white w-full focus:outline-none focus:border-yellow-400"
                />
                {loading && (
                    <span className="absolute right-3 top-2.5 text-gray-400 text-sm">...</span>
                )}
                {results.length > 0 && (
                    <div className="absolute z-10 w-full bg-gray-900 border border-gray-700 rounded mt-1">
                        {results.map((item: any) => (
                            <button
                                key={item.id}
                                onClick={() => handleSelectItem(item.id)}
                                className="w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition-colors border-b border-gray-700 last:border-0"
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {alchData && (
                <div className="bg-gray-900 border border-gray-700 rounded p-6 w-96">
                    <h2 className="text-xl font-semibold text-yellow-300 mb-4">{alchData.name}</h2>
                    <div className="flex flex-col gap-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-400">High alch value</span>
                            <span className="text-white">{alchData.highalch?.toLocaleString()}gp</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Buy price</span>
                            <span className="text-white">{alchData.buy_price?.toLocaleString()}gp</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Nature rune</span>
                            <span className="text-white">{alchData.nature_rune_cost?.toLocaleString()}gp</span>
                        </div>
                        <div className="border-t border-gray-700 pt-3 flex justify-between font-semibold">
                            <span className="text-gray-400">Profit per alch</span>
                            <span className={alchData.profitable ? "text-green-300" : "text-red-400"}>
                                {alchData.alch_profit?.toLocaleString()}gp
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Profitable</span>
                            <span className={alchData.profitable ? "text-green-300" : "text-red-400"}>
                                {alchData.profitable ? "Yes" : "No"}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}