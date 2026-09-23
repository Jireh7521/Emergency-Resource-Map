"""
FastAPI application entry point.

Run locally with:
    uvicorn app.main:app --reload

Then visit http://127.0.0.1:8000/docs for interactive API docs (FastAPI
generates this automatically from the routes + Pydantic schemas).
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth as auth_router
from .routers import resources

# Table creation is now handled by Alembic migrations (see alembic/), not
# here. Run `alembic upgrade head` before starting the app for the first
# time, and after pulling any change that includes a new migration.

app = FastAPI(
    title="Emergency Resource Map API",
    description="Location-based emergency resource discovery platform.",
    version="0.1.0",
)

# Allows the React frontend to call this API from a different origin.
# Configurable via CORS_ORIGINS (comma-separated) so it can be tightened
# in production; defaults cover both `npm run dev` (5173) and
# `npm run preview` / a static build served locally (4173).
default_origins = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173"
allowed_origins = os.getenv("CORS_ORIGINS", default_origins).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resources.router)
app.include_router(auth_router.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
