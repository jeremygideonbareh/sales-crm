"""Seed the database with users and leads for production."""
import json
import os
import asyncio
from sqlalchemy import select
from .database import async_session_factory, init_db
from .models.user import User, UserRole
from .models.lead import Lead, LeadStatus
from .services.auth import hash_password

SEED_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "seed_data.json")

USERS = [
    {"email": "admin@agency.com", "password": "admin123", "full_name": "Agency Manager", "role": UserRole.MANAGER},
    {"email": "ashba@agency.com", "password": "ashba123", "full_name": "Ashba", "role": UserRole.REP},
    {"email": "jai@agency.com", "password": "jai123", "full_name": "Jai", "role": UserRole.REP},
    {"email": "agnas@agency.com", "password": "agnas123", "full_name": "Agnas", "role": UserRole.REP},
]


async def seed():
    await init_db()

    async with async_session_factory() as db:
        result = await db.execute(select(User).limit(1))
        if result.scalar_one_or_none():
            print("Data already seeded. Skipping.")
            return

        for u in USERS:
            user = User(
                email=u["email"],
                hashed_password=hash_password(u["password"]),
                full_name=u["full_name"],
                role=u["role"],
            )
            db.add(user)
        await db.commit()
        print(f"Seeded {len(USERS)} users")

        result = await db.execute(select(User))
        user_map = {u.email: u.id for u in result.scalars().all()}

        if os.path.exists(SEED_FILE):
            with open(SEED_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)

            for l in data.get("leads", []):
                lead = Lead(
                    business_name=l["business_name"],
                    contact_name=l.get("contact_name", l["business_name"]),
                    phone=l["phone"],
                    email=l.get("email"),
                    website=l.get("website"),
                    notes=l.get("notes"),
                    status=LeadStatus[l["status"]] if l.get("status") else LeadStatus.UN_CALLED,
                    assigned_to=user_map.get(l["assigned_to_email"]) if l.get("assigned_to_email") else None,
                    deal_value=l.get("deal_value"),
                    commission=l.get("commission"),
                )
                db.add(lead)
            await db.commit()
            print(f"Seeded {len(data.get('leads', []))} leads")
        else:
            print("No seed_data.json found — skipping lead import")

    print("Seed complete!")


if __name__ == "__main__":
    asyncio.run(seed())
