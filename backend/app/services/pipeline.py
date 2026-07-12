from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.lead import Lead, LeadStatus
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
    "pitching": "Pitching",
}

PIPELINE_ORDER = [
    LeadStatus.UN_CALLED, LeadStatus.NO_ANSWER, LeadStatus.NOT_INTERESTED,
    LeadStatus.PITCHING, LeadStatus.INTERESTED, LeadStatus.DEMO_SCHEDULED,
    LeadStatus.DEMO_COMPLETED, LeadStatus.NEGOTIATION, LeadStatus.ONBOARDING,
    LeadStatus.DEPOSIT_PAID, LeadStatus.IN_PROGRESS, LeadStatus.DEAL_CLOSED,
]


async def get_pipeline_overview(db: AsyncSession) -> PipelineOverviewResponse:
    stages = []
    for status in PIPELINE_ORDER:
        result = await db.execute(
            select(Lead).where(Lead.status == status).order_by(Lead.updated_at.desc().nullslast())
        )
        leads = result.scalars().all()

        stage = PipelineStage(
            status=status.value,
            label=PIPELINE_LABELS.get(status.value, status.value),
            count=len(leads),
            leads=[LeadResponse.model_validate(l) for l in leads],
        )
        stages.append(stage)

    return PipelineOverviewResponse(stages=stages)
