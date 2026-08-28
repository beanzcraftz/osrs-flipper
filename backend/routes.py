from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_session, PriceSnapshot
from services import get_merged_items

router = APIRouter(prefix="/api")

@router.get("/items")
async def api_get_items(
    min_margin: int = 0,
    min_roi: float = 0.0,
    search: str = None,
    session: AsyncSession = Depends(get_session)
):
    return await get_merged_items(session, min_margin, min_roi, search)

@router.get("/items/{item_id}/history")
async def api_get_item_history(item_id: int, session: AsyncSession = Depends(get_session)):
    stmt = select(PriceSnapshot).where(PriceSnapshot.item_id == item_id).order_by(PriceSnapshot.fetched_at.desc()).limit(288)
    result = await session.execute(stmt)
    snapshots = result.scalars().all()
    return snapshots
