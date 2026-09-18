# Emergency Resource Map — Backend

FastAPI backend for the Emergency Resource Map project.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # defaults to SQLite, no setup needed
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
```

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

- Alembic migrations (tables currently auto-create on startup — fine for
  now, but switch before the schema needs to evolve without losing data)
- Admin auth — POST/PUT/DELETE are wide open right now, per spec they
  should require an authenticated admin
- Tests (pytest / FastAPI TestClient)
