import { getTopMargins } from "@/lib/api";

export default async function Home() {
    const margins = await getTopMargins(20);

    return (
        <main className="min-h-screen bg-gray-950 text-white p-8">
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">OSRS Market Tracker</h1>
            <p className="text-gray-400 mb-8">Highest flipping margins</p>

            <h2 className="text-xl font-semibold mb-4">Top Margins</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-b border-gray-700 text-gray-400 text-left">
                            <th className="py-3 pr-6">Item</th>
                            <th className="py-3 pr-6">Buy (Low)</th>
                            <th className="py-3 pr-6">Sell (High)</th>
                            <th className="py-3 pr-6">Margin</th>
                            <th className="py-3 pr-6">Buy Limit</th>
                            <th className="py-3">Max Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {margins.map((item: any, index: number) => (
                            <tr
                                key={index}
                                className="border-b border-gray-800 hover:bg-gray-900 transition-colors"
                            >
                                <td className="py-3 pr-6 font-medium text-yellow-300">{item.name}</td>
                                <td className="py-3 pr-6">{item.low?.toLocaleString()}gp</td>
                                <td className="py-3 pr-6">{item.high?.toLocaleString()}gp</td>
                                <td className="py-3 pr-6 text-green-400">{item.margin?.toLocaleString()}gp</td>
                                <td className="py-3 pr-6 text-gray-300">{item.buy_limit?.toLocaleString()}</td>
                                <td className="py-3 text-green-300 font-semibold">{item.max_profit?.toLocaleString()}gp</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}