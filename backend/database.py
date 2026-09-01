import os
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, BigInteger, Text, Float

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

from config import DATABASE_URL

engine = create_async_engine(DATABASE_URL, echo=False)
async_session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()

SKILLS = [
    'attack', 'hitpoints', 'mining', 'strength', 'agility', 'smithing',
    'defence', 'herblore', 'fishing', 'ranged', 'thieving', 'cooking',
    'prayer', 'crafting', 'firemaking', 'magic', 'fletching', 'woodcutting',
    'runecraft', 'slayer', 'farming', 'construction', 'hunter', 'sailing'
]

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
    volume_1h = Column(Integer, nullable=True, default=0)
    fetched_at = Column(DateTime, default=datetime.utcnow, index=True)

class Character(Base):
    __tablename__ = 'characters'
    id = Column(Integer, primary_key=True, autoincrement=True)
    slot = Column(Integer, unique=True, nullable=False)  # 1, 2, or 3
    name = Column(String, nullable=False, default='New Character')
    combat_level = Column(Float, default=3.0)
    total_level = Column(Integer, default=32)
    current_gp = Column(BigInteger, default=0)
    # 24 skills
    attack = Column(Integer, default=1)
    hitpoints = Column(Integer, default=10)
    mining = Column(Integer, default=1)
    strength = Column(Integer, default=1)
    agility = Column(Integer, default=1)
    smithing = Column(Integer, default=1)
    defence = Column(Integer, default=1)
    herblore = Column(Integer, default=1)
    fishing = Column(Integer, default=1)
    ranged = Column(Integer, default=1)
    thieving = Column(Integer, default=1)
    cooking = Column(Integer, default=1)
    prayer = Column(Integer, default=1)
    crafting = Column(Integer, default=1)
    firemaking = Column(Integer, default=1)
    magic = Column(Integer, default=1)
    fletching = Column(Integer, default=1)
    woodcutting = Column(Integer, default=1)
    runecraft = Column(Integer, default=1)
    slayer = Column(Integer, default=1)
    farming = Column(Integer, default=1)
    construction = Column(Integer, default=1)
    hunter = Column(Integer, default=1)
    sailing = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CharacterGoal(Base):
    __tablename__ = 'character_goals'
    id = Column(Integer, primary_key=True, autoincrement=True)
    character_id = Column(Integer, ForeignKey('characters.id'), index=True)
    skill = Column(String, nullable=False)
    current_level = Column(Integer, nullable=False)
    target_level = Column(Integer, nullable=False)
    completed = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class CharacterNote(Base):
    __tablename__ = 'character_notes'
    id = Column(Integer, primary_key=True, autoincrement=True)
    character_id = Column(Integer, ForeignKey('characters.id'), index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class CharacterQuest(Base):
    __tablename__ = 'character_quests'
    id = Column(Integer, primary_key=True, autoincrement=True)
    character_id = Column(Integer, ForeignKey('characters.id'), index=True)
    quest_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

async def init_db():
    os.makedirs('./data', exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        try:
            await conn.execute(
                __import__('sqlalchemy').text(
                    'ALTER TABLE price_snapshots ADD COLUMN volume_1h INTEGER DEFAULT 0'
                )
            )
        except Exception:
            pass
        try:
            await conn.execute(
                __import__('sqlalchemy').text(
                    'ALTER TABLE characters ADD COLUMN sailing INTEGER DEFAULT 1'
                )
            )
        except Exception:
            pass
        try:
            await conn.execute(
                __import__('sqlalchemy').text(
                    'ALTER TABLE character_goals ADD COLUMN order_index INTEGER DEFAULT 0'
                )
            )
        except Exception:
            pass

async def get_session():
    async with async_session_factory() as session:
        yield session
