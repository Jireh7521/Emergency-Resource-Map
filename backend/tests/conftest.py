"""
Shared pytest fixtures.

Each test gets a fresh, isolated in-memory SQLite database (not the dev
.db file, and not Postgres) so tests never interfere with each other or
with real data. We override FastAPI's `get_db` dependency to point at
this test database instead of whatever DATABASE_URL says.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.auth import hash_password
from app.models import Admin

TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture()
def db_session():
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,  # keeps the same in-memory DB across connections
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session: Session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def admin_token(db_session: Session, client: TestClient) -> str:
    """Creates an admin directly in the test DB, logs in, returns a JWT."""
    admin = Admin(username="testadmin", hashed_password=hash_password("testpassword123"))
    db_session.add(admin)
    db_session.commit()

    response = client.post(
        "/api/auth/login",
        json={"username": "testadmin", "password": "testpassword123"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]
