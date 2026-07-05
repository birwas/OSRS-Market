const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
console.log("API_BASE_URL:", API_BASE_URL);
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

export async function getItem(itemId: number) {
    const res = await fetch(`${API_BASE_URL}/items/${itemId}`);
    if (!res.ok) throw new Error("Failed to fetch item");
    return res.json();
}

export async function getItemLatestPrice(itemId: number) {
    const res = await fetch(`${API_BASE_URL}/prices/history/${itemId}?days=1`);
    if (!res.ok) throw new Error("Failed to fetch item price");
    return res.json();
}