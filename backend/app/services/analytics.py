from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.lead import Lead, LeadStatus
from ..models.call_log import CallLog
from ..models.user import User, UserRole
from ..schemas.analytics import (
    KPIResponse, RepMetric, StatusDistribution, DashboardResponse,
    LeaderboardEntry, RepDashboardResponse, RecentActivityItem
)


async def get_dashboard(db: AsyncSession) -> DashboardResponse:
    total_calls = (
        await db.execute(select(func.count(CallLog.id)))
    ).scalar() or 0

    total_deals = (
        await db.execute(select(func.count(Lead.id)).where(Lead.status == LeadStatus.DEAL_CLOSED))
    ).scalar() or 0

    total_leads = (
        await db.execute(select(func.count(Lead.id)))
    ).scalar() or 0

    total_commission = (
        await db.execute(select(func.coalesce(func.sum(Lead.commission), 0)).where(Lead.status == LeadStatus.DEAL_CLOSED))
    ).scalar() or 0.0

    active_reps = (
        await db.execute(select(func.count(User.id)).where(User.role == UserRole.REP, User.is_active == True))
    ).scalar() or 0

    kpi = KPIResponse(
        total_calls=total_calls,
        total_deals=total_deals,
        success_rate=round((total_deals / total_calls * 100) if total_calls else 0, 1),
        total_commission_owed=float(total_commission),
        total_leads=total_leads,
        active_reps=active_reps,
    )

    reps_result = await db.execute(
        select(User.id, User.full_name).where(User.role == UserRole.REP, User.is_active == True)
    )
    rep_metrics = []
    for rep_id, rep_name in reps_result:
        rep_calls = (
            await db.execute(select(func.count(CallLog.id)).where(CallLog.rep_id == rep_id))
        ).scalar() or 0

        rep_deals = (
            await db.execute(
                select(func.count(Lead.id)).where(Lead.closed_by == rep_id, Lead.status == LeadStatus.DEAL_CLOSED)
            )
        ).scalar() or 0

        rep_commission = (
            await db.execute(
                select(func.coalesce(func.sum(Lead.commission), 0)).where(
                    Lead.closed_by == rep_id, Lead.status == LeadStatus.DEAL_CLOSED
                )
            )
        ).scalar() or 0.0

        leads_assigned = (
            await db.execute(select(func.count(Lead.id)).where(Lead.assigned_to == rep_id))
        ).scalar() or 0

        rep_metrics.append(RepMetric(
            rep_id=rep_id,
            rep_name=rep_name,
            total_calls=rep_calls,
            deals_closed=rep_deals,
            success_rate=round((rep_deals / rep_calls * 100) if rep_calls else 0, 1),
            commission_owed=float(rep_commission),
            leads_assigned=leads_assigned,
        ))

    status_dist = []
    for s in LeadStatus:
        count = (
            await db.execute(select(func.count(Lead.id)).where(Lead.status == s))
        ).scalar() or 0
        if count:
            status_dist.append(StatusDistribution(status=s.value, count=count))

    return DashboardResponse(kpi=kpi, by_rep=rep_metrics, status_distribution=status_dist)


async def get_leaderboard(db: AsyncSession) -> list[LeaderboardEntry]:
    reps_result = await db.execute(
        select(User.id, User.full_name).where(User.role == UserRole.REP, User.is_active == True)
    )
    entries = []
    for rep_id, rep_name in reps_result:
        rep_calls = (
            await db.execute(select(func.count(CallLog.id)).where(CallLog.rep_id == rep_id))
        ).scalar() or 0

        rep_deals = (
            await db.execute(
                select(func.count(Lead.id)).where(Lead.closed_by == rep_id, Lead.status == LeadStatus.DEAL_CLOSED)
            )
        ).scalar() or 0

        rep_commission = (
            await db.execute(
                select(func.coalesce(func.sum(Lead.commission), 0)).where(
                    Lead.closed_by == rep_id, Lead.status == LeadStatus.DEAL_CLOSED
                )
            )
        ).scalar() or 0.0

        leads_assigned = (
            await db.execute(select(func.count(Lead.id)).where(Lead.assigned_to == rep_id))
        ).scalar() or 0

        # Count active pipeline (leads that are past interested but not yet closed)
        active_statuses = [
            LeadStatus.INTERESTED, LeadStatus.DEMO_SCHEDULED, LeadStatus.DEMO_COMPLETED,
            LeadStatus.NEGOTIATION, LeadStatus.ONBOARDING, LeadStatus.DEPOSIT_PAID, LeadStatus.IN_PROGRESS
        ]
        active_pipeline = (
            await db.execute(
                select(func.count(Lead.id)).where(
                    Lead.assigned_to == rep_id, Lead.status.in_(active_statuses)
                )
            )
        ).scalar() or 0

        entries.append(LeaderboardEntry(
            rep_id=rep_id,
            rep_name=rep_name,
            deals_closed=rep_deals,
            total_commission=float(rep_commission),
            success_rate=round((rep_deals / rep_calls * 100) if rep_calls else 0, 1),
            total_calls=rep_calls,
            total_leads_assigned=leads_assigned,
            active_pipeline_count=active_pipeline,
            rank=0,
        ))

    # Sort by deals_closed desc, assign ranks
    entries.sort(key=lambda e: e.deals_closed, reverse=True)
    for i, entry in enumerate(entries):
        entry.rank = i + 1

    return entries


async def get_rep_dashboard(db: AsyncSession, rep_id: int) -> RepDashboardResponse:
    rep = await db.get(User, rep_id)
    if not rep:
        raise ValueError("Rep not found")

    total_calls = (
        await db.execute(select(func.count(CallLog.id)).where(CallLog.rep_id == rep_id))
    ).scalar() or 0

    total_deals = (
        await db.execute(
            select(func.count(Lead.id)).where(Lead.closed_by == rep_id, Lead.status == LeadStatus.DEAL_CLOSED)
        )
    ).scalar() or 0

    commission = (
        await db.execute(
            select(func.coalesce(func.sum(Lead.commission), 0)).where(
                Lead.closed_by == rep_id, Lead.status == LeadStatus.DEAL_CLOSED
            )
        )
    ).scalar() or 0.0

    leads_assigned = (
        await db.execute(select(func.count(Lead.id)).where(Lead.assigned_to == rep_id))
    ).scalar() or 0

    # Pipeline stages distribution for this rep
    pipeline_stages = []
    for s in LeadStatus:
        count = (
            await db.execute(
                select(func.count(Lead.id)).where(Lead.assigned_to == rep_id, Lead.status == s)
            )
        ).scalar() or 0
        if count:
            pipeline_stages.append(StatusDistribution(status=s.value, count=count))

    # Recent activity (last 10 call logs)
    recent_logs = (
        await db.execute(
            select(CallLog, Lead.business_name)
            .join(Lead, CallLog.lead_id == Lead.id)
            .where(CallLog.rep_id == rep_id)
            .order_by(CallLog.created_at.desc())
            .limit(10)
        )
    )
    recent_activity = []
    for log, business_name in recent_logs:
        recent_activity.append({
            "id": log.id,
            "type": log.status_after.value if log.status_after else "unknown",
            "business_name": business_name,
            "status": log.status_after.value if log.status_after else "",
            "timestamp": log.created_at.isoformat() if log.created_at else "",
        })

    return RepDashboardResponse(
        rep_id=rep_id,
        rep_name=rep.full_name,
        total_calls=total_calls,
        total_deals=total_deals,
        success_rate=round((total_deals / total_calls * 100) if total_calls else 0, 1),
        commission_owed=float(commission),
        leads_assigned=leads_assigned,
        pipeline_stages=pipeline_stages,
        recent_activity=recent_activity,
    )


async def get_recent_activity(db: AsyncSession) -> list[RecentActivityItem]:
    """Return the last 20 call logs across all reps with lead business_name and rep full_name."""
    result = await db.execute(
        select(CallLog, Lead.business_name, User.full_name)
        .join(Lead, CallLog.lead_id == Lead.id)
        .join(User, CallLog.rep_id == User.id)
        .order_by(CallLog.created_at.desc())
        .limit(20)
    )
    items = []
    for log, business_name, rep_name in result:
        items.append(RecentActivityItem(
            id=log.id,
            type="call",
            rep_name=rep_name,
            business_name=business_name,
            timestamp=log.created_at.isoformat() if log.created_at else "",
        ))
    return items
