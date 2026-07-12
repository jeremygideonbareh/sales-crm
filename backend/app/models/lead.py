from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SAEnum, Numeric, ForeignKey
from sqlalchemy.sql import func
import enum

from ..database import Base


class LeadStatus(str, enum.Enum):
    UN_CALLED = "uncalled"
    NO_ANSWER = "no_answer"
    NOT_INTERESTED = "not_interested"
    INTERESTED = "interested"
    DEMO_SCHEDULED = "demo_scheduled"
    DEMO_COMPLETED = "demo_completed"
    NEGOTIATION = "negotiation"
    ONBOARDING = "onboarding"
    DEPOSIT_PAID = "deposit_paid"
    IN_PROGRESS = "in_progress"
    DEAL_CLOSED = "deal_closed"
    PITCHING = "pitching"


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    business_name = Column(String, nullable=False, index=True)
    contact_name = Column(String, nullable=False)
    phone = Column(String, nullable=False, index=True)
    email = Column(String, nullable=True)
    website = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(SAEnum(LeadStatus), nullable=False, default=LeadStatus.UN_CALLED, index=True)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    closed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    deal_value = Column(Numeric(10, 2), nullable=True)
    commission = Column(Numeric(10, 2), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
