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
