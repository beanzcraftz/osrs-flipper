from datetime import datetime
from sqlalchemy import select, func, and_
from sqlalchemy.orm import aliased
from database import Item, PriceSnapshot
from osrs_client import fetch_mapping, fetch_latest

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
    latest_data = await fetch_latest()
    now = datetime.utcnow()
    snapshots = []
    for item_id, price_data in latest_data.items():
        try:
            item_id_int = int(item_id)
        except ValueError:
            continue
        
        snapshot = PriceSnapshot(
            item_id=item_id_int,
            high=price_data.get("high"),
            high_time=price_data.get("highTime"),
            low=price_data.get("low"),
            low_time=price_data.get("lowTime"),
            fetched_at=now
        )
        snapshots.append(snapshot)
    
    session.add_all(snapshots)
    await session.commit()

async def get_merged_items(session, min_margin=0, min_roi=0.0, search=None) -> list[dict]:
    # Subquery to get the latest snapshot per item
    subq = select(
        PriceSnapshot.item_id,
        func.max(PriceSnapshot.fetched_at).label('max_fetched_at')
    ).group_by(PriceSnapshot.item_id).subquery()

    # Main query
    ps = aliased(PriceSnapshot)
    stmt = select(
        Item, ps.high, ps.low, ps.high_time, ps.low_time
    ).join(
        ps, Item.id == ps.item_id
    ).join(
        subq,
        and_(ps.item_id == subq.c.item_id, ps.fetched_at == subq.c.max_fetched_at)
    )

    if search:
        stmt = stmt.where(Item.name.ilike(f"%{search}%"))

    result = await session.execute(stmt)
    
    items_list = []
    for item, high, low, high_time, low_time in result:
        if high is None or low is None or low == 0:
            continue

        margin = high - low
        roi = (margin / low) * 100

        if margin >= min_margin and roi >= min_roi:
            items_list.append({
                "id": item.id,
                "name": item.name,
                "icon": item.icon,
                "members": item.members,
                "limit": item.limit,
                "highalch": item.highalch,
                "lowalch": item.lowalch,
                "buy_price": high,
                "sell_price": low,
                "margin": margin,
                "roi": roi,
                "buy_limit": item.limit,
                "high_time": high_time,
                "low_time": low_time
            })
            
    return items_list
