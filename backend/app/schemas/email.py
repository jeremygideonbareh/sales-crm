from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SequenceStepCreate(BaseModel):
    step_order: int
    step_type: str
    delay_days: Optional[int] = None
    email_subject: Optional[str] = None
    email_body: Optional[str] = None
    condition_field: Optional[str] = None
    condition_value: Optional[str] = None
    target_stage: Optional[str] = None
    notify_role: Optional[str] = None


class SequenceStepResponse(BaseModel):
    id: int
    sequence_id: int
    step_order: int
    step_type: str
    delay_days: Optional[int] = None
    email_subject: Optional[str] = None
    email_body: Optional[str] = None
    condition_field: Optional[str] = None
    condition_value: Optional[str] = None
    target_stage: Optional[str] = None
    notify_role: Optional[str] = None

    model_config = {"from_attributes": True}


class EmailSequenceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    trigger: str = "manual"
    trigger_stage: Optional[str] = None
    steps: list[SequenceStepCreate] = []


class EmailSequenceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    trigger: Optional[str] = None
    trigger_stage: Optional[str] = None
    is_active: Optional[bool] = None


class EmailSequenceResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    trigger: str
    trigger_stage: Optional[str] = None
    is_active: bool
    created_by: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    steps: list[SequenceStepResponse] = []

    model_config = {"from_attributes": True}


class EmailLogResponse(BaseModel):
    id: int
    sequence_id: Optional[int] = None
    step_id: Optional[int] = None
    lead_id: int
    sent_by: Optional[int] = None
    recipient_email: str
    subject: str
    status: str
    opened_at: Optional[datetime] = None
    clicked_at: Optional[datetime] = None
    replied_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
