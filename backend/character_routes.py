from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_session, Character, CharacterGoal, CharacterNote, SKILLS

router = APIRouter(prefix='/api/characters', tags=['characters'])


class CharacterCreate(BaseModel):
    name: str = 'New Character'
    slot: int  # 1, 2, or 3


class CharacterUpdate(BaseModel):
    name: str | None = None
    combat_level: int | None = None
    total_level: int | None = None
    current_gp: int | None = None
    attack: int | None = None
    hitpoints: int | None = None
    mining: int | None = None
    strength: int | None = None
    agility: int | None = None
    smithing: int | None = None
    defence: int | None = None
    herblore: int | None = None
    fishing: int | None = None
    ranged: int | None = None
    thieving: int | None = None
    cooking: int | None = None
    prayer: int | None = None
    crafting: int | None = None
    firemaking: int | None = None
    magic: int | None = None
    fletching: int | None = None
    woodcutting: int | None = None
    runecraft: int | None = None
    slayer: int | None = None
    farming: int | None = None
    construction: int | None = None
    hunter: int | None = None


class GoalCreate(BaseModel):
    skill: str
    current_level: int
    target_level: int


class NoteCreate(BaseModel):
    content: str


def char_to_dict(c: Character) -> dict:
    d = {
        'id': c.id,
        'slot': c.slot,
        'name': c.name,
        'combat_level': c.combat_level,
        'total_level': c.total_level,
        'current_gp': c.current_gp,
        'created_at': c.created_at.isoformat() if c.created_at else None,
        'updated_at': c.updated_at.isoformat() if c.updated_at else None,
        'skills': {skill: getattr(c, skill, 1) for skill in SKILLS},
    }
    return d


@router.get('/')
async def list_characters(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Character).order_by(Character.slot))
    chars = result.scalars().all()
    return [char_to_dict(c) for c in chars]


@router.post('/', status_code=201)
async def create_character(body: CharacterCreate, session: AsyncSession = Depends(get_session)):
    if body.slot not in (1, 2, 3):
        raise HTTPException(400, 'Slot must be 1, 2, or 3')
    existing = await session.execute(select(Character).where(Character.slot == body.slot))
    if existing.scalar_one_or_none():
        raise HTTPException(409, f'Slot {body.slot} is already occupied')
    count = await session.execute(select(Character))
    if len(count.scalars().all()) >= 3:
        raise HTTPException(400, 'Maximum of 3 characters allowed')
    char = Character(name=body.name, slot=body.slot)
    session.add(char)
    await session.commit()
    await session.refresh(char)
    return char_to_dict(char)


@router.get('/{char_id}')
async def get_character(char_id: int, session: AsyncSession = Depends(get_session)):
    char = await session.get(Character, char_id)
    if not char:
        raise HTTPException(404, 'Character not found')
    d = char_to_dict(char)
    # Include goals
    goals_result = await session.execute(
        select(CharacterGoal).where(CharacterGoal.character_id == char_id)
    )
    goals = goals_result.scalars().all()
    d['goals'] = [{
        'id': g.id, 'skill': g.skill,
        'current_level': g.current_level, 'target_level': g.target_level,
        'completed': g.completed,
        'created_at': g.created_at.isoformat() if g.created_at else None,
    } for g in goals]
    # Include last 20 notes
    notes_result = await session.execute(
        select(CharacterNote)
        .where(CharacterNote.character_id == char_id)
        .order_by(CharacterNote.created_at.desc())
        .limit(20)
    )
    notes = notes_result.scalars().all()
    d['notes'] = [{
        'id': n.id, 'content': n.content,
        'created_at': n.created_at.isoformat() if n.created_at else None,
    } for n in notes]
    return d


@router.put('/{char_id}')
async def update_character(char_id: int, body: CharacterUpdate, session: AsyncSession = Depends(get_session)):
    char = await session.get(Character, char_id)
    if not char:
        raise HTTPException(404, 'Character not found')
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(char, field, value)
    char.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(char)
    return char_to_dict(char)


@router.delete('/{char_id}', status_code=204)
async def delete_character(char_id: int, session: AsyncSession = Depends(get_session)):
    char = await session.get(Character, char_id)
    if not char:
        raise HTTPException(404, 'Character not found')
    # Delete related records
    goals = await session.execute(select(CharacterGoal).where(CharacterGoal.character_id == char_id))
    for g in goals.scalars().all():
        await session.delete(g)
    notes = await session.execute(select(CharacterNote).where(CharacterNote.character_id == char_id))
    for n in notes.scalars().all():
        await session.delete(n)
    await session.delete(char)
    await session.commit()


@router.post('/{char_id}/goals', status_code=201)
async def add_goal(char_id: int, body: GoalCreate, session: AsyncSession = Depends(get_session)):
    char = await session.get(Character, char_id)
    if not char:
        raise HTTPException(404, 'Character not found')
    goal = CharacterGoal(
        character_id=char_id,
        skill=body.skill,
        current_level=body.current_level,
        target_level=body.target_level,
    )
    session.add(goal)
    await session.commit()
    await session.refresh(goal)
    return {'id': goal.id, 'skill': goal.skill, 'current_level': goal.current_level,
            'target_level': goal.target_level, 'completed': goal.completed}


@router.put('/{char_id}/goals/{goal_id}')
async def update_goal(char_id: int, goal_id: int, completed: bool, session: AsyncSession = Depends(get_session)):
    goal = await session.get(CharacterGoal, goal_id)
    if not goal or goal.character_id != char_id:
        raise HTTPException(404, 'Goal not found')
    goal.completed = completed
    await session.commit()
    return {'id': goal.id, 'completed': goal.completed}


@router.delete('/{char_id}/goals/{goal_id}', status_code=204)
async def delete_goal(char_id: int, goal_id: int, session: AsyncSession = Depends(get_session)):
    goal = await session.get(CharacterGoal, goal_id)
    if not goal or goal.character_id != char_id:
        raise HTTPException(404, 'Goal not found')
    await session.delete(goal)
    await session.commit()


@router.post('/{char_id}/notes', status_code=201)
async def add_note(char_id: int, body: NoteCreate, session: AsyncSession = Depends(get_session)):
    char = await session.get(Character, char_id)
    if not char:
        raise HTTPException(404, 'Character not found')
    note = CharacterNote(character_id=char_id, content=body.content)
    session.add(note)
    await session.commit()
    await session.refresh(note)
    return {'id': note.id, 'content': note.content, 'created_at': note.created_at.isoformat()}


@router.get('/{char_id}/notes')
async def list_notes(char_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(CharacterNote)
        .where(CharacterNote.character_id == char_id)
        .order_by(CharacterNote.created_at.desc())
        .limit(20)
    )
    return [{'id': n.id, 'content': n.content, 'created_at': n.created_at.isoformat()} for n in result.scalars().all()]
