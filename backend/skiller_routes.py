from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased
from database import get_session, PriceSnapshot, Item
from skill_data import TRAINING_METHODS, xp_between, xp_for_level

router = APIRouter(prefix='/api/skiller', tags=['skiller'], redirect_slashes=False)



async def get_item_price(session: AsyncSession, item_id: int) -> dict | None:
    """Get the latest mid-price for an item."""
    subq = select(
        PriceSnapshot.item_id,
        func.max(PriceSnapshot.fetched_at).label('max_fetched_at')
    ).where(PriceSnapshot.item_id == item_id).group_by(PriceSnapshot.item_id).subquery()

    ps = aliased(PriceSnapshot)
    stmt = select(ps.high, ps.low).join(
        subq, and_(ps.item_id == subq.c.item_id, ps.fetched_at == subq.c.max_fetched_at)
    )
    result = await session.execute(stmt)
    row = result.first()
    if row and row.high and row.low:
        return {'high': row.high, 'low': row.low, 'mid': (row.high + row.low) // 2}
    return None


@router.get('/calculate')
async def calculate_training(
    skill: str,
    current_level: int,
    goal_level: int,
    available_gp: int = 0,
    session: AsyncSession = Depends(get_session),
):
    if current_level < 1 or current_level > 98:
        raise HTTPException(400, 'current_level must be 1-98')
    if goal_level < 2 or goal_level > 99:
        raise HTTPException(400, 'goal_level must be 2-99')
    if goal_level <= current_level:
        raise HTTPException(400, 'goal_level must be greater than current_level')

    xp_gap = xp_between(current_level, goal_level)
    methods = [m for m in TRAINING_METHODS if m['skill'] == skill.lower() and m['level_req'] <= current_level]

    if not methods:
        return {
            'skill': skill, 'current_level': current_level, 'goal_level': goal_level,
            'xp_needed': xp_gap, 'current_xp': xp_for_level(current_level),
            'goal_xp': xp_for_level(goal_level), 'methods': []
        }

    results = []
    for m in methods:
        actions_required = max(1, round(xp_gap / m['xp_per_action']))
        hours_required = round(actions_required / m['actions_per_hour'], 2)
        xp_per_hour = round(m['xp_per_action'] * m['actions_per_hour'])

        # Calculate cost/profit using live GE prices
        cost_per_action = 0
        profit_per_action = 0
        cost_notes = []
        affordable = True

        for inp in m.get('input_items', []):
            price_data = await get_item_price(session, inp['item_id'])
            if price_data:
                item_cost = price_data['low'] * inp['qty']  # buy at low (insta-buy)
                cost_per_action += item_cost
                cost_notes.append(f"{inp['name']}: {price_data['low']:,} GP")

        for out in m.get('output_items', []):
            price_data = await get_item_price(session, out['item_id'])
            if price_data:
                item_profit = price_data['high'] * out.get('qty', 1)  # sell at high
                profit_per_action += item_profit

        net_cost_per_action = cost_per_action - profit_per_action
        total_cost = round(net_cost_per_action * actions_required)

        if available_gp > 0 and total_cost > available_gp:
            affordable = False

        results.append({
            'name': m['name'],
            'level_req': m['level_req'],
            'members': m['members'],
            'xp_per_action': m['xp_per_action'],
            'xp_per_hour': xp_per_hour,
            'actions_per_hour': m['actions_per_hour'],
            'actions_required': actions_required,
            'hours_required': hours_required,
            'cost_per_action': round(net_cost_per_action),
            'total_cost': total_cost,
            'cost_notes': cost_notes,
            'profitable': profit_per_action > cost_per_action,
            'affordable': affordable,
            'notes': m['notes'],
        })

    results.sort(key=lambda x: x['xp_per_hour'], reverse=True)

    return {
        'skill': skill,
        'current_level': current_level,
        'goal_level': goal_level,
        'xp_needed': xp_gap,
        'current_xp': xp_for_level(current_level),
        'goal_xp': xp_for_level(goal_level),
        'methods': results,
    }
