import time
from datetime import datetime
from sqlalchemy import select, func, and_
from sqlalchemy.orm import aliased
from database import Item, PriceSnapshot
from osrs_client import fetch_mapping, fetch_latest, fetch_volume_1h

async def sync_mapping(session):
    mapping_data = await fetch_mapping()
    for item_data in mapping_data:
        item = Item(
            id=item_data.get("id"),
            name=item_data.get("name"),
            examine=item_data.get("examine"),
            members=item_data.get("members"),
            limit=item_data.get("limit"),
            highalch=item_data.get("highalch"),
            lowalch=item_data.get("lowalch"),
            icon=item_data.get("icon"),
            value=item_data.get("value")
        )
        await session.merge(item)
    await session.commit()

async def fetch_and_store_prices(session):
    # Fetch latest prices and 1h volume in parallel-ish (sequential is fine here)
    latest_data = await fetch_latest()
    volume_data = await fetch_volume_1h()
    now = datetime.utcnow()

    snapshots = []
    for item_id, price_data in latest_data.items():
        try:
            item_id_int = int(item_id)
        except ValueError:
            continue

        volume_1h = volume_data.get(item_id, 0) or 0

        snapshot = PriceSnapshot(
            item_id=item_id_int,
            high=price_data.get("high"),
            high_time=price_data.get("highTime"),
            low=price_data.get("low"),
            low_time=price_data.get("lowTime"),
            volume_1h=volume_1h,
            fetched_at=now
        )
        snapshots.append(snapshot)

    session.add_all(snapshots)
    await session.commit()

async def get_merged_items(
    session,
    min_margin: int = 0,
    min_roi: float = 0.0,
    min_volume: int = 0,
    search: str = None
) -> list[dict]:
    # Subquery: latest snapshot per item
    subq = select(
        PriceSnapshot.item_id,
        func.max(PriceSnapshot.fetched_at).label('max_fetched_at')
    ).group_by(PriceSnapshot.item_id).subquery()

    ps = aliased(PriceSnapshot)
    stmt = select(
        Item, ps.high, ps.low, ps.high_time, ps.low_time, ps.volume_1h
    ).join(
        ps, Item.id == ps.item_id
    ).join(
        subq,
        and_(ps.item_id == subq.c.item_id, ps.fetched_at == subq.c.max_fetched_at)
    )

    if search:
        stmt = stmt.where(Item.name.ilike(f"%{search}%"))

    result = await session.execute(stmt)
    current_ts = int(time.time())

    items_list = []
    for item, high, low, high_time, low_time, volume_1h in result:
        if high is None or low is None or low == 0:
            continue

        # Must have a buy limit to be flippable
        if not item.limit or item.limit <= 0:
            continue

        # Filter stale prices (no trade in last 24h on either side)
        if high_time is None or low_time is None:
            continue
        if (current_ts - high_time > 86400) or (current_ts - low_time > 86400):
            continue

        # Volume filter — items with 0 volume are illiquid meme margins
        vol = volume_1h or 0
        if vol < min_volume:
            continue

        # Flipper perspective: buy at low (instant sell price), sell at high (instant buy price)
        flipper_buy_price = low
        flipper_sell_price = high

        # OSRS GE Tax: 1% of sell price, capped at 5,000,000 GP
        ge_tax = min(int(flipper_sell_price * 0.01), 5_000_000)

        margin = flipper_sell_price - flipper_buy_price - ge_tax
        roi = (margin / flipper_buy_price) * 100 if flipper_buy_price > 0 else 0

        if margin >= min_margin and roi >= min_roi:
            items_list.append({
                "id": item.id,
                "name": item.name,
                "icon": item.icon,
                "members": item.members,
                "limit": item.limit,
                "highalch": item.highalch,
                "lowalch": item.lowalch,
                "buy_price": flipper_buy_price,
                "sell_price": flipper_sell_price,
                "margin": margin,
                "roi": roi,
                "buy_limit": item.limit,
                "volume_1h": vol,
                "high_time": high_time,
                "low_time": low_time
            })

    return items_list
