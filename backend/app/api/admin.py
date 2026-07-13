from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.user import User, UserRole
from ..schemas.admin import CreateUserRequest, UpdateUserRequest, ChangePasswordRequest, AdminDashboardResponse
from ..schemas.auth import UserResponse
from ..services.admin import get_admin_dashboard, create_user, update_user
from ..services.auth import hash_password, verify_password
from ..api.auth import validate_password
from .deps import require_role, get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/dashboard", response_model=AdminDashboardResponse)
async def admin_dashboard(
    user: User = Depends(require_role("manager")),
    db: AsyncSession = Depends(get_db),
):
    return await get_admin_dashboard(db)


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    user: User = Depends(require_role("manager")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).order_by(User.full_name))
    return [UserResponse.model_validate(u) for u in result.scalars().all()]


@router.post("/users", response_model=UserResponse)
async def create_new_user(
    req: CreateUserRequest,
    user: User = Depends(require_role("manager")),
    db: AsyncSession = Depends(get_db),
):
    validate_password(req.password)
    try:
        return await create_user(db, req.email, req.password, req.full_name, req.role)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_existing_user(
    user_id: int,
    req: UpdateUserRequest,
    user: User = Depends(require_role("manager")),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await update_user(db, user_id, req.model_dump(exclude_none=True))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/change-password")
async def change_password(
    req: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(req.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.hashed_password = hash_password(req.new_password)
    await db.commit()
    return {"message": "Password changed successfully"}
