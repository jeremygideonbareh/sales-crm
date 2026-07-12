"""Run once to create initial manager user."""
import asyncio
from sqlalchemy import select
from .database import async_session_factory, init_db
from .models.user import User, UserRole
from .services.auth import hash_password


async def seed():
    await init_db()
    async with async_session_factory() as db:
        result = await db.execute(select(User).where(User.email == "admin@agency.com"))
        if result.scalar_one_or_none():
            print("Admin user already exists.")
            return

        admin = User(
            email="admin@agency.com",
            hashed_password=hash_password("admin123"),
            full_name="Agency Manager",
            role=UserRole.MANAGER,
        )
        db.add(admin)
        await db.commit()
        print("Created admin user: admin@agency.com / admin123")


if __name__ == "__main__":
    asyncio.run(seed())
