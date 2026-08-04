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

## Option A — Railway (recommended) — deploys as-is with SQLite

`railway.json` and the `Dockerfile` are included, so Railway builds and runs the
app with no code changes. The container runs `prisma db push` on start and the
health check hits `/api/health`.

1. **railway.app → New Project → Deploy from GitHub repo** → select this repo.
2. **Variables** — add:
   - `AUTH_SECRET` = output of `openssl rand -base64 48`
   - `DATABASE_URL` = `file:/data/prod.db`
3. **Volume** — create one and mount it at `/data` (persists the SQLite file
   across restarts/redeploys; without it the data is ephemeral).
4. Deploy. Railway assigns a public domain automatically.
5. Optional demo data: open a shell on the service and run `npm run db:seed`.

Render and Fly.io work the same way via the `Dockerfile` (on Fly, create a
volume with `fly volumes create data` and mount at `/data`).

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
