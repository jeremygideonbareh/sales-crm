from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models.email_sequence import EmailSequence, SequenceStep, SequenceTrigger, StepType
from ..models.email_log import EmailLog
from ..models.lead import Lead
from ..schemas.email import EmailSequenceCreate, SequenceStepCreate


async def create_sequence(db: AsyncSession, data: EmailSequenceCreate, created_by: int) -> EmailSequence:
    seq = EmailSequence(
        name=data.name,
        description=data.description,
        trigger=SequenceTrigger(data.trigger),
        trigger_stage=data.trigger_stage,
        created_by=created_by,
    )
    db.add(seq)
    await db.flush()

    for step_data in data.steps:
        step = SequenceStep(
            sequence_id=seq.id,
            step_order=step_data.step_order,
            step_type=StepType(step_data.step_type),
            delay_days=step_data.delay_days,
            email_subject=step_data.email_subject,
            email_body=step_data.email_body,
            condition_field=step_data.condition_field,
            condition_value=step_data.condition_value,
            target_stage=step_data.target_stage,
            notify_role=step_data.notify_role,
        )
        db.add(step)

    await db.commit()
    result = await db.execute(
        select(EmailSequence)
        .options(selectinload(EmailSequence.steps))
        .where(EmailSequence.id == seq.id)
    )
    return result.scalar_one()


async def get_sequences(db: AsyncSession) -> list[EmailSequence]:
    result = await db.execute(
        select(EmailSequence)
        .options(selectinload(EmailSequence.steps))
        .order_by(EmailSequence.created_at.desc())
    )
    return list(result.scalars().all())


async def get_sequence(db: AsyncSession, sequence_id: int) -> EmailSequence | None:
    result = await db.execute(
        select(EmailSequence)
        .options(selectinload(EmailSequence.steps))
        .where(EmailSequence.id == sequence_id)
    )
    return result.scalar_one_or_none()


async def update_sequence(db: AsyncSession, sequence_id: int, data: dict) -> EmailSequence | None:
    seq = await db.get(EmailSequence, sequence_id)
    if not seq:
        return None
    for key, value in data.items():
        if value is not None and hasattr(seq, key):
            if key == "trigger":
                value = SequenceTrigger(value)
            setattr(seq, key, value)
    await db.commit()
    result = await db.execute(
        select(EmailSequence)
        .options(selectinload(EmailSequence.steps))
        .where(EmailSequence.id == seq.id)
    )
    return result.scalar_one()


async def delete_sequence(db: AsyncSession, sequence_id: int) -> bool:
    seq = await db.get(EmailSequence, sequence_id)
    if not seq:
        return False
    await db.delete(seq)
    await db.commit()
    return True


async def set_steps(db: AsyncSession, sequence_id: int, steps: list[SequenceStepCreate]) -> EmailSequence | None:
    seq = await db.get(EmailSequence, sequence_id)
    if not seq:
        return None

    await db.execute(
        delete(SequenceStep).where(SequenceStep.sequence_id == sequence_id)
    )

    for step_data in steps:
        step = SequenceStep(
            sequence_id=sequence_id,
            step_order=step_data.step_order,
            step_type=StepType(step_data.step_type),
            delay_days=step_data.delay_days,
            email_subject=step_data.email_subject,
            email_body=step_data.email_body,
            condition_field=step_data.condition_field,
            condition_value=step_data.condition_value,
            target_stage=step_data.target_stage,
            notify_role=step_data.notify_role,
        )
        db.add(step)

    await db.commit()
    result = await db.execute(
        select(EmailSequence)
        .options(selectinload(EmailSequence.steps))
        .where(EmailSequence.id == seq.id)
    )
    return result.scalar_one()


async def get_email_logs(db: AsyncSession, lead_id: int | None = None, limit: int = 50) -> list[EmailLog]:
    query = select(EmailLog).order_by(EmailLog.created_at.desc()).limit(limit)
    if lead_id:
        query = query.where(EmailLog.lead_id == lead_id)
    result = await db.execute(query)
    return list(result.scalars().all())


async def log_email_sent(
    db: AsyncSession,
    lead_id: int,
    recipient_email: str,
    subject: str,
    body: str,
    sequence_id: int | None = None,
    step_id: int | None = None,
    sent_by: int | None = None,
) -> EmailLog:
    log = EmailLog(
        sequence_id=sequence_id,
        step_id=step_id,
        lead_id=lead_id,
        sent_by=sent_by,
        recipient_email=recipient_email,
        subject=subject,
        body=body,
        status="sent",
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log
