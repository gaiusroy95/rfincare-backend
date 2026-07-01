# Rfincare frontend (React + Vite)

## Environment

1. Copy `frontend/.env.example` to `frontend/.env` (or `.env.local`).
2. Set `VITE_API_BASE_URL` to your API origin (e.g. `http://127.0.0.1:8080`).

## Install and run

From this directory:

``bash
npm install
npm run dev
```

Vite listens on port **4028** (see `vite.config.mjs`).

## Build

```bash
npm run build
```

Output: `frontend/dist/` (used by the backend when serving the SPA).

## Routes

Application routes live in `src/Routes.jsx`.
