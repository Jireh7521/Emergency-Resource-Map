"""
FastAPI application entry point.

Run locally with:
    uvicorn app.main:app --reload

Then visit http://127.0.0.1:8000/docs for interactive API docs (FastAPI
generates this automatically from the routes + Pydantic schemas).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import resources

# Creates all tables defined in models.py if they don't exist yet.
# Fine for early development; once the project has real data, switch to
# Alembic migrations (Phase 3 in the roadmap) instead of relying on this.
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Emergency Resource Map API",
    description="Location-based emergency resource discovery platform.",
    version="0.1.0",
)

# Allows the React frontend (running on a different port/origin during
# development) to call this API. Tighten allow_origins before deploying.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resources.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
