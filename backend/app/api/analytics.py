from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.user import User
from ..schemas.analytics import DashboardResponse, LeaderboardResponse
from ..services.analytics import get_dashboard, get_leaderboard
from .deps import require_role, get_current_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=DashboardResponse)
async def dashboard(
    user: User = Depends(require_role("manager")),
    db: AsyncSession = Depends(get_db),
):
    return await get_dashboard(db)


@router.get("/leaderboard", response_model=LeaderboardResponse)
async def leaderboard(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    entries = await get_leaderboard(db)
    return LeaderboardResponse(entries=entries)
