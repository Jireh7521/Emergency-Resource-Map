"""
SQLAlchemy models — these classes map directly to database tables.
Each attribute becomes a column.
"""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Float, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.types import CHAR, TypeDecorator

from .database import Base


class GUID(TypeDecorator):
    """
    A UUID column that works on both Postgres (native UUID type) and
    SQLite (falls back to a plain CHAR(36) string). This lets the same
    model run against either database, which matters since we default
    to SQLite locally but the spec targets Postgres in production.
    """

    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == "postgresql":
            return str(value)
        if not isinstance(value, uuid.UUID):
            return str(uuid.UUID(value))
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if not isinstance(value, uuid.UUID):
            return uuid.UUID(value)
        return value


class ResourceCategory(str, enum.Enum):
    hospital = "hospital"
    clinic = "clinic"
    police = "police"
    fire_service = "fire_service"
    shelter = "shelter"
    emergency_office = "emergency_office"
    ambulance = "ambulance"
    idp_camp = "idp_camp"
    rescue_centre = "rescue_centre"
    other = "other"


class VerificationStatus(str, enum.Enum):
    verified = "verified"
    unverified = "unverified"
    needs_update = "needs_update"


class Admin(Base):
    """
    Administrator accounts. Kept deliberately minimal — per the spec,
    admins can create/edit/delete/verify resources. There's no self-service
    registration endpoint; accounts are created via scripts/create_admin.py
    (see README) so random visitors can't grant themselves admin access.
    """

    __tablename__ = "admins"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Resource(Base):
    __tablename__ = "resources"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, index=True)
    category = Column(Enum(ResourceCategory), nullable=False, index=True)
    description = Column(String, nullable=True)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    verification_status = Column(
        Enum(VerificationStatus), nullable=False, default=VerificationStatus.unverified
    )
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
