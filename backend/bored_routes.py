import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_session, Character, SKILLS
from skill_data import TRAINING_METHODS

router = APIRouter(prefix='/api/bored', tags=['bored'])


@router.get('/suggest/{char_id}')
async def suggest_task(char_id: int, session: AsyncSession = Depends(get_session)):
    char = await session.get(Character, char_id)
    if not char:
        raise HTTPException(404, 'Character not found')

    # Build skill level map
    skill_levels = {skill: getattr(char, skill, 1) for skill in SKILLS}

    # Find lowest 8 skills to bias suggestions
    sorted_skills = sorted(skill_levels.items(), key=lambda x: x[1])
    low_skills = [s for s, _ in sorted_skills[:8]]

    # Filter methods that are available to the character
    available_methods = [
        m for m in TRAINING_METHODS
        if skill_levels.get(m['skill'], 1) >= m['level_req']
    ]

    if not available_methods:
        # Fallback if no methods match (very low-level character)
        available_methods = [m for m in TRAINING_METHODS if m['level_req'] == 1]

    # Weight towards low skills (3x weight for low skills, 1x for others)
    weighted = []
    for m in available_methods:
        w = 3 if m['skill'] in low_skills else 1
        weighted.extend([m] * w)

    chosen = random.choice(weighted)
    skill_level = skill_levels.get(chosen['skill'], 1)
    xp_per_action = chosen['xp_per_action']
    actions_per_hour = chosen['actions_per_hour']
    # Estimate 30-minute XP gain
    xp_estimate = round(xp_per_action * actions_per_hour * 0.5)

    return {
        'skill': chosen['skill'],
        'method_name': chosen['name'],
        'task_description': chosen['bored_task'],
        'emoji': chosen['emoji'],
        'current_level': skill_level,
        'xp_estimate_30min': xp_estimate,
        'duration': '30 minutes',
        'members': chosen['members'],
        'notes': chosen['notes'],
    }


@router.get('/suggest-guest')
async def suggest_guest():
    """Suggest a task without a character profile (random weighted towards starter methods)."""
    beginner = [m for m in TRAINING_METHODS if m['level_req'] <= 30]
    chosen = random.choice(beginner if beginner else TRAINING_METHODS)
    xp_estimate = round(chosen['xp_per_action'] * chosen['actions_per_hour'] * 0.5)
    return {
        'skill': chosen['skill'],
        'method_name': chosen['name'],
        'task_description': chosen['bored_task'],
        'emoji': chosen['emoji'],
        'current_level': 1,
        'xp_estimate_30min': xp_estimate,
        'duration': '30 minutes',
        'members': chosen['members'],
        'notes': chosen['notes'],
    }
