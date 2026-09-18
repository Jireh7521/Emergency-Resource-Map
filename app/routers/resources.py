"""
Resource API routes — matches the endpoints from the project spec:

    GET    /api/resources
    GET    /api/resources/{id}
    POST   /api/resources
    PUT    /api/resources/{id}
    DELETE /api/resources/{id}
    GET    /api/resources/nearby
"""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/resources", tags=["resources"])


@router.get("", response_model=list[schemas.ResourceOut])
def list_resources(
    search: Optional[str] = Query(None, description="Match against name or address"),
    category: Optional[models.ResourceCategory] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """List resources, with optional search and category filtering."""
    return crud.get_resources(db, search=search, category=category, skip=skip, limit=limit)


# IMPORTANT: this route must be declared BEFORE /{resource_id}, otherwise
# FastAPI will try to parse "nearby" as a UUID and return a 422 error.
@router.get("/nearby", response_model=list[schemas.ResourceWithDistance])
def nearby_resources(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(10.0, gt=0, le=100),
    category: Optional[models.ResourceCategory] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Find resources within radius_km of a given point, nearest first."""
    pairs = crud.get_nearby_resources(
        db, latitude=latitude, longitude=longitude,
        radius_km=radius_km, category=category, limit=limit,
    )
    return [
        schemas.ResourceWithDistance(
            **schemas.ResourceOut.model_validate(resource).model_dump(),
            distance_km=round(distance, 2),
        )
        for resource, distance in pairs
    ]


@router.get("/{resource_id}", response_model=schemas.ResourceOut)
def get_resource(resource_id: uuid.UUID, db: Session = Depends(get_db)):
    resource = crud.get_resource(db, resource_id)
    if resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource


@router.post("", response_model=schemas.ResourceOut, status_code=201)
def create_resource(resource: schemas.ResourceCreate, db: Session = Depends(get_db)):
    # NOTE: per the spec, creating/editing/deleting resources should be
    # admin-only. There's no auth yet (that's Phase 9 in the roadmap) —
    # this endpoint is open for now so the API is usable while the rest
    # of the backend is built. Lock this down before it goes anywhere near
    # production.
    return crud.create_resource(db, resource)


@router.put("/{resource_id}", response_model=schemas.ResourceOut)
def update_resource(
    resource_id: uuid.UUID, resource: schemas.ResourceUpdate, db: Session = Depends(get_db)
):
    updated = crud.update_resource(db, resource_id, resource)
    if updated is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return updated


@router.delete("/{resource_id}", status_code=204)
def delete_resource(resource_id: uuid.UUID, db: Session = Depends(get_db)):
    deleted = crud.delete_resource(db, resource_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Resource not found")
