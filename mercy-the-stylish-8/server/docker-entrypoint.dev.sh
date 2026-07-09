#!/bin/sh
set -e

# Use locally installed binaries — never `npx prisma` (that can pull Prisma 7 on Node 20)
PRISMA="./node_modules/.bin/prisma"
TSX="./node_modules/.bin/tsx"

if [ ! -x "$PRISMA" ]; then
  echo "ERROR: prisma not installed. Rebuild the image: npm run docker:dev"
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

echo "==> Seeding products (if needed)"
"$TSX" prisma/seed.ts

echo "==> Starting API server (hot reload)"
exec npm run dev
