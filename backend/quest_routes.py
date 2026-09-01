from fastapi import APIRouter
from quest_data import QUESTS

router = APIRouter(prefix='/api/quests', tags=['quests'], redirect_slashes=False)

@router.get('')
async def get_quests():
    return QUESTS
