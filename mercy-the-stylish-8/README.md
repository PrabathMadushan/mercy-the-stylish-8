# Mercy the Stylish

Women's fashion e-commerce MVP — React storefront + Express API + PostgreSQL.

| Folder | What it is |
|--------|------------|
| [`app/`](app/) | React + Vite frontend (shop, cart, checkout, admin dashboard) |
| [`server/`](server/) | Express + Prisma API (products, orders, auth, Stripe) |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and **running**
- Git

---

## Quick start (Docker — recommended)

From this folder (`mercy-the-stylish-8/`):

```bash
npm run docker:dev
```

This starts **Postgres**, the **API** (hot reload), and the **Vite frontend** (hot reload).

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:4000 |
| Postgres | localhost:5432 |

On first run, `server/.env` and `app/.env` are created automatically from `.env.example` if they don't exist.

### Stop

```bash
npm run docker:dev:down
```

### View logs

```bash
npm run docker:dev:logs
```

### Rebuild after dependency changes

```bash
docker compose -f docker-compose.dev.yml up --build
```

Rebuild the **web** image after frontend code changes (`docker compose -f docker-compose.dev.yml up --build web`). The web container serves a built bundle — not Vite dev — because Vite dev is unreliable on Windows Docker.

For frontend hot reload on Windows, run the API in Docker and the app locally:

```bash
npm run docker:dev:down
docker compose -f docker-compose.dev.yml up postgres main-server   # API + DB only
npm run dev --prefix app                                           # Vite on your machine
```

---

## Environment variables

Edit these after the first run:

### `server/.env`

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth Web client ID |
| `JWT_SECRET` | Random string for session tokens |
| `ADMIN_EMAILS` | Comma-separated admin emails |
| `STRIPE_SECRET_KEY` | Stripe test/live secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `FRONTEND_URL` | `http://localhost:5173` (default for Docker dev) |

`DATABASE_URL` is set automatically by Docker Compose — do not change it for local Docker dev.

### `app/.env`

| Variable | Purpose |
|----------|---------|
| `VITE_MAIN_SERVER_URL` | `http://localhost:4000` (default for Docker dev) |
| `VITE_GOOGLE_CLIENT_ID` | Same as server `GOOGLE_CLIENT_ID` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

---

## Useful commands

```bash
# Install dependencies (without Docker)
npm run install:all

# Run frontend + backend locally (requires Postgres running separately)
npm run dev

# Build both packages
npm run build:all

# Run tests
npm run test:all

# Re-seed products (with server running and DB accessible)
npm run db:seed --prefix server
```

---

## Troubleshooting

**`npm run docker:dev` fails immediately**
- Make sure Docker Desktop is running.
- On Windows, use `npm run docker:dev` (not the old bash script).

**Port already in use (5173, 4000, or 5432)**
- Stop other services using those ports, or change the port mappings in [`docker-compose.dev.yml`](docker-compose.dev.yml).

**API can't connect to database**
- Wait for Postgres to become healthy (the API retries automatically).
- Try: `npm run docker:dev:down` then `npm run docker:dev` again.

**Products not showing / empty shop**
- Re-seed: `npm run db:seed --prefix server` (with containers running).

**White / blank page at http://localhost:5173**
- Rebuild the web image: `docker compose -f docker-compose.dev.yml up --build web` (first start builds the frontend — can take ~30s).
- Hard-refresh the browser (Ctrl+Shift+R).
- For live frontend editing on Windows, skip the Docker web container and run `npm run dev --prefix app` locally while Postgres + API run in Docker.

**Prisma error: `Argument "url" is missing` or CLI version 6.x**
- This project uses **Prisma 7** (`url` lives in `prisma.config.ts`, not `schema.prisma`). An old Docker volume or global `npx prisma` can run Prisma 6 instead.
- Reset Docker volumes and rebuild: `npm run docker:dev:reset`
- For local commands, use `npm run db:generate --prefix server` (not bare `npx prisma`).

**Google Sign-In or Stripe not working**
- Fill in real keys in `server/.env` and `app/.env`, then restart: `npm run docker:dev:down && npm run docker:dev`.

---

## Project structure

```
mercy-the-stylish-8/
├── app/                    # React frontend
│   ├── src/
│   ├── Dockerfile.dev      # Dev image (Vite hot reload)
│   └── package.json
├── server/                 # Express API
│   ├── src/
│   ├── prisma/             # Database schema + seeds
│   ├── prisma.config.ts    # Prisma 7 connection config
│   ├── Dockerfile.dev      # Dev image (tsx hot reload)
│   └── package.json
├── docker-compose.dev.yml  # Postgres + API + frontend
├── scripts/docker-dev.mjs  # One-command startup script
└── package.json            # Root scripts (docker:dev, etc.)
```

---

## Production deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for Vercel (frontend), backend hosting, and Stripe webhook setup.
