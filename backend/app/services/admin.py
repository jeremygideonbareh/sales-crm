from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.user import User, UserRole
from ..models.lead import Lead, LeadStatus
from ..schemas.admin import AdminDashboardResponse
from ..schemas.auth import UserResponse
from ..services.auth import hash_password


async def get_admin_dashboard(db: AsyncSession) -> AdminDashboardResponse:
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    active_users = (await db.execute(select(func.count(User.id)).where(User.is_active == True))).scalar() or 0
    total_leads = (await db.execute(select(func.count(Lead.id)))).scalar() or 0
    total_deals = (await db.execute(select(func.count(Lead.id)).where(Lead.status == LeadStatus.DEAL_CLOSED))).scalar() or 0
    total_commission = (await db.execute(select(func.coalesce(func.sum(Lead.commission), 0)).where(Lead.status == LeadStatus.DEAL_CLOSED))).scalar() or 0.0
    recent = await db.execute(select(User).order_by(User.id.desc()).limit(5))
    recent_users = [UserResponse.model_validate(u) for u in recent.scalars().all()]

    return AdminDashboardResponse(
        total_users=total_users,
        active_users=active_users,
        total_leads=total_leads,
        total_deals=total_deals,
        total_commission=float(total_commission),
        recent_users=recent_users,
    )


async def create_user(db: AsyncSession, email: str, password: str, full_name: str, role: str):
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise ValueError("Email already registered")

    user = User(
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name,
        role=UserRole(role),
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


async def update_user(db: AsyncSession, user_id: int, data: dict):
    user = await db.get(User, user_id)
    if not user:
        raise ValueError("User not found")
    for key, value in data.items():
        if value is not None:
            setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)
