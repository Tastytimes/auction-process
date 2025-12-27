# Auction Process System (Next.js + NestJS)

This repo contains a simple **player auction system** with:
- **Admin**: add teams + owners, add players, start/close live auctions, view sold table + remaining purses.
- **Owner**: live auction dashboard, place bids, see roster + remaining purse, see upcoming players.
- **Rules implemented**:
  - **Base price**: 1 Cr (stored as `10,000,000` rupees).
  - **Increment**: +20,000 per bid until price reaches **20 Cr**.
  - **After 20 Cr**: increment becomes **+1 Cr** per bid.

## Project structure
- `backend/` — NestJS + Prisma (SQLite) + JWT auth + Socket.IO realtime updates
- `frontend/` — Next.js (App Router) + Tailwind + Socket.IO client

## Run locally

### Backend
From `backend/`:

```bash
npm install
npm run db:migrate
npm run db:seed
npm run start:dev
```

- Backend runs on `http://localhost:3001`
- WebSocket namespace: `http://localhost:3001/ws`

**Seeded admin user**
- Email: `admin@auction.local`
- Password: `admin123`

### Frontend
From `frontend/`:

```bash
npm install
npm run dev
```

- Frontend runs on `http://localhost:3000`

Environment variables are in `frontend/.env.local`:
- `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`)
- `NEXT_PUBLIC_WS_URL` (default `http://localhost:3001/ws`)

## API overview (backend)
- `POST /auth/login`
- `GET /auth/me` (JWT)

Admin (JWT role = `ADMIN`):
- `GET /admin/teams`
- `POST /admin/teams`
- `GET /admin/players`
- `POST /admin/players`
- `GET /admin/settings`
- `PATCH /admin/settings`

Auction:
- `GET /auction/state`
- `GET /auction/upcoming`
- `GET /auction/results`
- `POST /auction/start` (ADMIN)
- `POST /auction/close` (ADMIN)
- `POST /auction/bid` (OWNER)