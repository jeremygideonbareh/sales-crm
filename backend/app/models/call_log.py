from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.sql import func

from ..database import Base
from .lead import LeadStatus


class CallLog(Base):
    __tablename__ = "call_logs"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False, index=True)
    rep_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status_before = Column(SAEnum(LeadStatus), nullable=True)
    status_after = Column(SAEnum(LeadStatus), nullable=False)
    notes = Column(Text, nullable=True)
    call_duration_seconds = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
