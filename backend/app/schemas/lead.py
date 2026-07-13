from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from ..models.lead import LeadStatus


class LeadResponse(BaseModel):
    id: int
    business_name: str
    contact_name: str
    phone: str
    email: Optional[str] = None
    website: Optional[str] = None
    notes: Optional[str] = None
    status: str
    assigned_to: Optional[int] = None
    deal_value: Optional[float] = None
    commission: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    deal_value: Optional[float] = None


class AssignRequest(BaseModel):
    lead_ids: list[int]
    rep_id: int


class NextLeadResponse(BaseModel):
    lead: Optional[LeadResponse] = None
    queue_remaining: int = 0


class StatusUpdateRequest(BaseModel):
    status: str
    notes: Optional[str] = None
    deal_value: Optional[float] = None
    call_duration_seconds: Optional[int] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in [s.value for s in LeadStatus]:
            raise ValueError(f"Invalid lead status: {v}")
        return v


class DeleteLeadsRequest(BaseModel):
    lead_ids: list[int]


class LeadListResponse(BaseModel):
    total: int
    leads: list[LeadResponse]
