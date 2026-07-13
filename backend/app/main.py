from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .config import settings
from .database import init_db, async_session_factory
from .middleware.rate_limit import RateLimitMiddleware
from .middleware.logging import RequestLoggingMiddleware
from .middleware.security import SecurityHeadersMiddleware
from .api.auth import router as auth_router
from .api.leads import router as leads_router
from .api.reps import router as reps_router
from .api.analytics import router as analytics_router
from .api.export import router as export_router
from .api.pipeline import router as pipeline_router
from .api.admin import router as admin_router
from .api.notifications import router as notifications_router
from .api.email_sequences import router as email_sequences_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Sales Dashboard CRM", version="1.0.0", lifespan=lifespan)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RateLimitMiddleware, max_requests=10, window_seconds=60)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(leads_router)
app.include_router(reps_router)
app.include_router(analytics_router)
app.include_router(export_router)
app.include_router(pipeline_router)
app.include_router(admin_router)
app.include_router(notifications_router)
app.include_router(email_sequences_router)


@app.get("/api/health")
async def health():
    db_ok = False
    try:
        async with async_session_factory() as session:
            await session.execute(text("SELECT 1"))
            db_ok = True
    except Exception:
        pass
    return {"status": "ok" if db_ok else "degraded", "database": "connected" if db_ok else "error"}
