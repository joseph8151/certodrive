# Deploying Certo Drive

The app is a single Next.js server with Prisma. It ships with **SQLite** for
zero-config local/dev use; for production pick one of the paths below.

## Environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | yes | `file:./dev.db` (SQLite) or a Postgres URL |
| `AUTH_SECRET` | yes | Long random string for signing session cookies |
| `CRON_SECRET` | optional | Protects `GET /api/cron/reminders?secret=…` |
| `NEXT_PUBLIC_BASE_URL` | optional | Public origin, used in `sitemap.xml` / `robots.txt` |

Generate a secret: `openssl rand -base64 48`.

Health check: `GET /api/health` returns `{ status: "ok" }` when the DB is reachable.

---

## Option A — Container host (Railway / Render / Fly.io) — SQLite or Postgres

A `Dockerfile` is included. The container runs `prisma db push` on start, then
serves on port 3000.

1. Create a service from this repo (or `docker build -t certodrive .`).
2. Set `DATABASE_URL` and `AUTH_SECRET`.
3. **To keep SQLite data across restarts**, mount a persistent volume and point
   `DATABASE_URL` at it, e.g. `file:/data/prod.db` with a volume at `/data`.
   Without a volume the SQLite file is ephemeral.
4. Deploy. Seed demo data once (optional): run `npm run db:seed` in a shell on
   the instance.

Fly.io: `fly launch` (it detects the Dockerfile), then `fly volumes create data`
and mount it at `/data`.

---

## Option B — Vercel — requires Postgres

Vercel's serverless filesystem is ephemeral, so SQLite will not persist. Use a
managed Postgres (Neon, Supabase, or Vercel Postgres).

1. In `prisma/schema.prisma` change the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set `DATABASE_URL` to your Postgres connection string and `AUTH_SECRET` in
   the Vercel project settings.
3. Run `npx prisma db push` against the database once (locally or in a build
   step) to create the schema.
4. Import the repo into Vercel and deploy. The build already runs
   `prisma generate`.

> The schema is written to be portable — no SQLite-specific column types are
> used — so switching the provider is the only change needed.

### File uploads on serverless
Driver document uploads currently write to `public/uploads` (fine on a
container host with a volume). On Vercel, swap `src/app/api/upload/route.ts`
for object storage (S3 / Vercel Blob / GCS); the response contract (a public
URL string) stays the same.

---

## Scheduled reminders

`POST /api/cron/reminders` sends idempotent day-before reminders. Wire it to a
scheduler:

- **Vercel Cron** — add to `vercel.json`:
  ```json
  { "crons": [{ "path": "/api/cron/reminders?secret=YOUR_SECRET", "schedule": "0 9 * * *" }] }
  ```
- **Any host** — a daily `curl -X POST "https://your-domain/api/cron/reminders?secret=YOUR_SECRET"`.

Admins can also trigger it from the dashboard button at any time.
