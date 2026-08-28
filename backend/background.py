import asyncio
import logging
from database import async_session_factory
from services import fetch_and_store_prices, sync_mapping
from config import POLL_INTERVAL_SECONDS

logger = logging.getLogger(__name__)

async def price_poller():
    """Background task that syncs mapping once then polls prices every 5 minutes."""
    # Initial mapping sync
    try:
        async with async_session_factory() as session:
            await sync_mapping(session)
        logger.info("Initial mapping sync complete")
    except Exception as e:
        logger.error(f"Failed initial mapping sync: {e}")
    
    while True:
        try:
            async with async_session_factory() as session:
                await fetch_and_store_prices(session)
            logger.info("Price snapshot stored")
        except Exception as e:
            logger.error(f"Price poll failed: {e}")
        await asyncio.sleep(POLL_INTERVAL_SECONDS)
