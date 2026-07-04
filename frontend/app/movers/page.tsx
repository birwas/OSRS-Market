import { getTopMovers } from "@/lib/api";

export default async function MoversPage() {
    const movers = await getTopMovers(24);

    return (
        <main className="p-8 max-w-[1400px] mx-auto">
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">Top Movers</h1>
            <p className="text-gray-400 mb-8">Biggest price changes in the last 24 hours</p>

            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-b border-gray-700 text-gray-400 text-left">
                            <th className="py-3 pr-6">Item</th>
                            <th className="py-3 pr-6">Price 24h ago</th>
                            <th className="py-3 pr-6">Price now</th>
                            <th className="py-3">Change</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movers.map((item: any, index: number) => {
                            const isPositive = item.pct_change > 0;
                            return (
                                <tr
                                    key={index}
                                    className="border-b border-gray-800 hover:bg-gray-900 transition-colors"
                                >
                                    <td className="py-3 pr-6 font-medium text-yellow-300">{item.name}</td>
                                    <td className="py-3 pr-6 text-white">{item.price_then?.toLocaleString()}gp</td>
                                    <td className="py-3 pr-6 text-white">{item.price_now?.toLocaleString()}gp</td>
                                    <td className={`py-3 font-semibold ${isPositive ? "text-green-300" : "text-red-400"}`}>
                                        {isPositive ? "+" : ""}{item.pct_change}%
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </main>
    );
}