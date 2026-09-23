# Emergency Resource Map — Frontend

React + TypeScript + Vite + Tailwind + React-Leaflet frontend for the
Emergency Resource Map project.

## Setup

```bash
npm install
cp .env.example .env    # points at the backend, defaults to http://127.0.0.1:8000
npm run dev
```

Open http://localhost:5173. Make sure the backend (see `../backend/README.md`)
is running first.

## What's here

```
src/
  api/client.ts          fetch-based client for the backend API
  types/resource.ts       TypeScript types matching the backend's schemas,
                           plus per-category labels/colors
  hooks/useAuth.ts        admin login state (JWT in localStorage)
  components/
    MapView.tsx            Leaflet map, colored markers per category
    ResourceList.tsx        sidebar list, synced with map selection
    FilterBar.tsx            search box, category dropdown, "find near me"
    LoginModal.tsx            admin sign-in
    ResourceForm.tsx          add/edit resource (incl. verification status)
    CategoryBadge.tsx         small colored category pill
  App.tsx                 wires all of the above together
```

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally to sanity-check it
```

## Tested

Every core flow was driven end-to-end in a real headless browser against
the live backend: admin sign-in, create/edit/delete a resource, search
filtering, category filtering, and empty states. All confirmed working
with zero console errors. (Map tiles themselves need internet access to
OpenStreetMap's tile servers — nothing to configure, just requires the
browser running the app to have normal internet access.)

## Not yet automated

There's no automated frontend test suite (e.g. Vitest + React Testing
Library) yet — verification so far was manual/scripted browser testing.
Worth adding if the project continues past MVP.
