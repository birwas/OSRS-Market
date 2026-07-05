import { getTopMargins } from "@/lib/api";
import Link from "next/link";

export default async function MarginsPage() {
    const margins = await getTopMargins(20);

    return (
        <main className="p-8 max-w-[1400px] mx-auto">
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">Top Margins</h1>
            <p className="text-gray-400 mb-8">Highest flipping margins on the Grand Exchange</p>

            <div className="overflow-x-auto max-w-full">
                <table className="min-w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-b border-gray-700 text-gray-400 text-left">
                            <th className="py-3 pr-6">Item</th>
                            <th className="py-3 pr-6">Buy (Low)</th>
                            <th className="py-3 pr-6">Sell (High)</th>
                            <th className="py-3 pr-6">Margin</th>
                            <th className="py-3 pr-6">Buy Limit</th>
                            <th className="py-3 pr-6">Max Profit</th>
                            <th className="py-3">Volume</th>
                        </tr>
                    </thead>
                    <tbody>
                        {margins.map((item: any, index: number) => (
                            <tr
                                key={index}
                                className="border-b border-gray-800 hover:bg-gray-900 transition-colors"
                            >
                                <td className="py-3 pr-6 font-medium text-yellow-300 hover:text-yellow-400">
                                    <Link href={`/items/${item.id}`}>{item.name}</Link>
                                </td>
                                <td className="py-3 pr-6 text-white">{item.low?.toLocaleString()}gp</td>
                                <td className="py-3 pr-6 text-white">{item.high?.toLocaleString()}gp</td>
                                <td className="py-3 pr-6 text-green-400">{item.margin?.toLocaleString()}gp</td>
                                <td className="py-3 pr-6 text-gray-300">{item.buy_limit?.toLocaleString() ?? "—"}</td>
                                <td className="py-3 pr-6 text-green-300 font-semibold">
                                    {item.max_profit ? item.max_profit.toLocaleString() + "gp" : "—"}
                                </td>
                                <td className="py-3 text-gray-300">
                                    {item.volume?.toLocaleString() ?? "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}