from pydantic import BaseModel
from typing import Optional


class KPIResponse(BaseModel):
    total_calls: int = 0
    total_deals: int = 0
    success_rate: float = 0.0
    total_commission_owed: float = 0.0
    total_leads: int = 0
    active_reps: int = 0


class RepMetric(BaseModel):
    rep_id: int
    rep_name: str
    total_calls: int = 0
    deals_closed: int = 0
    success_rate: float = 0.0
    commission_owed: float = 0.0
    leads_assigned: int = 0


class StatusDistribution(BaseModel):
    status: str
    count: int


class DashboardResponse(BaseModel):
    kpi: KPIResponse
    by_rep: list[RepMetric]
    status_distribution: list[StatusDistribution]


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
