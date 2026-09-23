# Emergency Resource Map — Backend

FastAPI backend for the Emergency Resource Map project.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # defaults to SQLite, no setup needed
alembic upgrade head            # creates the schema
uvicorn app.main:app --reload
```

Then open http://127.0.0.1:8000/docs for interactive API docs.

## Switching to PostgreSQL

Install Postgres, create a database, then edit `.env`:

```
DATABASE_URL=postgresql://username:password@localhost:5432/emergency_resource_map
```

Restart the server — same code, no changes needed elsewhere. This works because
`GUID` in `app/models.py` adapts the primary-key column type per database.

## Project structure

```
app/
  main.py          FastAPI app, CORS, startup
  database.py      engine/session setup, reads DATABASE_URL
  models.py        SQLAlchemy models (the Resource table)
  schemas.py       Pydantic request/response shapes
  crud.py          all DB queries live here
  routers/
    resources.py   the /api/resources endpoints
alembic/
  env.py           reads DATABASE_URL from .env, points at app's models
  versions/        one file per migration
alembic.ini        alembic config (no DB URL here — env.py supplies it)
```

## Migrations (Alembic)

The database schema is now managed by Alembic instead of auto-creating
tables on startup. Basic workflow:

```bash
# after changing a model in app/models.py, generate a migration:
alembic revision --autogenerate -m "describe the change"

# ALWAYS open the generated file in alembic/versions/ and check it —
# autogenerate is a good first draft, not a guarantee. In particular it
# doesn't always catch column-type changes without you looking, and it
# missed the import for our custom GUID type on the very first migration
# (had to add `import app.models` by hand). Confirm the import is there,
# and that upgrade()/downgrade() look correct before running it.

# apply pending migrations:
alembic upgrade head

# roll back the most recent migration:
alembic downgrade -1

# see current schema version:
alembic current
```

Both `upgrade` and `downgrade` were tested against a fresh SQLite DB and
round-tripped cleanly (create → verify schema → downgrade → drops table →
upgrade again → recreates it identically).

## Endpoints implemented so far

| Method | Path                   | Notes                                   |
|--------|------------------------|------------------------------------------|
| GET    | /api/health            | health check                             |
| GET    | /api/resources         | list, with `?search=` and `?category=`   |
| GET    | /api/resources/{id}    | get one                                  |
| POST   | /api/resources         | create (not yet admin-only)              |
| PUT    | /api/resources/{id}    | partial update                           |
| DELETE | /api/resources/{id}    | delete                                   |
| GET    | /api/resources/nearby  | `?latitude=&longitude=&radius_km=`       |

All tested and confirmed working end-to-end (create, list, search, category
filter, nearby-distance search).

## Not yet done (next phases per the roadmap)

- Admin auth — POST/PUT/DELETE are wide open right now, per spec they
  should require an authenticated admin
- Tests (pytest / FastAPI TestClient)
