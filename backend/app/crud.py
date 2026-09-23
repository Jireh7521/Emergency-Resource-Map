"""
CRUD (Create, Read, Update, Delete) functions.

Route handlers (in routers/resources.py) call these instead of writing
SQLAlchemy queries inline. This keeps "how do we talk to the DB" separate
from "how do we handle an HTTP request" — makes both easier to test and read.
"""

import math
import uuid
from typing import Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from . import models, schemas


def get_resource(db: Session, resource_id: uuid.UUID) -> Optional[models.Resource]:
    return db.query(models.Resource).filter(models.Resource.id == resource_id).first()


def get_resources(
    db: Session,
    search: Optional[str] = None,
    category: Optional[models.ResourceCategory] = None,
    skip: int = 0,
    limit: int = 100,
) -> list[models.Resource]:
    query = db.query(models.Resource)

    if search:
        like_pattern = f"%{search}%"
        query = query.filter(
            or_(
                models.Resource.name.ilike(like_pattern),
                models.Resource.address.ilike(like_pattern),
            )
        )

    if category:
        query = query.filter(models.Resource.category == category)

    return query.offset(skip).limit(limit).all()


def create_resource(db: Session, resource: schemas.ResourceCreate) -> models.Resource:
    db_resource = models.Resource(**resource.model_dump())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource


def update_resource(
    db: Session, resource_id: uuid.UUID, resource_update: schemas.ResourceUpdate
) -> Optional[models.Resource]:
    db_resource = get_resource(db, resource_id)
    if db_resource is None:
        return None

    update_data = resource_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_resource, field, value)

    db.commit()
    db.refresh(db_resource)
    return db_resource


def delete_resource(db: Session, resource_id: uuid.UUID) -> bool:
    db_resource = get_resource(db, resource_id)
    if db_resource is None:
        return False
    db.delete(db_resource)
    db.commit()
    return True


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two lat/lon points, in kilometers."""
    R = 6371.0  # Earth's radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def get_nearby_resources(
    db: Session,
    latitude: float,
    longitude: float,
    radius_km: float = 10.0,
    category: Optional[models.ResourceCategory] = None,
    limit: int = 20,
) -> list[tuple[models.Resource, float]]:
    """
    Returns (resource, distance_km) pairs within radius_km, nearest first.

    Note: this computes distance in Python for every row, which is fine at
    small/medium scale. If the resource table grows large, this is the
    first place to optimize (e.g. a bounding-box pre-filter in SQL, or
    PostGIS if you move to it later).
    """
    query = db.query(models.Resource)
    if category:
        query = query.filter(models.Resource.category == category)

    results = []
    for resource in query.all():
        distance = _haversine_km(latitude, longitude, resource.latitude, resource.longitude)
        if distance <= radius_km:
            results.append((resource, distance))

    results.sort(key=lambda pair: pair[1])
    return results[:limit]
