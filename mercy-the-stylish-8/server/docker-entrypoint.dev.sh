#!/bin/sh
set -e

PRISMA="./node_modules/.bin/prisma"
TSX="./node_modules/.bin/tsx"

if [ ! -x "$PRISMA" ]; then
  echo "ERROR: prisma not installed. Rebuild the image: npm run docker:dev"
  exit 1
fi

if ! "$PRISMA" --version 2>/dev/null | grep -q "prisma *: 7\."; then
  echo "ERROR: Prisma 7 required (found stale node_modules). Run: npm run docker:dev:reset"
  exit 1
fi

echo "==> Syncing database schema"
ok=0
for i in 1 2 3 4 5 6 7 8 9 10; do
  if "$PRISMA" db push; then
    ok=1
    break
  fi
  echo "Waiting for database... ($i/10)"
  sleep 3
done

if [ "$ok" -eq 0 ]; then
  echo "ERROR: Could not connect to database after 10 attempts"
  exit 1
fi

echo "==> Starting API server"
# No tsx watch in Docker — bind mounts on Windows make restarts very slow.
exec "$TSX" src/index.ts
