# Deployment Guide — Mercy the Stylish MVP

## Architecture

| Service | Stack | Deploy to |
|---------|-------|-----------|
| Frontend (`app/`) | React + Vite | Vercel |
| Backend (`server/`) | Express + Prisma + PostgreSQL | Fly.io / Render / Railway / Docker |
| Database | PostgreSQL 16 | Neon / Supabase / Docker Compose |

**Not deployed for MVP:** `ai-server/`, Android/iOS

---

## Local development

### Option A — Docker (one command)

From `mercy-the-stylish-8/`:

```bash
npm run docker:dev
```

This starts **Postgres**, the **API** (port 4000, hot reload), and the **Vite frontend** (port 5173, hot reload).

- Frontend: http://localhost:5173
- API: http://localhost:4000

On first run, `server/.env` and `app/.env` are created from `.env.example` if missing. Edit them with your Google OAuth and Stripe keys.

Stop:

```bash
npm run docker:dev:down
```

### Option B — without Docker

```bash
cd mercy-the-stylish-8

# Start PostgreSQL
docker compose up postgres -d

# Backend
cd server
cp .env.example .env   # fill in GOOGLE_CLIENT_ID, JWT_SECRET, ADMIN_EMAILS, Stripe keys
npm install
npx prisma db push
npm run db:seed
npm run dev            # http://localhost:4000

# Frontend (new terminal)
cd app
cp .env.example .env   # fill VITE_MAIN_SERVER_URL, VITE_GOOGLE_CLIENT_ID
npm install
npm run dev            # http://localhost:5173
```

---

## Vercel (frontend)

1. Set **Root Directory** to `app`
2. Framework: Vite (auto-detected via `app/vercel.json`)
3. Environment variables:
   - `VITE_MAIN_SERVER_URL` — your deployed backend URL
   - `VITE_GOOGLE_CLIENT_ID` — Google OAuth Web client ID
   - `VITE_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key

`app/vercel.json` includes SPA rewrites for React Router.

---

## Backend deployment

### Environment variables

```env
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
JWT_SECRET=...          # long random string
ADMIN_EMAILS=you@example.com
FRONTEND_URL=https://your-app.vercel.app
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Database setup

```bash
npx prisma migrate deploy
npm run db:seed
```

### Stripe webhook

Register endpoint: `https://your-api.com/api/webhooks/stripe`

Events: `checkout.session.completed`

---

## Docker Compose (full stack)

```bash
docker compose up --build
```

- Web: http://localhost:8080
- API: http://localhost:4000
- Postgres: localhost:5432

---

## Smoke test

```bash
npm run smoke-test
```

Verifies backend health and product listing endpoints.

---

## MVP launch checklist

- [ ] Google OAuth configured for production domain
- [ ] Stripe live/test keys set per environment
- [ ] `ADMIN_EMAILS` configured
- [ ] `FRONTEND_URL` matches Vercel domain (CORS)
- [ ] Stripe webhook URL registered
- [ ] `.gitignore` prevents `node_modules`/`.env` commits
