from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.notification import Notification, NotificationType


async def create_notification(
    db: AsyncSession,
    user_id: int,
    type: NotificationType,
    title: str,
    message: str | None = None,
    link: str | None = None,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        link=link,
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification


async def get_notifications(db: AsyncSession, user_id: int, limit: int = 20) -> list[Notification]:
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_unread_count(db: AsyncSession, user_id: int) -> int:
    result = await db.execute(
        select(func.count(Notification.id))
        .where(Notification.user_id == user_id, Notification.is_read == False)
    )
    return result.scalar() or 0


async def mark_as_read(db: AsyncSession, notification_id: int, user_id: int) -> Notification | None:
    notification = await db.get(Notification, notification_id)
    if notification and notification.user_id == user_id:
        notification.is_read = True
        await db.commit()
        await db.refresh(notification)
        return notification
    return None


async def mark_all_as_read(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(Notification).where(Notification.user_id == user_id, Notification.is_read == False)
    )
    for n in result.scalars().all():
        n.is_read = True
    await db.commit()
