#!/bin/sh
set -e

# Vite dev server is unreliable on Windows Docker (connection resets on module load).
# Serve a production build instead — stable and fast.
echo "==> Building frontend"
npm run build

echo "==> Serving frontend at http://localhost:5173"
exec npm run preview -- --host 0.0.0.0 --port 5173
