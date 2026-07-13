from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from ..models.lead import Lead, LeadStatus
from ..models.call_log import CallLog
from ..models.user import User, UserRole
from ..schemas.lead import StatusUpdateRequest


async def get_leads(
    db: AsyncSession,
    user: User,
    status: Optional[list[str]] = None,
    assigned_to: Optional[int] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> tuple[list[Lead], int]:
    query = select(Lead)
    count_query = select(func.count(Lead.id))

    if user.role == UserRole.REP:
        query = query.where(Lead.assigned_to == user.id)
        count_query = count_query.where(Lead.assigned_to == user.id)

    if assigned_to:
        query = query.where(Lead.assigned_to == assigned_to)
        count_query = count_query.where(Lead.assigned_to == assigned_to)

    if status:
        status_enums = [LeadStatus(s) for s in status if s]
        query = query.where(Lead.status.in_(status_enums))
        count_query = count_query.where(Lead.status.in_(status_enums))

    if search:
        pattern = f"%{search}%"
        query = query.where(
            Lead.business_name.ilike(pattern) | Lead.contact_name.ilike(pattern) | Lead.phone.ilike(pattern)
        )
        count_query = count_query.where(
            Lead.business_name.ilike(pattern) | Lead.contact_name.ilike(pattern) | Lead.phone.ilike(pattern)
        )

    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(Lead.updated_at.desc().nullslast()).offset(skip).limit(limit)
    leads = (await db.execute(query)).scalars().all()
    return list(leads), total


async def get_next_lead(db: AsyncSession, rep_id: int) -> tuple[Optional[Lead], int]:
    active_statuses = [LeadStatus.UN_CALLED, LeadStatus.NO_ANSWER]
    query = (
        select(Lead)
        .where(Lead.assigned_to == rep_id, Lead.status.in_(active_statuses))
        .order_by(Lead.updated_at.asc().nullsfirst())
        .limit(1)
    )
    lead = (await db.execute(query)).scalar_one_or_none()

    remaining = 0
    if lead:
        count_q = select(func.count(Lead.id)).where(
            Lead.assigned_to == rep_id, Lead.status.in_(active_statuses)
        )
        remaining = (await db.execute(count_q)).scalar() or 0

    return lead, remaining


async def update_lead_status(
    db: AsyncSession, lead_id: int, rep_id: int, req: StatusUpdateRequest
) -> Lead:
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise ValueError("Lead not found")

    if lead.assigned_to != rep_id:
        raise ValueError("Lead not assigned to you")

    status_before = lead.status
    new_status = LeadStatus(req.status)

    lead.status = new_status
    lead.notes = req.notes if req.notes is not None else lead.notes

    if new_status == LeadStatus.DEAL_CLOSED:
        deal_val = req.deal_value or 0
        lead.deal_value = deal_val
        lead.commission = round(float(deal_val) * 0.20, 2)
        lead.closed_by = rep_id
    elif status_before == LeadStatus.DEAL_CLOSED:
        lead.deal_value = None
        lead.commission = None
        lead.closed_by = None

    call_log = CallLog(
        lead_id=lead_id,
        rep_id=rep_id,
        status_before=status_before,
        status_after=new_status,
        notes=req.notes,
        call_duration_seconds=req.call_duration_seconds,
    )
    db.add(call_log)
    await db.commit()
    await db.refresh(lead)
    return lead


async def get_assigned_leads(
    db: AsyncSession, user_id: int
) -> list[tuple[Lead, int, str | None, str | None]]:
    call_count_subq = (
        select(func.count(CallLog.id))
        .where(CallLog.lead_id == Lead.id)
        .correlate(Lead)
        .scalar_subquery()
    )
    latest_status_subq = (
        select(CallLog.status_after)
        .where(CallLog.lead_id == Lead.id)
        .order_by(CallLog.created_at.desc())
        .limit(1)
        .correlate(Lead)
        .scalar_subquery()
    )
    latest_call_at_subq = (
        select(CallLog.created_at)
        .where(CallLog.lead_id == Lead.id)
        .order_by(CallLog.created_at.desc())
        .limit(1)
        .correlate(Lead)
        .scalar_subquery()
    )

    query = (
        select(
            Lead,
            call_count_subq.label("call_count"),
            latest_status_subq.label("last_call_status"),
            latest_call_at_subq.label("last_call_at"),
        )
        .where(Lead.assigned_to == user_id)
        .order_by(
            latest_call_at_subq.asc().nullsfirst(),
            Lead.updated_at.desc().nullslast(),
        )
    )
    rows = (await db.execute(query)).all()
    return [(r[0], r[1] or 0, r[2], r[3]) for r in rows]


async def assign_leads(db: AsyncSession, lead_ids: list[int], rep_id: int, assigned_by: int) -> int:
    result = await db.execute(select(User).where(User.id == rep_id, User.role == UserRole.REP))
    if not result.scalar_one_or_none():
        raise ValueError("Rep not found")

    stmt = (
        update(Lead)
        .where(Lead.id.in_(lead_ids))
        .values(assigned_to=rep_id, assigned_by=assigned_by)
    )
    await db.execute(stmt)
    await db.commit()
    return len(lead_ids)


async def bulk_create_leads(db: AsyncSession, leads_data: list[dict]) -> int:
    leads = [Lead(**data) for data in leads_data]
    db.add_all(leads)
    await db.commit()
    return len(leads)
