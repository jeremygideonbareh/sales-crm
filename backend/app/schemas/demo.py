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
