# Emergency Resource Map

A location-based emergency resource discovery platform — find hospitals,
police stations, fire services, shelters, IDP camps and other emergency
resources on an interactive map, with search, category filtering, and
"find near me" support.

This covers the MVP from the project spec: interactive map, search,
category filters, resource detail info, nearby-resource discovery via
geolocation, and admin-authenticated resource management (create/edit/
delete/verify).

## Quick start (local development, two terminals)

**Terminal 1 — backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python -m scripts.create_admin youradmin yourpassword123   # first admin account
uvicorn app.main:app --reload
```
API docs: http://127.0.0.1:8000/docs

**Terminal 2 — frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
App: http://localhost:5173

Sign in with the admin account you created to add, edit, verify, or
delete resources. Everyone (no sign-in needed) can search, filter, browse
the map, and use "Find near me".

## Quick start (Docker)

```bash
docker compose up --build
```

This starts Postgres, the backend (migrations run automatically on
startup), and the frontend (served via nginx) together:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

Create the first admin account inside the running backend container:
```bash
docker compose exec backend python -m scripts.create_admin youradmin yourpassword123
```

For a real deployment, change `JWT_SECRET_KEY` and the Postgres password
in `docker-compose.yml` (or pass them via a `.env` file / your hosting
provider's secrets), and set `VITE_API_BASE_URL` / `CORS_ORIGINS` to your
real domains instead of `localhost`.

## What's built

**Backend** (`backend/`) — FastAPI + SQLAlchemy + Alembic + PostgreSQL
(SQLite for local dev by default). Full resource CRUD, search, category
filtering, haversine-based nearby search, JWT admin auth, 15 passing
pytest tests. See `backend/README.md` for details.

**Frontend** (`frontend/`) — React + TypeScript + Vite + Tailwind +
React-Leaflet. Interactive map with per-category colored markers, resource
list synced to the map, search + category filter, "find near me"
(browser geolocation), admin login, and add/edit/delete/verify forms.
Tested end-to-end in a real browser against the live backend — full flows
(sign in, create, search, edit, verify, delete) all confirmed working.

## What's not built yet (later phases per the roadmap)

- Admin dashboard as a distinct view (admin actions currently live inline
  in the main map/list UI — functionally complete, just not a separate page)
- Automated frontend tests (backend has full pytest coverage; frontend was
  verified via manual/scripted browser testing, not an automated test suite)
- Production hosting/CI setup (Vercel/Netlify/Render/Railway) — the app
  and Dockerfiles are ready for it, but no live deployment has been created
- Seeded real-world resource data — currently empty until an admin adds
  resources
