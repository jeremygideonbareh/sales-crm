from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from ..services.auth import register_user, authenticate_user, create_access_token
from ..api.deps import get_current_user
from ..models.user import User, UserRole

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        user = await register_user(db, req.email, req.password, req.full_name, req.role)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        user = await authenticate_user(db, req.email, req.password)
        token = create_access_token(user.id, user.role.value)
        return TokenResponse(access_token=token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    return user


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(User).where(User.role == UserRole.REP, User.is_active == True)
    )
    return result.scalars().all()
