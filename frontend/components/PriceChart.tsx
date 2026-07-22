"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface PricePoint {
    polled_at: string;
    high: number;
    low: number;
}

interface Props {
    data: PricePoint[];
}

function formatGp(value: number) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return `${value}gp`;
}

function formatTime(value: string) {
    const date = new Date(value);
    return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function PriceChart({ data }: Props) {
    const reversed = [...data].reverse();

    return (
        <div className="bg-gray-900 border border-gray-800 rounded p-4 mb-8">
            <h2 className="text-sm text-gray-400 mb-4">Price History</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reversed}>
                    <XAxis
                        dataKey="polled_at"
                        tickFormatter={formatTime}
                        stroke="#4b5563"
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tickFormatter={formatGp}
                        stroke="#4b5563"
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                        width={70}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
                        labelStyle={{ color: "#9ca3af", fontSize: 11 }}
                        labelFormatter={(value) => new Date(value).toLocaleString("en-GB")}
                        formatter={(value: number, name: string) => [formatGp(value), name === "high" ? "Instant buy" : "Instant sell"]}
                    />
                    <Legend
                        formatter={(value) => value === "high" ? "Instant buy" : "Instant sell"}
                        wrapperStyle={{ fontSize: 12, color: "#9ca3af" }}
                    />
                    <Line type="monotone" dataKey="high" stroke="#f97316" dot={false} strokeWidth={1.5} />
                    <Line type="monotone" dataKey="low" stroke="#4ade80" dot={false} strokeWidth={1.5} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}