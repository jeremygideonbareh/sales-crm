from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    message: Optional[str] = None
    link: Optional[str] = None
    is_read: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UnreadCountResponse(BaseModel):
    count: int
