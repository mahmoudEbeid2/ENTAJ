# syntax=docker/dockerfile:1

# --- deps: install all dependencies (prod + dev) ------------------------
# devDependencies are kept in the runtime image on purpose: `drizzle-kit`
# and `tsx` (both devDependencies) are used at container *startup* to run
# migrations/seed, and `typescript`/`tailwindcss`/etc. are needed for
# `next build`, which also runs at startup (see docker/entrypoint.sh).
FROM node:20-bookworm-slim AS deps
WORKDIR /app
# python3/make/g++ are required to compile bcrypt's native addon during npm ci.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
# playwright is a devDependency used only by manual dev scripts (scripts/screenshot.mjs);
# skip its ~300MB browser download, it's never used at runtime.
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN npm ci

# --- runner: final runtime image -----------------------------------------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN chmod +x docker/entrypoint.sh
ENV NODE_ENV=production
EXPOSE 3000
ENTRYPOINT ["docker/entrypoint.sh"]
