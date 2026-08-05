# Certo Drive — production container image.
# Works on any container host (Railway, Render, Fly.io, a VPS).
# Uses SQLite by default; set DATABASE_URL to a Postgres URL (and switch the
# Prisma provider — see DEPLOYMENT.md) to run on a managed database.

FROM node:20-slim AS base
WORKDIR /app
# OpenSSL is required by Prisma's query engine.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json ./
# The `postinstall` script runs `prisma generate`, so the schema must be present.
COPY prisma ./prisma
RUN npm ci

# ---- Build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# ---- Runner ----
FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts

EXPOSE 3000
# Ensure the schema exists (SQLite) or is in sync (Postgres), then bind to
# Railway's injected $PORT on all interfaces.
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx next start -H 0.0.0.0"]
