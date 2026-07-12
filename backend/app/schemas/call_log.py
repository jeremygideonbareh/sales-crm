from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CallLogResponse(BaseModel):
    id: int
    lead_id: int
    rep_id: int
    status_before: Optional[str] = None
    status_after: Optional[str] = None
    notes: Optional[str] = None
    call_duration_seconds: Optional[int] = None
    created_at: Optional[datetime] = None
    business_name: Optional[str] = None

    model_config = {"from_attributes": True}
