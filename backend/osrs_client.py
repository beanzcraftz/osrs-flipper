import httpx
from config import OSRS_WIKI_BASE_URL, USER_AGENT

HEADERS = {"User-Agent": USER_AGENT}

async def fetch_mapping() -> list[dict]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(f"{OSRS_WIKI_BASE_URL}/mapping", headers=HEADERS)
        response.raise_for_status()
        return response.json()

async def fetch_latest() -> dict:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(f"{OSRS_WIKI_BASE_URL}/latest", headers=HEADERS)
        response.raise_for_status()
        return response.json().get("data", {})

async def fetch_volume_1h() -> dict:
    """Fetch 1-hour OHLC + volume data. Returns dict of {item_id: total_volume_traded}."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(f"{OSRS_WIKI_BASE_URL}/1h", headers=HEADERS)
        response.raise_for_status()
        raw = response.json().get("data", {})
    # Sum buy-side + sell-side volume for a single "liquidity" number
    volumes = {}
    for item_id, data in raw.items():
        buy_vol = data.get("highPriceVolume") or 0
        sell_vol = data.get("lowPriceVolume") or 0
        volumes[item_id] = buy_vol + sell_vol
    return volumes
