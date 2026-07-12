from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.user import User
from ..schemas.analytics import PipelineOverviewResponse
from ..services.pipeline import get_pipeline_overview
from .deps import require_role

router = APIRouter(prefix="/api/pipeline", tags=["pipeline"])


@router.get("/overview", response_model=PipelineOverviewResponse)
async def pipeline_overview(
    user: User = Depends(require_role("manager")),
    db: AsyncSession = Depends(get_db),
):
    return await get_pipeline_overview(db)
