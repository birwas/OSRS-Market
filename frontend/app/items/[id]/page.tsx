import { getItem, getItemLatestPrice, getAlchProfit } from "@/lib/api";
import Link from "next/link";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const itemId = parseInt(id);

    const [item, prices, alch] = await Promise.all([
        getItem(itemId),
        getItemLatestPrice(itemId).catch(() => []),
        getAlchProfit(itemId).catch(() => null),
    ]);

    const latest = prices[0] ?? null;
    const margin = latest ? latest.high - latest.low : null;
    const roi = margin && latest?.low ? ((margin / latest.low) * 100).toFixed(2) : null;

    return (
        <main className="p-8 max-w-3xl mx-auto">
            <Link href="/" className="text-gray-400 hover:text-yellow-400 text-sm mb-6 inline-block">
                ← Back to margins
            </Link>
            {item.icon && (
                <img
                    src={`https://oldschool.runescape.wiki/images/${item.icon.replace(/ /g, "_")}`}
                    alt={item.name}
                    className="w-16 h-16 object-contain mb-2"
                />
            )}
            <h1 className="text-3xl font-bold text-yellow-400 mb-1">{item.name}</h1>
            <p className="text-gray-400 text-sm mb-8">{item.examine}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">

                <div className="bg-gray-900 border border-gray-800 rounded p-4">
                    <p className="text-gray-400 text-xs mb-1">Instant buy (high)</p>
                    <p className="text-white font-semibold text-lg">
                        {latest?.high ? latest.high.toLocaleString() + " gp" : "—"}
                    </p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded p-4">
                    <p className="text-gray-400 text-xs mb-1">Instant sell (low)</p>
                    <p className="text-white font-semibold text-lg">
                        {latest?.low ? latest.low.toLocaleString() + " gp" : "—"}
                    </p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded p-4">
                    <p className="text-gray-400 text-xs mb-1">Margin</p>
                    <p className="text-green-300 font-semibold text-lg">
                        {margin ? margin.toLocaleString() + " gp" : "—"}
                    </p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded p-4">
                    <p className="text-gray-400 text-xs mb-1">ROI</p>
                    <p className="text-green-300 font-semibold text-lg">
                        {roi ? roi + "%" : "—"}
                    </p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded p-4">
                    <p className="text-gray-400 text-xs mb-1">Buy limit</p>
                    <p className="text-white font-semibold text-lg">
                        {item.buy_limit ? item.buy_limit.toLocaleString() : "—"}
                    </p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded p-4">
                    <p className="text-gray-400 text-xs mb-1">Members</p>
                    <p className="text-white font-semibold text-lg">
                        {item.members ? "Yes" : "No"}
                    </p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded p-4">
                    <p className="text-gray-400 text-xs mb-1">High alch</p>
                    <p className="text-white font-semibold text-lg">
                        {item.highalch ? item.highalch.toLocaleString() + " gp" : "—"}
                    </p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded p-4">
                    <p className="text-gray-400 text-xs mb-1">Low alch</p>
                    <p className="text-white font-semibold text-lg">
                        {item.lowalch ? item.lowalch.toLocaleString() + " gp" : "—"}
                    </p>
                </div>

                {alch && (
                    <div className="bg-gray-900 border border-gray-800 rounded p-4 col-span-2">
                        <p className="text-gray-400 text-xs mb-1">Alch profit</p>
                        <p className={`font-semibold text-lg ${alch.profitable ? "text-green-300" : "text-red-400"}`}>
                            {alch.alch_profit.toLocaleString()} gp
                        </p>
                    </div>
                )}

            </div>
        </main>
    );
}