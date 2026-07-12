from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .api.auth import router as auth_router
from .api.leads import router as leads_router
from .api.reps import router as reps_router
from .api.analytics import router as analytics_router
from .api.export import router as export_router
from .api.pipeline import router as pipeline_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Sales Dashboard CRM", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://sales-crm-cmg.pages.dev",
    ],
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


@app.get("/api/health")
async def health():
    return {"status": "ok"}
