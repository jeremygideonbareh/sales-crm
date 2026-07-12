"""Run from Render shell: python run_seed.py"""
import asyncio
from app.seed import seed

asyncio.run(seed())
