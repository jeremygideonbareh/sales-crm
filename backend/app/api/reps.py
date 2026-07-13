from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import func

from ..database import get_db
from ..models.user import User
from ..models.lead import Lead, LeadStatus
from ..models.call_log import CallLog
from ..models.demo_request import DemoRequest, DemoStatus
from ..models.handover import Handover, HandoverStatus
from ..schemas.lead import NextLeadResponse, StatusUpdateRequest, LeadResponse, AssignedLeadResponse
from ..schemas.demo import DemoRequestCreate, DemoRequestUpdate, DemoRequestResponse
from ..schemas.handover import HandoverCreate, HandoverResponse
from ..schemas.call_log import CallLogResponse
from ..schemas.analytics import RepDashboardResponse
from ..services.leads import get_next_lead, update_lead_status, get_assigned_leads
from ..services.analytics import get_rep_dashboard
from .deps import get_current_user

router = APIRouter(prefix="/api/reps", tags=["reps"])


@router.get("/assigned-leads", response_model=list[AssignedLeadResponse])
async def assigned_leads(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rows = await get_assigned_leads(db, user.id)
    result = []
    for lead, call_count, last_call_status, last_call_at in rows:
        d = AssignedLeadResponse.model_validate(lead)
        d.call_count = call_count
        d.last_call_status = last_call_status
        d.last_call_at = last_call_at
        result.append(d)
    return result


@router.get("/next-lead", response_model=NextLeadResponse)
async def next_lead(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    lead, remaining = await get_next_lead(db, user.id)
    if not lead:
        return NextLeadResponse(lead=None, queue_remaining=0)
    return NextLeadResponse(
        lead=LeadResponse.model_validate(lead),
        queue_remaining=remaining - 1,
    )


@router.put("/leads/{lead_id}/status", response_model=LeadResponse)
async def update_status(
    lead_id: int,
    req: StatusUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        lead = await update_lead_status(db, lead_id, user.id, req)
        return LeadResponse.model_validate(lead)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- Rep Dashboard ---

@router.get("/dashboard", response_model=RepDashboardResponse)
async def rep_dashboard(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await get_rep_dashboard(db, user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# --- Demo Requests ---

@router.post("/demo-requests", response_model=DemoRequestResponse)
async def create_demo_request(
    req: DemoRequestCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify lead exists and is assigned to this rep
    lead = await db.get(Lead, req.lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if lead.assigned_to != user.id:
        raise HTTPException(status_code=403, detail="Lead not assigned to you")

    demo = DemoRequest(
        lead_id=req.lead_id,
        rep_id=user.id,
        title=req.title,
        description=req.description,
        scheduled_date=req.scheduled_date,
        notes=req.notes,
    )
    db.add(demo)

    # Auto-update lead status to demo_scheduled
    if lead.status in (LeadStatus.INTERESTED, LeadStatus.UN_CALLED, LeadStatus.PITCHING):
        lead.status = LeadStatus.DEMO_SCHEDULED

    await db.commit()
    await db.refresh(demo)
    d = DemoRequestResponse.model_validate(demo)
    d.business_name = lead.business_name
    d.contact_name = lead.contact_name
    return d


@router.get("/demo-requests", response_model=list[DemoRequestResponse])
async def list_demo_requests(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DemoRequest, Lead.business_name, Lead.contact_name)
        .join(Lead, DemoRequest.lead_id == Lead.id)
        .where(DemoRequest.rep_id == user.id)
        .order_by(DemoRequest.created_at.desc())
    )
    demos = []
    for demo, biz_name, contact_name in result:
        d = DemoRequestResponse.model_validate(demo)
        d.business_name = biz_name
        d.contact_name = contact_name
        demos.append(d)
    return demos


@router.put("/demo-requests/{demo_id}", response_model=DemoRequestResponse)
async def update_demo_request(
    demo_id: int,
    req: DemoRequestUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    demo = await db.get(DemoRequest, demo_id)
    if not demo:
        raise HTTPException(status_code=404, detail="Demo request not found")
    if demo.rep_id != user.id:
        raise HTTPException(status_code=403, detail="Not your demo request")

    if req.status is not None:
        new_status = DemoStatus(req.status)
        demo.status = new_status
        if new_status == DemoStatus.COMPLETED:
            demo.completed_date = func.now()

        # Update lead status based on demo completion
        lead = await db.get(Lead, demo.lead_id)
        if lead and new_status == DemoStatus.COMPLETED:
            if lead.status == LeadStatus.DEMO_SCHEDULED:
                lead.status = LeadStatus.DEMO_COMPLETED
                call_log = CallLog(
                    lead_id=demo.lead_id,
                    rep_id=user.id,
                    status_before=LeadStatus.DEMO_SCHEDULED,
                    status_after=LeadStatus.DEMO_COMPLETED,
                    notes="Demo completed",
                )
                db.add(call_log)

    if req.scheduled_date is not None:
        demo.scheduled_date = req.scheduled_date
    if req.notes is not None:
        demo.notes = req.notes

    await db.commit()
    await db.refresh(demo)

    # Fetch lead info
    lead = await db.get(Lead, demo.lead_id)
    d = DemoRequestResponse.model_validate(demo)
    if lead:
        d.business_name = lead.business_name
        d.contact_name = lead.contact_name
    return d


# --- Handovers ---

@router.post("/handovers", response_model=HandoverResponse)
async def create_handover(
    req: HandoverCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    lead = await db.get(Lead, req.lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if lead.assigned_to != user.id:
        raise HTTPException(status_code=403, detail="Lead not assigned to you")

    # Check existing handover
    existing = await db.execute(
        select(Handover).where(Handover.lead_id == req.lead_id).limit(1)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Handover already exists for this lead")

    # Only allow handover from appropriate pipeline stages
    eligible = [
        LeadStatus.DEMO_COMPLETED, LeadStatus.NEGOTIATION,
        LeadStatus.ONBOARDING, LeadStatus.DEPOSIT_PAID,
        LeadStatus.IN_PROGRESS,
    ]
    if lead.status not in eligible:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot handover lead in status '{lead.status.value}'. Must be in: {', '.join(s.value for s in eligible)}"
        )

    handover = Handover(
        lead_id=req.lead_id,
        handed_over_by=user.id,
        notes=req.notes,
        handover_details=req.handover_details,
        client_brief=req.client_brief,
        requirements=req.requirements,
        design_preferences=req.design_preferences,
        budget=req.budget,
        timeline_notes=req.timeline_notes,
    )
    db.add(handover)

    # Update lead status to in_progress to indicate dev team should pick it up
    lead.status = LeadStatus.IN_PROGRESS

    await db.commit()
    await db.refresh(handover)
    h = HandoverResponse.model_validate(handover)
    h.business_name = lead.business_name
    h.contact_name = lead.contact_name
    return h


@router.get("/handovers", response_model=list[HandoverResponse])
async def list_handovers(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Handover, Lead.business_name, Lead.contact_name)
        .join(Lead, Handover.lead_id == Lead.id)
        .where(Handover.handed_over_by == user.id)
        .order_by(Handover.created_at.desc())
    )
    handovers = []
    for h, biz_name, contact_name in result:
        ho = HandoverResponse.model_validate(h)
        ho.business_name = biz_name
        ho.contact_name = contact_name
        handovers.append(ho)
    return handovers


# --- Call Logs ---

HANDOVER_ELIGIBLE_STATUSES = [
    LeadStatus.DEMO_COMPLETED, LeadStatus.NEGOTIATION,
    LeadStatus.ONBOARDING, LeadStatus.DEPOSIT_PAID,
    LeadStatus.IN_PROGRESS,
]


@router.get("/call-logs", response_model=list[CallLogResponse])
async def list_call_logs(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CallLog, Lead.business_name)
        .join(Lead, CallLog.lead_id == Lead.id)
        .where(CallLog.rep_id == user.id)
        .order_by(CallLog.created_at.desc())
        .limit(50)
    )
    logs = []
    for log, business_name in result:
        c = CallLogResponse.model_validate(log)
        c.business_name = business_name
        logs.append(c)
    return logs
