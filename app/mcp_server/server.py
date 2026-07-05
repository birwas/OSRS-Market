import httpx
from mcp.server.fastmcp import FastMCP

API_BASE_URL = "http://127.0.0.1:8000"

mcp = FastMCP("OSRS Market Tracker")


@mcp.tool()
async def search_items(name: str) -> list[dict]:
    """Search for OSRS items by name. Returns a list of matching items with their IDs."""
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{API_BASE_URL}/items/search/{name}")
        res.raise_for_status()
        return res.json()


@mcp.tool()
async def get_item(item_id: int) -> dict:
    """Get details for a specific OSRS item by its ID, including buy limit, alch values, and members status."""
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{API_BASE_URL}/items/{item_id}")
        res.raise_for_status()
        return res.json()


@mcp.tool()
async def get_top_margins(limit: int = 20) -> list[dict]:
    """Get the top flipping margins on the Grand Exchange. Returns items sorted by margin descending."""
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{API_BASE_URL}/prices/top-margins?limit={limit}")
        res.raise_for_status()
        return res.json()


@mcp.tool()
async def get_top_margins_filtered(
    limit: int = 20,
    min_volume: int = 0,
    min_price: int = 0,
    max_price: int = 2147483647
) -> list[dict]:
    """Get top flipping margins with optional filters. Use min_volume to filter out illiquid items, min_price/max_price to filter by buy price. For example: limit=10, min_volume=500 returns top 10 liquid items. min_price=1000, max_price=100000 returns items in a specific price range."""
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{API_BASE_URL}/prices/top-margins?limit=100")
        res.raise_for_status()
        data = res.json()
        filtered = [
            item for item in data
            if (item.get("volume") is None or item["volume"] >= min_volume)
            and (item.get("low") is not None and min_price <= item["low"] <= max_price)
        ]
        filtered.sort(key=lambda x: x["margin"], reverse=True)
        return filtered[:limit]


@mcp.tool()
async def get_top_movers(hours: int = 24) -> list[dict]:
    """Get the items with the biggest price changes over the last N hours."""
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{API_BASE_URL}/prices/top-movers?hours={hours}")
        res.raise_for_status()
        return res.json()


@mcp.tool()
async def get_alch_profit(item_id: int) -> dict:
    """Calculate high alch profit for a specific item, accounting for the current nature rune price."""
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{API_BASE_URL}/items/{item_id}/alch-profit")
        res.raise_for_status()
        return res.json()


@mcp.tool()
async def get_price_history(item_id: int, days: int = 7) -> list[dict]:
    """Get price history for a specific item over the last N days."""
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{API_BASE_URL}/prices/history/{item_id}?days={days}")
        res.raise_for_status()
        return res.json()


if __name__ == "__main__":
    mcp.run()