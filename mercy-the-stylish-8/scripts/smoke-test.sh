#!/usr/bin/env bash
# Quick end-to-end sanity check against the running servers. Run this AFTER
# starting both servers (e.g. `npm run dev` at the repo root, or
# `docker compose up`). It doesn't replace the automated test suites in
# server/test and ai-server/test - it's a fast "is anything obviously broken
# right now" check against the real, running thing.
#
# Usage: ./scripts/smoke-test.sh [main-server-url] [ai-server-url]

set -uo pipefail

MAIN_URL="${1:-http://localhost:4000}"
AI_URL="${2:-http://localhost:4100}"
FAILURES=0

check() {
  local description="$1"
  local url="$2"
  local expected_status="$3"
  local method="${4:-GET}"
  local body="${5:-}"

  local status
  if [ -n "$body" ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$body" "$url")
  else
    status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url")
  fi

  if [ "$status" = "$expected_status" ]; then
    echo "OK   ($status) $description"
  else
    echo "FAIL (got $status, expected $expected_status) $description"
    FAILURES=$((FAILURES + 1))
  fi
}

echo "== Main server ($MAIN_URL) =="
check "health check"                      "$MAIN_URL/health"                       200
check "list products"                     "$MAIN_URL/api/products"                 200
check "get a nonexistent product -> 404"  "$MAIN_URL/api/products/does-not-exist"   404
check "create order while signed out -> 401" "$MAIN_URL/api/orders" 401 POST '{"items":[],"total":0}'
# ^ 401 because this route requires sign-in before it even looks at the body - that's expected.

echo
echo "== AI server ($AI_URL) =="
check "health check"                    "$AI_URL/health"           200
check "chat with no messages -> 400"    "$AI_URL/api/ai/chat"       400 POST '{}'
check "recommend with no prefs -> 400"  "$AI_URL/api/ai/recommend"  400 POST '{}'

echo
if [ "$FAILURES" -eq 0 ]; then
  echo "All checks passed."
  exit 0
else
  echo "$FAILURES check(s) failed - see above."
  exit 1
fi
