"""
Database setup.

This file does three things:
1. Reads DATABASE_URL from the environment (falls back to a local SQLite
   file if nothing is set, so the project runs immediately with zero setup).
2. Creates the SQLAlchemy `engine` and `SessionLocal` used to talk to the DB.
3. Defines `Base`, the class every ORM model (in models.py) will inherit from.
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()  # reads .env if present

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./emergency_resources.db")

# connect_args is only needed for SQLite (it disallows cross-thread use by
# default, which conflicts with how FastAPI's dependency system uses
# connections). Postgres doesn't need this, so we only add it conditionally.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency: gives each request its own DB session and always
    closes it afterward, even if the request raised an error.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
