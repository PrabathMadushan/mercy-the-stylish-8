#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f server/.env ]; then
  echo "Creating server/.env from .env.example"
  cp server/.env.example server/.env
fi

if [ ! -f app/.env ]; then
  echo "Creating app/.env from .env.example"
  cp app/.env.example app/.env
fi

echo ""
echo "Starting development stack (Postgres + API + Frontend)..."
echo "  Frontend: http://localhost:5173"
echo "  API:      http://localhost:4000"
echo ""

docker compose -f docker-compose.dev.yml up --build "$@"
