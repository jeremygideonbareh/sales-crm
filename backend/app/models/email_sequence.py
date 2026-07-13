from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from ..database import Base


class SequenceTrigger(str, enum.Enum):
    STAGE_CHANGE = "stage_change"
    LEAD_ASSIGNED = "lead_assigned"
    MANUAL = "manual"


class StepType(str, enum.Enum):
    DELAY = "delay"
    SEND_EMAIL = "send_email"
    CONDITION = "condition"
    UPDATE_STAGE = "update_stage"
    NOTIFY = "notify"


class EmailSequence(Base):
    __tablename__ = "email_sequences"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    trigger = Column(SAEnum(SequenceTrigger), nullable=False, default=SequenceTrigger.MANUAL)
    trigger_stage = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    steps = relationship("SequenceStep", back_populates="sequence", order_by="SequenceStep.step_order", cascade="all, delete-orphan")


class SequenceStep(Base):
    __tablename__ = "sequence_steps"

    id = Column(Integer, primary_key=True, index=True)
    sequence_id = Column(Integer, ForeignKey("email_sequences.id", ondelete="CASCADE"), nullable=False, index=True)

    sequence = relationship("EmailSequence", back_populates="steps")
    step_order = Column(Integer, nullable=False)
    step_type = Column(SAEnum(StepType), nullable=False)
    delay_days = Column(Integer, nullable=True)
    email_subject = Column(String, nullable=True)
    email_body = Column(Text, nullable=True)
    condition_field = Column(String, nullable=True)
    condition_value = Column(String, nullable=True)
    target_stage = Column(String, nullable=True)
    notify_role = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
