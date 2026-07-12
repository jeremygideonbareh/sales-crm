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
