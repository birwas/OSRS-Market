const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function getTopMargins(limit: number = 20) {
    const res = await fetch(`${API_BASE_URL}/prices/top-margins?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch top margins");
    return res.json();
}

export async function getTopMovers(hours: number = 24) {
    const res = await fetch(`${API_BASE_URL}/prices/top-movers?hours=${hours}`);
    if (!res.ok) throw new Error("Failed to fetch top movers");
    return res.json();
}

export async function getPriceHistory(itemId: number, days: number = 7) {
    const res = await fetch(`${API_BASE_URL}/prices/history/${itemId}?days=${days}`);
    if (!res.ok) throw new Error("Failed to fetch price history");
    return res.json();
}

export async function searchItems(name: string) {
    const res = await fetch(`${API_BASE_URL}/items/search/${name}`);
    if (!res.ok) throw new Error("Failed to search items");
    return res.json();
}

export async function getAlchProfit(itemId: number) {
    const res = await fetch(`${API_BASE_URL}/items/${itemId}/alch-profit`);
    if (!res.ok) throw new Error("Failed to fetch alch profit");
    return res.json();
}