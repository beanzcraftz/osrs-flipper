import os

OSRS_WIKI_BASE_URL = "https://prices.runescape.wiki/api/v1/osrs"
USER_AGENT = "FlippingDashboard - @BeanyDev"
POLL_INTERVAL_SECONDS = 300  # 5 minutes
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./data/prices.db")
