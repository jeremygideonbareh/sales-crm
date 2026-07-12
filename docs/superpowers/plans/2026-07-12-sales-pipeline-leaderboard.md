# Sales Pipeline, Leaderboard & Demo Request System

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete sales pipeline management system with rep dashboards, leaderboard, demo request workflow, and smooth client handover to dev team.

**Architecture:** Extend the existing FastAPI + React (Vite/TypeScript) CRM with new database models (DemoRequest, Handover), expanded LeadStatus enum for pipeline stages, new API endpoints for rep-specific dashboards and leaderboard, and new frontend pages for reps and managers.

**Tech Stack:** FastAPI (Python), SQLAlchemy (async), SQLite, React 18, TypeScript, Vite, shadcn/ui, Recharts, Tailwind CSS

## Global Constraints

- All new Python models go in `backend/app/models/`
- All new API routers go in `backend/app/api/`
- All new schemas go in `backend/app/schemas/`
- All new frontend pages go in `frontend/src/pages/rep/` or `frontend/src/pages/manager/`
- All new frontend components go in `frontend/src/components/rep/` or appropriate subdir
- Follow existing code patterns exactly
- Immutability: never mutate state, always return new objects
- Error handling at every level with user-friendly messages
- Pipeline stages order: uncalled → no_answer → not_interested → interested → demo_scheduled → demo_completed → negotiation → onboarding → deposit_paid → in_progress → deal_closed
- Environment: sqlite+aiosqlite (no migration needed — SQLAlchemy create_all handles new tables)

---

## File Structure

### New/Modified Backend Files:
- `backend/app/models/lead.py` — Modified: Add new LeadStatus values
- `backend/app/models/demo_request.py` — New: DemoRequest model
- `backend/app/models/handover.py` — New: Handover model
- `backend/app/models/__init__.py` — Modified: Export new models
- `backend/app/schemas/lead.py` — Modified: Add pipeline-related schemas
- `backend/app/schemas/demo.py` — New: Demo request schemas
- `backend/app/schemas/handover.py` — New: Handover schemas
- `backend/app/schemas/analytics.py` — Modified: Add leaderboard schemas
- `backend/app/api/reps.py` — Modified: Add rep dashboard, demo & handover endpoints
- `backend/app/api/analytics.py` — Modified: Add leaderboard endpoint
- `backend/app/api/pipeline.py` — New: Manager pipeline overview endpoint
- `backend/app/services/leads.py` — Modified: Support new status transitions
- `backend/app/services/analytics.py` — Modified: Add leaderboard & rep dashboard logic
- `backend/app/services/pipeline.py` — New: Pipeline service logic
- `backend/app/main.py` — Modified: Register new routers

### New/Modified Frontend Files:
- `frontend/src/types.ts` — Modified: Add new types for pipeline, demo, handover, leaderboard
- `frontend/src/api/client.ts` — Modified: Add new API methods
- `frontend/src/lib/utils.ts` — Modified: Add new pipeline status labels/colors
- `frontend/src/App.tsx` — Modified: Add new routes
- `frontend/src/components/layout/Sidebar.tsx` — Modified: Add navigation items
- `frontend/src/pages/rep/Dashboard.tsx` — New: Rep personal dashboard
- `frontend/src/pages/rep/DemoRequests.tsx` — New: Demo request management
- `frontend/src/pages/rep/Handovers.tsx` — New: Client handover management
- `frontend/src/pages/manager/Leaderboard.tsx` — New: Leaderboard page
- `frontend/src/pages/manager/Dashboard.tsx` — Modified: Enhanced with pipeline view
- `frontend/src/pages/rep/CallingView.tsx` — Modified: Updated pipeline statuses

---

## Tasks

### Task 1: Expand LeadStatus enum and add DemoRequest + Handover models

**Files:**
- Modify: `backend/app/models/lead.py` — Add new statuses
- Create: `backend/app/models/demo_request.py`
- Create: `backend/app/models/handover.py`
- Modify: `backend/app/models/__init__.py` — Export new models
- Modify: `frontend/src/lib/utils.ts` — Add new status labels/colors

**Interfaces:**
- Consumes: Existing `LeadStatus` enum pattern, `Base` from database.py
- Produces: `LeadStatus` with new values, `DemoRequest` model, `Handover` model

- [ ] **Step 1: Expand LeadStatus in backend model**

Edit `backend/app/models/lead.py` — Replace the existing LeadStatus enum with:

```python
class LeadStatus(str, enum.Enum):
    UN_CALLED = "uncalled"
    NO_ANSWER = "no_answer"
    NOT_INTERESTED = "not_interested"
    INTERESTED = "interested"
    DEMO_SCHEDULED = "demo_scheduled"
    DEMO_COMPLETED = "demo_completed"
    NEGOTIATION = "negotiation"
    ONBOARDING = "onboarding"
    DEPOSIT_PAID = "deposit_paid"
    IN_PROGRESS = "in_progress"
    DEAL_CLOSED = "deal_closed"
```

- [ ] **Step 2: Create DemoRequest model**

Create `backend/app/models/demo_request.py`:

```python
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.sql import func
import enum

from ..database import Base


class DemoStatus(str, enum.Enum):
    PENDING = "pending"
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class DemoRequest(Base):
    __tablename__ = "demo_requests"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False, index=True)
    rep_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SAEnum(DemoStatus), nullable=False, default=DemoStatus.PENDING)
    scheduled_date = Column(DateTime(timezone=True), nullable=True)
    completed_date = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

- [ ] **Step 3: Create Handover model**

Create `backend/app/models/handover.py`:

```python
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.sql import func
import enum

from ..database import Base


class HandoverStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"


class Handover(Base):
    __tablename__ = "handovers"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False, index=True)
    handed_over_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)
    handover_details = Column(Text, nullable=True)  # JSON string with handover info
    status = Column(SAEnum(HandoverStatus), nullable=False, default=HandoverStatus.PENDING)
    client_brief = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    design_preferences = Column(Text, nullable=True)
    budget = Column(Integer, nullable=True)
    timeline_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
```

- [ ] **Step 4: Update models __init__**

Edit `backend/app/models/__init__.py`:

```python
from .user import User, UserRole
from .lead import Lead, LeadStatus
from .call_log import CallLog
from .demo_request import DemoRequest, DemoStatus
from .handover import Handover, HandoverStatus
```

- [ ] **Step 5: Update frontend utils with new statuses**

Edit `frontend/src/lib/utils.ts` — Replace LEAD_STATUS with:

```typescript
export const LEAD_STATUS = {
  uncalled: { label: 'Uncalled', color: 'text-muted-foreground', bg: 'bg-muted' },
  no_answer: { label: 'No Answer', color: 'text-amber-400', bg: 'bg-amber-900/20' },
  not_interested: { label: 'Not Interested', color: 'text-red-400', bg: 'bg-red-900/20' },
  interested: { label: 'Interested', color: 'text-sky-400', bg: 'bg-sky-900/20' },
  demo_scheduled: { label: 'Demo Scheduled', color: 'text-purple-400', bg: 'bg-purple-900/20' },
  demo_completed: { label: 'Demo Completed', color: 'text-indigo-400', bg: 'bg-indigo-900/20' },
  negotiation: { label: 'Negotiation', color: 'text-orange-400', bg: 'bg-orange-900/20' },
  onboarding: { label: 'Onboarding', color: 'text-teal-400', bg: 'bg-teal-900/20' },
  deposit_paid: { label: 'Deposit Paid', color: 'text-emerald-400', bg: 'bg-emerald-900/20' },
  in_progress: { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-900/20' },
  deal_closed: { label: 'Deal Closed', color: 'text-emerald-400', bg: 'bg-emerald-900/20' },
} as const
```

- [ ] **Step 6: Commit**

---

### Task 2: Create new schemas for Demo, Handover, Pipeline, and Leaderboard

**Files:**
- Create: `backend/app/schemas/demo.py`
- Create: `backend/app/schemas/handover.py`
- Modify: `backend/app/schemas/analytics.py` — Add LeaderboardEntry
- Modify: `backend/app/schemas/lead.py` — Add PipelineStage and PipelineOverview
- Modify: `frontend/src/types.ts` — Add frontend types

**Interfaces:**
- Consumes: Models from Task 1
- Produces: Pydantic schemas for all new endpoints

- [ ] **Step 1: Create demo schemas**

Create `backend/app/schemas/demo.py`:

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DemoRequestCreate(BaseModel):
    lead_id: int
    title: str
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    notes: Optional[str] = None


class DemoRequestUpdate(BaseModel):
    status: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    notes: Optional[str] = None


class DemoRequestResponse(BaseModel):
    id: int
    lead_id: int
    rep_id: int
    title: str
    description: Optional[str] = None
    status: str
    scheduled_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    business_name: Optional[str] = None
    contact_name: Optional[str] = None

    model_config = {"from_attributes": True}
```

- [ ] **Step 2: Create handover schemas**

Create `backend/app/schemas/handover.py`:

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class HandoverCreate(BaseModel):
    lead_id: int
    notes: Optional[str] = None
    handover_details: Optional[str] = None
    client_brief: Optional[str] = None
    requirements: Optional[str] = None
    design_preferences: Optional[str] = None
    budget: Optional[int] = None
    timeline_notes: Optional[str] = None


class HandoverResponse(BaseModel):
    id: int
    lead_id: int
    handed_over_by: int
    assigned_to: Optional[int] = None
    notes: Optional[str] = None
    handover_details: Optional[str] = None
    status: str
    client_brief: Optional[str] = None
    requirements: Optional[str] = None
    design_preferences: Optional[str] = None
    budget: Optional[int] = None
    timeline_notes: Optional[str] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    business_name: Optional[str] = None
    contact_name: Optional[str] = None

    model_config = {"from_attributes": True}
```

- [ ] **Step 3: Add LeaderboardEntry to analytics schema**

Edit `backend/app/schemas/analytics.py` — Add after existing types:

```python
class LeaderboardEntry(BaseModel):
    rep_id: int
    rep_name: str
    deals_closed: int
    total_commission: float
    success_rate: float
    total_calls: int
    total_leads_assigned: int
    active_pipeline_count: int
    rank: int


class LeaderboardResponse(BaseModel):
    entries: list[LeaderboardEntry]


class RepDashboardResponse(BaseModel):
    rep_id: int
    rep_name: str
    total_calls: int
    total_deals: int
    success_rate: float
    commission_owed: float
    leads_assigned: int
    pipeline_stages: list[StatusDistribution]
    recent_activity: list


class PipelineStage(BaseModel):
    status: str
    label: str
    count: int
    leads: list


class PipelineOverviewResponse(BaseModel):
    stages: list[PipelineStage]
```

- [ ] **Step 4: Update frontend types**

Edit `frontend/src/types.ts` — Add new types:

```typescript
// Pipeline stages
export type PipelineStatus =
  | 'uncalled' | 'no_answer' | 'not_interested' | 'interested'
  | 'demo_scheduled' | 'demo_completed' | 'negotiation'
  | 'onboarding' | 'deposit_paid' | 'in_progress' | 'deal_closed'

// Demo Request
export interface DemoRequestResponse {
  id: number
  lead_id: number
  rep_id: number
  title: string
  description: string | null
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled'
  scheduled_date: string | null
  completed_date: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
  business_name: string | null
  contact_name: string | null
}

// Handover
export interface HandoverResponse {
  id: number
  lead_id: number
  handed_over_by: number
  assigned_to: number | null
  notes: string | null
  handover_details: string | null
  status: 'pending' | 'completed'
  client_brief: string | null
  requirements: string | null
  design_preferences: string | null
  budget: number | null
  timeline_notes: string | null
  created_at: string | null
  completed_at: string | null
  business_name: string | null
  contact_name: string | null
}

// Leaderboard
export interface LeaderboardEntry {
  rep_id: number
  rep_name: string
  deals_closed: number
  total_commission: number
  success_rate: number
  total_calls: number
  total_leads_assigned: number
  active_pipeline_count: number
  rank: number
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[]
}

// Rep Dashboard
export interface RepDashboardResponse {
  rep_id: number
  rep_name: string
  total_calls: number
  total_deals: number
  success_rate: number
  commission_owed: number
  leads_assigned: number
  pipeline_stages: StatusDistribution[]
  recent_activity: Array<{
    id: number
    type: string
    business_name: string
    status: string
    timestamp: string
  }>
}

// Pipeline overview for manager
export interface PipelineStageItem {
  status: string
  label: string
  count: number
  leads: LeadResponse[]
}

export interface PipelineOverviewResponse {
  stages: PipelineStageItem[]
}
```

- [ ] **Step 5: Commit**

---

### Task 3: Build backend services — Rep dashboard, leaderboard, pipeline

**Files:**
- Modify: `backend/app/services/analytics.py` — Add leaderboard & rep dashboard queries
- Create: `backend/app/services/pipeline.py` — Pipeline overview service
- Modify: `backend/app/services/leads.py` — Handle new status transitions

**Interfaces:**
- Consumes: Models from Task 1, schemas from Task 2
- Produces: Service functions for Task 4 API endpoints

- [ ] **Step 1: Add leaderboard service to analytics.py**

Edit `backend/app/services/analytics.py` — Add imports and these functions at the end:

```python
from ..models.demo_request import DemoRequest
from ..models.handover import Handover

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
            rank=0,  # Will be computed below
        ))

    # Sort by deals_closed desc, assign ranks
    entries.sort(key=lambda e: e.deals_closed, reverse=True)
    for i, entry in enumerate(entries):
        entry.rank = i + 1

    return entries


async def get_rep_dashboard(db: AsyncSession, rep_id: int) -> RepDashboardResponse:
    rep = await db.get(User, rep_id)

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
```

Also add the imports for the new types at the top of the file:
```python
from ..schemas.analytics import (
    KPIResponse, RepMetric, StatusDistribution, DashboardResponse,
    LeaderboardEntry, LeaderboardResponse, RepDashboardResponse
)
```

- [ ] **Step 2: Create pipeline service**

Create `backend/app/services/pipeline.py`:

```python
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.lead import Lead, LeadStatus
from ..models.user import User, UserRole
from ..schemas.analytics import PipelineStage, PipelineOverviewResponse
from ..schemas.lead import LeadResponse


PIPELINE_LABELS = {
    "uncalled": "Uncalled",
    "no_answer": "No Answer",
    "not_interested": "Not Interested",
    "interested": "Interested",
    "demo_scheduled": "Demo Scheduled",
    "demo_completed": "Demo Completed",
    "negotiation": "Negotiation",
    "onboarding": "Onboarding",
    "deposit_paid": "Deposit Paid",
    "in_progress": "In Progress",
    "deal_closed": "Deal Closed",
}

PIPELINE_ORDER = [
    LeadStatus.UN_CALLED, LeadStatus.NO_ANSWER, LeadStatus.NOT_INTERESTED,
    LeadStatus.INTERESTED, LeadStatus.DEMO_SCHEDULED, LeadStatus.DEMO_COMPLETED,
    LeadStatus.NEGOTIATION, LeadStatus.ONBOARDING, LeadStatus.DEPOSIT_PAID,
    LeadStatus.IN_PROGRESS, LeadStatus.DEAL_CLOSED,
]


async def get_pipeline_overview(db: AsyncSession) -> PipelineOverviewResponse:
    stages = []
    for status in PIPELINE_ORDER:
        leads = (
            await db.execute(
                select(Lead).where(Lead.status == status).order_by(Lead.updated_at.desc().nullslast())
            )
        ).scalars().all()

        stage = PipelineStage(
            status=status.value,
            label=PIPELINE_LABELS.get(status.value, status.value),
            count=len(leads),
            leads=[LeadResponse.model_validate(l) for l in leads],
        )
        stages.append(stage)

    return PipelineOverviewResponse(stages=stages)
```

- [ ] **Step 3: Commit**

---

### Task 4: Create backend API endpoints

**Files:**
- Modify: `backend/app/api/reps.py` — Add dashboard, demo request, handover endpoints
- Modify: `backend/app/api/analytics.py` — Add leaderboard endpoint
- Create: `backend/app/api/pipeline.py` — Pipeline overview endpoint
- Modify: `backend/app/main.py` — Register new routers

**Interfaces:**
- Consumes: Service functions from Task 3, schemas from Task 2
- Produces: HTTP API endpoints consumed by frontend

- [ ] **Step 1: Add rep dashboard, demo, and handover endpoints**

Edit `backend/app/api/reps.py` — Replace entire file with:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.user import User
from ..models.lead import Lead, LeadStatus
from ..models.demo_request import DemoRequest, DemoStatus
from ..models.handover import Handover, HandoverStatus
from ..schemas.lead import NextLeadResponse, StatusUpdateRequest, LeadResponse
from ..schemas.demo import DemoRequestCreate, DemoRequestUpdate, DemoRequestResponse
from ..schemas.handover import HandoverCreate, HandoverResponse
from ..schemas.analytics import RepDashboardResponse
from ..services.leads import get_next_lead, update_lead_status
from ..services.analytics import get_rep_dashboard
from .deps import get_current_user

router = APIRouter(prefix="/api/reps", tags=["reps"])


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
    return await get_rep_dashboard(db, user.id)


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
    if req.scheduled_date and lead.status in (LeadStatus.INTERESTED, LeadStatus.UN_CALLED, LeadStatus.PITCHING):
        lead.status = LeadStatus.DEMO_SCHEDULED

    await db.commit()
    await db.refresh(demo)
    return DemoRequestResponse.model_validate(demo)


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
```

- [ ] **Step 2: Add leaderboard endpoint to analytics.py**

Edit `backend/app/api/analytics.py` — Replace entire file with:

```python
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
```

- [ ] **Step 3: Create pipeline API endpoint**

Create `backend/app/api/pipeline.py`:

```python
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
```

- [ ] **Step 4: Register new routers in main.py**

Edit `backend/app/main.py` — Add imports and include:

```python
from .api.pipeline import router as pipeline_router

# ... after other includes
app.include_router(pipeline_router)
```

- [ ] **Step 5: Commit**

---

### Task 5: Update frontend API client with new methods

**Files:**
- Modify: `frontend/src/api/client.ts` — Add new API methods

- [ ] **Step 1: Add new API methods**

Edit `frontend/src/api/client.ts` — Add after existing exports:

```typescript
export const repsApi = {
  nextLead: () => api.get('/reps/next-lead').then((r) => r.data),
  updateStatus: (leadId: number, data: { status: string; notes?: string; deal_value?: number }) =>
    api.put(`/reps/leads/${leadId}/status`, data).then((r) => r.data),
  dashboard: () => api.get('/reps/dashboard').then((r) => r.data),
  demoRequests: {
    list: () => api.get('/reps/demo-requests').then((r) => r.data),
    create: (data: {
      lead_id: number
      title: string
      description?: string
      scheduled_date?: string
      notes?: string
    }) => api.post('/reps/demo-requests', data).then((r) => r.data),
    update: (id: number, data: { status?: string; scheduled_date?: string; notes?: string }) =>
      api.put(`/reps/demo-requests/${id}`, data).then((r) => r.data),
  },
  handovers: {
    list: () => api.get('/reps/handovers').then((r) => r.data),
    create: (data: {
      lead_id: number
      notes?: string
      handover_details?: string
      client_brief?: string
      requirements?: string
      design_preferences?: string
      budget?: number
      timeline_notes?: string
    }) => api.post('/reps/handovers', data).then((r) => r.data),
  },
}

export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard').then((r) => r.data),
  leaderboard: () => api.get('/analytics/leaderboard').then((r) => r.data),
}

export const pipelineApi = {
  overview: () => api.get('/pipeline/overview').then((r) => r.data),
}
```

- [ ] **Step 2: Commit**

---

### Task 6: Create Rep Dashboard page

**Files:**
- Create: `frontend/src/pages/rep/Dashboard.tsx`
- Modify: `frontend/src/App.tsx` — Add route
- Modify: `frontend/src/components/layout/Sidebar.tsx` — Add nav items

- [ ] **Step 1: Create Rep Dashboard component**

Create `frontend/src/pages/rep/Dashboard.tsx`:

```tsx
import { useEffect, useState } from "react"
import {
  PhoneCall,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  BarChart3,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { repsApi } from "@/api/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/layout/PageHeader"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { Skeleton } from "@/components/ui/skeleton"
import { LEAD_STATUS } from "@/lib/utils"
import type { RepDashboardResponse } from "@/types"

const COLORS = ["#64748b", "#fbbf24", "#f87171", "#60a5fa", "#34d399", "#a78bfa", "#f472b6", "#22d3ee", "#fb923c", "#4ade80", "#38bdf8"]

export default function RepDashboard() {
  const [data, setData] = useState<RepDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    repsApi
      .dashboard()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const stageChartData = data.pipeline_stages.map((s) => ({
    name: LEAD_STATUS[s.status as keyof typeof LEAD_STATUS]?.label || s.status,
    count: s.count,
    fill: COLORS[Object.keys(LEAD_STATUS).indexOf(s.status) % COLORS.length],
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Dashboard"
        description={`${data.rep_name} — Track your progress`}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Calls"
          value={data.total_calls}
          icon={PhoneCall}
          colorClass="bg-emerald-900/30 text-emerald-400"
        />
        <KpiCard
          title="Success Rate"
          value={data.success_rate}
          icon={TrendingUp}
          format="percentage"
          colorClass="bg-blue-900/30 text-blue-400"
        />
        <KpiCard
          title="Deals Closed"
          value={data.total_deals}
          icon={BarChart3}
          colorClass="bg-amber-900/30 text-amber-400"
        />
        <KpiCard
          title="Commission"
          value={data.commission_owed}
          icon={DollarSign}
          format="currency"
          colorClass="bg-purple-900/30 text-purple-400"
        />
      </div>

      {/* Pipeline Stages Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            My Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stageChartData.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No pipeline data yet. Start calling leads!
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.3} />
                  <XAxis dataKey="name" className="text-xs text-muted-foreground" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis className="text-xs text-muted-foreground" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Leads">
                    {stageChartData.map((entry, i) => (
                      <rect key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pipeline Stages List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.pipeline_stages.map((stage) => {
          const statusConfig = LEAD_STATUS[stage.status as keyof typeof LEAD_STATUS]
          return (
            <Card key={stage.status}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{statusConfig?.label || stage.status}</CardTitle>
                  <Badge variant="secondary" className={statusConfig?.bg + " " + statusConfig?.color}>
                    {stage.count}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${statusConfig?.color.replace('text-', 'bg-')}`}
                    style={{
                      width: `${Math.min(100, (stage.count / Math.max(1, data.leads_assigned)) * 100)}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recent_activity.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {data.recent_activity.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      LEAD_STATUS[a.status as keyof typeof LEAD_STATUS]?.color || 'text-muted-foreground'
                    } bg-current`} />
                    <span className="text-sm font-medium">{a.business_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className={
                      (LEAD_STATUS[a.status as keyof typeof LEAD_STATUS]?.bg || 'bg-muted') + ' ' +
                      (LEAD_STATUS[a.status as keyof typeof LEAD_STATUS]?.color || 'text-muted-foreground')
                    }>
                      {LEAD_STATUS[a.status as keyof typeof LEAD_STATUS]?.label || a.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {a.timestamp ? new Date(a.timestamp).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Update Sidebar with new nav items**

Edit `frontend/src/components/layout/Sidebar.tsx` — Update navItems:

```typescript
const navItems = isManager
  ? [
      { to: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/manager/leads", label: "Leads", icon: Users },
      { to: "/manager/leaderboard", label: "Leaderboard", icon: BarChart3 },
    ]
  : [
      { to: "/rep/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/rep/calling", label: "Calling", icon: PhoneCall },
      { to: "/rep/demos", label: "Demo Requests", icon: Calendar },
      { to: "/rep/handovers", label: "Handovers", icon: ArrowRightLeft },
    ]
```

Also add the missing imports at the top of Sidebar.tsx:
```typescript
import {
  LayoutDashboard, Users, PhoneCall, LogOut, ChevronLeft, Menu, X,
  BarChart3, Calendar, ArrowRightLeft,
} from "lucide-react"
```

Replace existing navItems and imports accordingly.

- [ ] **Step 3: Update App.tsx with new routes**

Edit `frontend/src/App.tsx` — Add imports and routes:

```typescript
import RepDashboard from "@/pages/rep/Dashboard"
import RepDemoRequests from "@/pages/rep/DemoRequests"
import RepHandovers from "@/pages/rep/Handovers"
import ManagerLeaderboard from "@/pages/manager/Leaderboard"

// In AppLayout, add routes:
<Route path="/rep/dashboard" element={<RepDashboard />} />
<Route path="/rep/demos" element={<RepDemoRequests />} />
<Route path="/rep/handovers" element={<RepHandovers />} />
<Route path="/manager/leaderboard" element={<ManagerLeaderboard />} />
```

- [ ] **Step 4: Commit**

---

### Task 7: Create Rep Demo Requests page

**Files:**
- Create: `frontend/src/pages/rep/DemoRequests.tsx`

- [ ] **Step 1: Create DemoRequests page**

Create `frontend/src/pages/rep/DemoRequests.tsx`:

```tsx
import { useEffect, useState } from "react"
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
} from "lucide-react"
import { repsApi, leadsApi } from "@/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/layout/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import type { DemoRequestResponse, LeadResponse } from "@/types"

const DEMO_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-900/20" },
  scheduled: { label: "Scheduled", color: "text-blue-400", bg: "bg-blue-900/20" },
  completed: { label: "Completed", color: "text-emerald-400", bg: "bg-emerald-900/20" },
  cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-900/20" },
}

export default function DemoRequests() {
  const [demos, setDemos] = useState<DemoRequestResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [leads, setLeads] = useState<LeadResponse[]>([])
  const [form, setForm] = useState({
    lead_id: "",
    title: "",
    description: "",
    scheduled_date: "",
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchDemos = async () => {
    setLoading(true)
    try {
      const data = await repsApi.demoRequests.list()
      setDemos(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDemos()
  }, [])

  const openCreate = async () => {
    // Fetch leads that are in interested or further stages
    const data = await leadsApi.list({ limit: 200 })
    setLeads(data.leads || [])
    setShowCreate(true)
  }

  const handleCreate = async () => {
    if (!form.lead_id || !form.title) {
      toast({ title: "Please fill in required fields", variant: "warning" })
      return
    }
    setSubmitting(true)
    try {
      await repsApi.demoRequests.create({
        lead_id: parseInt(form.lead_id),
        title: form.title,
        description: form.description || undefined,
        scheduled_date: form.scheduled_date || undefined,
        notes: form.notes || undefined,
      })
      toast({ title: "Demo request created", variant: "success" })
      setShowCreate(false)
      setForm({ lead_id: "", title: "", description: "", scheduled_date: "", notes: "" })
      fetchDemos()
    } catch {
      toast({ title: "Failed to create demo request", variant: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  const updateStatus = async (demoId: number, status: string) => {
    try {
      await repsApi.demoRequests.update(demoId, { status })
      toast({ title: `Demo marked as ${status}`, variant: "success" })
      fetchDemos()
    } catch {
      toast({ title: "Failed to update demo", variant: "error" })
    }
  }

  const statusBadge = (status: string) => {
    const cfg = DEMO_STATUS_CONFIG[status] || { label: status, color: "text-muted-foreground", bg: "bg-muted" }
    return <Badge variant="secondary" className={`${cfg.bg} ${cfg.color}`}>{cfg.label}</Badge>
  }

  if (loading && demos.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Demo Requests" description="Request and manage client demos">
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" />
          New Demo Request
        </Button>
      </PageHeader>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request a Demo Build</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client *</label>
              <Select
                value={form.lead_id}
                onValueChange={(v) => setForm({ ...form, lead_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {leads.filter(l => l.status !== 'deal_closed' && l.status !== 'not_interested')
                    .map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.business_name} — {l.contact_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Demo Title *</label>
              <Input
                placeholder="e.g. Website Demo - Homepage & Contact"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                placeholder="What should the demo include? Key pages, features..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="field-sizing-content min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Scheduled Date</label>
              <Input
                type="datetime-local"
                value={form.scheduled_date}
                onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                placeholder="Any additional notes for the demo builder..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="field-sizing-content min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              />
            </div>
            <Button onClick={handleCreate} disabled={submitting} className="w-full">
              <Send className="h-4 w-4" />
              Submit Demo Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Demo List */}
      {demos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Calendar className="mx-auto mb-3 h-12 w-12 opacity-30" />
            <p className="text-lg font-medium">No demo requests yet</p>
            <p className="mt-1 text-sm">Create a demo request when a client is interested</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {demos.map((demo) => (
            <Card key={demo.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{demo.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {demo.business_name} — {demo.contact_name}
                    </p>
                  </div>
                  {statusBadge(demo.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {demo.description && <p className="text-sm">{demo.description}</p>}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {demo.scheduled_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(demo.scheduled_date).toLocaleDateString()}
                    </span>
                  )}
                  {demo.completed_date && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Completed: {new Date(demo.completed_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {demo.status === 'pending' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(demo.id, 'scheduled')}>
                        <Calendar className="h-3 w-3" />
                        Schedule
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(demo.id, 'cancelled')}>
                        <XCircle className="h-3 w-3" />
                        Cancel
                      </Button>
                    </>
                  )}
                  {demo.status === 'scheduled' && (
                    <Button size="sm" variant="default" onClick={() => updateStatus(demo.id, 'completed')}>
                      <CheckCircle2 className="h-3 w-3" />
                      Mark Completed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

---

### Task 8: Create Rep Handovers page

**Files:**
- Create: `frontend/src/pages/rep/Handovers.tsx`

- [ ] **Step 1: Create Handovers page**

Create `frontend/src/pages/rep/Handovers.tsx`:

```tsx
import { useEffect, useState } from "react"
import {
  Send,
  CheckCircle2,
  FileText,
  DollarSign,
  UserCheck,
} from "lucide-react"
import { repsApi, leadsApi } from "@/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/layout/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import type { HandoverResponse, LeadResponse } from "@/types"

export default function Handovers() {
  const [handovers, setHandovers] = useState<HandoverResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [leads, setLeads] = useState<LeadResponse[]>([])
  const [form, setForm] = useState({
    lead_id: "",
    client_brief: "",
    requirements: "",
    design_preferences: "",
    budget: "",
    timeline_notes: "",
    notes: "",
    handover_details: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchHandovers = async () => {
    setLoading(true)
    try {
      const data = await repsApi.handovers.list()
      setHandovers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHandovers()
  }, [])

  const openCreate = async () => {
    const data = await leadsApi.list({ limit: 200 })
    // Show leads that are in onboarding, deposit_paid, or negotiation stages
    const pipelineLeads = (data.leads || []).filter(
      (l: LeadResponse) => ['onboarding', 'deposit_paid', 'negotiation', 'interested', 'demo_completed'].includes(l.status)
    )
    setLeads(pipelineLeads)
    setShowCreate(true)
  }

  const handleCreate = async () => {
    if (!form.lead_id) {
      toast({ title: "Please select a client", variant: "warning" })
      return
    }
    setSubmitting(true)
    try {
      await repsApi.handovers.create({
        lead_id: parseInt(form.lead_id),
        client_brief: form.client_brief || undefined,
        requirements: form.requirements || undefined,
        design_preferences: form.design_preferences || undefined,
        budget: form.budget ? parseInt(form.budget) : undefined,
        timeline_notes: form.timeline_notes || undefined,
        notes: form.notes || undefined,
        handover_details: form.handover_details || undefined,
      })
      toast({ title: "Client handed over to dev team!", variant: "success" })
      setShowCreate(false)
      setForm({
        lead_id: "", client_brief: "", requirements: "", design_preferences: "",
        budget: "", timeline_notes: "", notes: "", handover_details: "",
      })
      fetchHandovers()
    } catch {
      toast({ title: "Failed to create handover", variant: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && handovers.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Client Handovers" description="Handover clients to the development team">
        <Button onClick={openCreate} size="sm">
          <Send className="h-4 w-4" />
          New Handover
        </Button>
      </PageHeader>

      {/* Create Handover Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Handover Client to Dev Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client *</label>
              <Select value={form.lead_id} onValueChange={(v) => setForm({ ...form, lead_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client to handover" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.business_name} — {l.contact_name} (${l.deal_value || 'TBD'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client Brief</label>
                <textarea
                  placeholder="Describe the client, their business, goals..."
                  value={form.client_brief}
                  onChange={(e) => setForm({ ...form, client_brief: e.target.value })}
                  className="field-sizing-content min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Technical Requirements</label>
                <textarea
                  placeholder="Tech stack, integrations, features needed..."
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  className="field-sizing-content min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Design Preferences</label>
                <textarea
                  placeholder="Colors, style, references, examples..."
                  value={form.design_preferences}
                  onChange={(e) => setForm({ ...form, design_preferences: e.target.value })}
                  className="field-sizing-content min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Timeline Notes</label>
                <textarea
                  placeholder="Deadlines, milestones, priorities..."
                  value={form.timeline_notes}
                  onChange={(e) => setForm({ ...form, timeline_notes: e.target.value })}
                  className="field-sizing-content min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Budget ($)</label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Notes</label>
                <textarea
                  placeholder="Anything else the dev team should know..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="field-sizing-content min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                />
              </div>
            </div>

            <Button onClick={handleCreate} disabled={submitting} className="w-full">
              <UserCheck className="h-4 w-4" />
              Handover to Dev Team
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Handover List */}
      {handovers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="mx-auto mb-3 h-12 w-12 opacity-30" />
            <p className="text-lg font-medium">No handovers yet</p>
            <p className="mt-1 text-sm">Handover clients to the dev team once they're ready</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {handovers.map((h) => (
            <Card key={h.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{h.business_name || `Client #${h.lead_id}`}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{h.contact_name}</p>
                  </div>
                  <Badge variant="secondary" className={
                    h.status === 'completed'
                      ? 'bg-emerald-900/20 text-emerald-400'
                      : 'bg-amber-900/20 text-amber-400'
                  }>
                    {h.status === 'completed' ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  {h.client_brief && (
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client Brief</p>
                      <p className="text-sm">{h.client_brief}</p>
                    </div>
                  )}
                  {h.requirements && (
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Requirements</p>
                      <p className="text-sm">{h.requirements}</p>
                    </div>
                  )}
                  {h.budget && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted/30 p-3">
                      <DollarSign className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm font-medium">Budget: ${h.budget.toLocaleString()}</span>
                    </div>
                  )}
                  {h.timeline_notes && (
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timeline</p>
                      <p className="text-sm">{h.timeline_notes}</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Created: {h.created_at ? new Date(h.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

---

### Task 9: Create Manager Leaderboard page

**Files:**
- Create: `frontend/src/pages/manager/Leaderboard.tsx`

- [ ] **Step 1: Create Leaderboard page**

Create `frontend/src/pages/manager/Leaderboard.tsx`:

```tsx
import { useEffect, useState } from "react"
import {
  Trophy,
  Medal,
  PhoneCall,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react"
import { analyticsApi } from "@/api/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { PageHeader } from "@/components/layout/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import type { LeaderboardEntry } from "@/types"

const RANK_COLORS = [
  { bg: "bg-amber-900/30", text: "text-amber-400", icon: "🥇" },
  { bg: "bg-slate-600/30", text: "text-slate-300", icon: "🥈" },
  { bg: "bg-orange-900/30", text: "text-orange-400", icon: "🥉" },
]

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span className="text-2xl" role="img" aria-label={`Rank ${rank}`}>
        {RANK_COLORS[rank - 1]?.icon || `#${rank}`}
      </span>
    )
  }
  return (
    <Badge variant="secondary" className="font-mono text-sm">
      #{rank}
    </Badge>
  )
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'deals' | 'commission' | 'rate'>('deals')

  useEffect(() => {
    setLoading(true)
    analyticsApi
      .leaderboard()
      .then((data) => setEntries(data.entries))
      .finally(() => setLoading(false))
  }, [])

  const sorted = [...entries].sort((a, b) => {
    switch (sortBy) {
      case 'commission': return b.total_commission - a.total_commission
      case 'rate': return b.success_rate - a.success_rate
      default: return b.deals_closed - a.deals_closed
    }
  }).map((e, i) => ({ ...e, rank: i + 1 }))

  if (loading && entries.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leaderboard"
        description="Who's closing the most deals"
      >
        <div className="flex items-center gap-2">
          <Button
            variant={sortBy === 'deals' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('deals')}
          >
            <Trophy className="h-4 w-4" />
            Deals
          </Button>
          <Button
            variant={sortBy === 'commission' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('commission')}
          >
            <DollarSign className="h-4 w-4" />
            Commission
          </Button>
          <Button
            variant={sortBy === 'rate' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('rate')}
          >
            <TrendingUp className="h-4 w-4" />
            Success Rate
          </Button>
        </div>
      </PageHeader>

      {/* Podium for top 3 */}
      <div className="grid gap-4 sm:grid-cols-3">
        {sorted.slice(0, 3).map((entry, i) => (
          <Card key={entry.rep_id} className={`relative overflow-hidden ${RANK_COLORS[i]?.bg || ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{entry.rep_name}</CardTitle>
                <RankBadge rank={entry.rank} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold">{entry.deals_closed}</p>
                  <p className="text-xs text-muted-foreground">Deals Closed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">
                    ${entry.total_commission.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Commission</p>
                </div>
                <div>
                  <p className="text-lg font-medium">{entry.total_calls}</p>
                  <p className="text-xs text-muted-foreground">Total Calls</p>
                </div>
                <div>
                  <p className="text-lg font-medium">{entry.success_rate}%</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-emerald-400" />
            Full Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Rep</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Calls</TableHead>
                  <TableHead>Deals</TableHead>
                  <TableHead>Active Pipeline</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((entry) => (
                  <TableRow key={entry.rep_id}>
                    <TableCell>
                      <RankBadge rank={entry.rank} />
                    </TableCell>
                    <TableCell className="font-medium">{entry.rep_name}</TableCell>
                    <TableCell>{entry.total_leads_assigned}</TableCell>
                    <TableCell>{entry.total_calls}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-emerald-900/20 text-emerald-400">
                        {entry.deals_closed}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.active_pipeline_count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${Math.min(100, entry.success_rate)}%` }}
                          />
                        </div>
                        <span className="text-xs">{entry.success_rate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-emerald-400">
                      ${entry.total_commission.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Deals by Rep</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sorted}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.3} />
                <XAxis dataKey="rep_name" className="text-xs text-muted-foreground" tick={{ fontSize: 11 }} />
                <YAxis className="text-xs text-muted-foreground" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                />
                <Bar dataKey="deals_closed" fill="#34d399" radius={[4, 4, 0, 0]} name="Deals" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

---

### Task 10: Update Rep CallingView with new pipeline statuses and update CallingView CallingView.tsx

**Files:**
- Modify: `frontend/src/pages/rep/CallingView.tsx` — Add new outcome options

- [ ] **Step 1: Add new outcomes to CallingView**

Edit `frontend/src/pages/rep/CallingView.tsx` — Update OUTCOMES array to include "Interested" and update accordingly:

Replace the OUTCOMES section with:

```typescript
const OUTCOMES = [
  {
    status: "no_answer",
    label: "No Answer",
    icon: PhoneOff,
    variant: "secondary" as const,
  },
  {
    status: "not_interested",
    label: "Not Interested",
    icon: XCircle,
    variant: "destructive" as const,
  },
  {
    status: "interested",
    label: "Interested",
    icon: ThumbsUp,
    variant: "default" as const,
  },
  {
    status: "pitching",
    label: "Pitching",
    icon: Phone,
    variant: "default" as const,
  },
]

// Add import for ThumbsUp at the top next to other lucide-react imports:
import { ThumbsUp } from "lucide-react"
```

- [ ] **Step 2: Add a note in the CallingView about next steps**

After the lead card, add a small call-to-action banner when the lead is "interested":

Add this after line ~252 (before "Call Outcome" card):

```tsx
{lead.status === "interested" && (
  <Card className="border-sky-800 bg-sky-900/10">
    <CardContent className="flex items-center gap-3 py-4">
      <ThumbsUp className="h-5 w-5 text-sky-400" />
      <div className="flex-1">
        <p className="text-sm font-medium">Client is interested!</p>
        <p className="text-xs text-muted-foreground">
          Go to Demo Requests to schedule a demo for them
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={() => window.location.href = '/rep/demos'}>
        Create Demo
      </Button>
    </CardContent>
  </Card>
)}
```

Also add import for Link or use window.location.

- [ ] **Step 3: Commit**

---

### Task 11: Update Manager Dashboard with pipeline view

**Files:**
- Modify: `frontend/src/pages/manager/Dashboard.tsx` — Add pipeline overview section

- [ ] **Step 1: Add pipeline overview to manager dashboard**

Edit `frontend/src/pages/manager/Dashboard.tsx` — Add import and a new section after the rep performance table:

Add import:
```typescript
import { pipelineApi } from "@/api/client"
import type { PipelineOverviewResponse } from "@/types"
```

Add state:
```typescript
const [pipelineOverview, setPipelineOverview] = useState<PipelineOverviewResponse | null>(null)
```

Add fetch in the useEffect:
```typescript
pipelineApi.overview().then(setPipelineOverview).catch(() => {})
```

Add a new card section after the Rep Performance table (around line 308):

```tsx
{/* Pipeline Overview */}
{pipelineOverview && (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-emerald-400" />
        Sales Pipeline
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {pipelineOverview.stages.map((stage) => (
          <Card key={stage.status} className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {stage.label}
                </p>
                <Badge variant="secondary" className={
                  (LEAD_STATUS[stage.status as keyof typeof LEAD_STATUS]?.bg || 'bg-muted') + ' ' +
                  (LEAD_STATUS[stage.status as keyof typeof LEAD_STATUS]?.color || '')
                }>
                  {stage.count}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {stage.leads.slice(0, 3).map((lead: any) => (
                  <p key={lead.id} className="truncate text-xs text-muted-foreground">
                    {lead.business_name}
                  </p>
                ))}
                {stage.leads.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{stage.leads.length - 3} more
                  </p>
                )}
                {stage.leads.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Empty</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </CardContent>
  </Card>
)}
```

Also add `BarChart3` to imports if not already.

- [ ] **Step 2: Commit**

---

### Task 12: Verify and build

**Files:**
- All files from previous tasks

- [ ] **Step 1: Run backend type check**

```bash
cd backend && python -c "from app.main import app; print('Backend OK')"
```

- [ ] **Step 2: Run frontend build**

```bash
cd frontend && npm run build
```

- [ ] **Step 3: Start backend and test API endpoints**

```bash
cd backend && uvicorn app.main:app --reload
```

Then test endpoints:
- GET /api/analytics/leaderboard
- GET /api/reps/dashboard
- POST /api/reps/demo-requests
- GET /api/pipeline/overview

- [ ] **Step 4: Fix any build errors**

- [ ] **Step 5: Commit final version**
