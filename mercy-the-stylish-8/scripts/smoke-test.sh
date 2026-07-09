#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:4000}"

echo "==> Health check"
curl -sf "$API_URL/health" | grep -q '"status":"ok"'

echo "==> Products listing"
curl -sf "$API_URL/api/products" | grep -q '"items"'

echo "==> All smoke tests passed"
