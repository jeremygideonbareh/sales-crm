from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.sql import func
import enum

from ..database import Base


class HandoverStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"


class Handover(Base):
    __tablename__ = "handovers"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False, index=True)
    handed_over_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)
    handover_details = Column(Text, nullable=True)
    status = Column(SAEnum(HandoverStatus), nullable=False, default=HandoverStatus.PENDING)
    client_brief = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    design_preferences = Column(Text, nullable=True)
    budget = Column(Integer, nullable=True)
    timeline_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
