from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.user import User
from ..schemas.email import (
    EmailSequenceCreate,
    EmailSequenceUpdate,
    EmailSequenceResponse,
    SequenceStepCreate,
    EmailLogResponse,
)
from ..services.email_sequences import (
    create_sequence,
    get_sequences,
    get_sequence,
    update_sequence,
    delete_sequence,
    set_steps,
    get_email_logs,
)
from .deps import get_current_user, require_role

router = APIRouter(prefix="/api/email-sequences", tags=["email-sequences"])


@router.get("", response_model=list[EmailSequenceResponse])
async def list_sequences(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await get_sequences(db)


@router.post("", response_model=EmailSequenceResponse, status_code=201)
async def create_sequence_endpoint(
    data: EmailSequenceCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("manager")),
):
    return await create_sequence(db, data, user.id)


@router.get("/{sequence_id}", response_model=EmailSequenceResponse)
async def get_sequence_endpoint(
    sequence_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    seq = await get_sequence(db, sequence_id)
    if not seq:
        raise HTTPException(status_code=404, detail="Sequence not found")
    return seq


@router.put("/{sequence_id}", response_model=EmailSequenceResponse)
async def update_sequence_endpoint(
    sequence_id: int,
    data: EmailSequenceUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("manager")),
):
    seq = await update_sequence(db, sequence_id, data.model_dump(exclude_unset=True))
    if not seq:
        raise HTTPException(status_code=404, detail="Sequence not found")
    return seq


@router.delete("/{sequence_id}")
async def delete_sequence_endpoint(
    sequence_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("manager")),
):
    deleted = await delete_sequence(db, sequence_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Sequence not found")
    return {"message": "Sequence deleted"}


@router.put("/{sequence_id}/steps", response_model=EmailSequenceResponse)
async def set_sequence_steps(
    sequence_id: int,
    steps: list[SequenceStepCreate],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("manager")),
):
    seq = await set_steps(db, sequence_id, steps)
    if not seq:
        raise HTTPException(status_code=404, detail="Sequence not found")
    return seq


@router.get("/{sequence_id}/logs", response_model=list[EmailLogResponse])
async def list_sequence_logs(
    sequence_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await get_email_logs(db)


@router.get("/logs/all", response_model=list[EmailLogResponse])
async def list_all_logs(
    lead_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await get_email_logs(db, lead_id=lead_id)
