"""
Database migration script.

Usage:
    python scripts/migrate.py          # Run all pending migrations
    python scripts/migrate.py --check  # Check migration status (dry-run)

This script creates any missing tables based on the current model definitions.
For schema changes (ALTER TABLE), use manual SQL migration files in migrations/.
"""

import argparse
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import engine, Base


async def run_migrations(check: bool = False) -> None:
    async with engine.begin() as conn:
        if check:
            print("Checking database state...")
            tables = await conn.run_sync(
                lambda sync_conn: Base.metadata.tables.keys()
            )
            print(f"Tables defined: {', '.join(tables)}")
            print("Dry-run complete. No changes made.")
        else:
            print("Creating missing tables...")
            from app.models import User, Lead, CallLog, DemoRequest, Handover, Notification
            await conn.run_sync(Base.metadata.create_all)
            print("Migration complete.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Database migration tool")
    parser.add_argument("--check", action="store_true", help="Dry-run check only")
    args = parser.parse_args()

    asyncio.run(run_migrations(check=args.check))
