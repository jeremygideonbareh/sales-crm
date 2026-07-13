from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.sql import func
import enum

from ..database import Base


class NotificationType(str, enum.Enum):
    DEMO_CREATED = "demo_created"
    DEMO_COMPLETED = "demo_completed"
    DEMO_SCHEDULED = "demo_scheduled"
    HANDOVER_CREATED = "handover_created"
    HANDOVER_COMPLETED = "handover_completed"
    DEAL_CLOSED = "deal_closed"
    LEAD_ASSIGNED = "lead_assigned"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(SAEnum(NotificationType), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=True)
    link = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
