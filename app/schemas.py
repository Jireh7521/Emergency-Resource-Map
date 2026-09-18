"""
Pydantic schemas — these define what shape of data the API accepts
(request bodies) and returns (response bodies). Keeping these separate
from the SQLAlchemy models (models.py) is deliberate: it stops internal
DB details leaking into the API, and lets each side change independently.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from .models import ResourceCategory, VerificationStatus


class ResourceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    category: ResourceCategory
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class ResourceCreate(ResourceBase):
    """Fields required to create a resource. Admin-only, per the spec."""
    pass


class ResourceUpdate(BaseModel):
    """
    All fields optional — a PUT/PATCH only needs to send what's changing.
    """
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[ResourceCategory] = None
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    verification_status: Optional[VerificationStatus] = None


class ResourceOut(ResourceBase):
    id: uuid.UUID
    verification_status: VerificationStatus
    created_at: datetime
    updated_at: datetime

    # Lets Pydantic build this schema directly from a SQLAlchemy object
    # (model_validate(resource_orm_instance)) instead of a dict.
    model_config = ConfigDict(from_attributes=True)


class ResourceWithDistance(ResourceOut):
    """Used by the /nearby endpoint to also report distance from the user."""
    distance_km: float
