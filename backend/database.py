import os
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

from config import DATABASE_URL

engine = create_async_engine(DATABASE_URL, echo=False)
async_session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()

class Item(Base):
    __tablename__ = 'items'
    id = Column(Integer, primary_key=True, autoincrement=False)
    name = Column(String)
    examine = Column(String, nullable=True)
    members = Column(Boolean)
    limit = Column(Integer, nullable=True)
    highalch = Column(Integer, nullable=True)
    lowalch = Column(Integer, nullable=True)
    icon = Column(String, nullable=True)
    value = Column(Integer, nullable=True)

class PriceSnapshot(Base):
    __tablename__ = 'price_snapshots'
    id = Column(Integer, primary_key=True, autoincrement=True)
    item_id = Column(Integer, ForeignKey('items.id'), index=True)
    high = Column(Integer, nullable=True)
    high_time = Column(Integer, nullable=True)
    low = Column(Integer, nullable=True)
    low_time = Column(Integer, nullable=True)
    # 1h volume data — total items traded in the last hour (both sides)
    volume_1h = Column(Integer, nullable=True, default=0)
    fetched_at = Column(DateTime, default=datetime.utcnow, index=True)

async def init_db():
    os.makedirs("./data", exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Add volume_1h column if upgrading from older schema (safe no-op if it exists)
        try:
            await conn.execute(
                __import__('sqlalchemy').text(
                    "ALTER TABLE price_snapshots ADD COLUMN volume_1h INTEGER DEFAULT 0"
                )
            )
        except Exception:
            pass  # Column already exists

async def get_session():
    async with async_session_factory() as session:
        yield session
