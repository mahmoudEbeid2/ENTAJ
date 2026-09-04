#!/bin/sh
# Container startup for the Next.js app service.
#
# `next build` executes the public pages' data-fetching code at build time
# (they query MySQL directly, not via next/font-style lazy fetch), so the
# build step has to run after MySQL is actually reachable — it can't happen
# during `docker build`, which has no access to the compose network. Doing
# it here, after depends_on's healthcheck gate, is what makes `docker
# compose up -d` alone sufficient from a clean environment.
set -e

echo "[entrypoint] waiting for database connectivity..."
attempt=0
until node -e "
  require('mysql2/promise')
    .createConnection(process.env.DATABASE_URL)
    .then((c) => c.end())
    .catch(() => process.exit(1));
"; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "[entrypoint] database did not become reachable in time" >&2
    exit 1
  fi
  sleep 2
done
echo "[entrypoint] database is reachable"

echo "[entrypoint] running migrations..."
npm run db:migrate

echo "[entrypoint] running seed (no-op if already seeded)..."
npm run db:seed

# A container killed mid-build (OOM, `docker stop` timeout, a deploy
# interrupting startup) can leave `.next` with BUILD_ID and page manifests
# written but a referenced webpack chunk not yet flushed — the app then
# looks "built" and starts, but 500s the first time it touches that missing
# chunk (this is what broke Technical Document downloads). Building into a
# scratch dir and renaming it into place only after `next build` exits 0
# makes that impossible: `.next` is always either absent or a complete build.
rm -rf .next.building
if [ ! -f .next/BUILD_ID ]; then
  echo "[entrypoint] no build found, running next build..."
  NEXT_DIST_DIR=.next.building npm run build
  rm -rf .next
  mv .next.building .next
else
  echo "[entrypoint] existing .next build found, skipping build"
fi

echo "[entrypoint] starting server..."
exec node server.js
