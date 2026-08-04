# Certo Drive

A global premium chauffeur & airport-transfer booking platform connecting travelers with **verified Korean-speaking (한인) drivers** in major cities worldwide. Certo Drive is a *managed, pre-booked* service — airport pickup/drop-off, intercity transfers, hourly hire and VIP chauffeur — not a real-time taxi-hailing app.

Built as a working MVP: real database, real booking lifecycle, real role-separated dashboards.

## Tech stack

- **Next.js 15** (App Router, React 19, TypeScript)
- **Prisma + SQLite** — zero external services to run locally
- **Tailwind CSS v4** — premium white / black / deep-navy design system
- **jose + bcrypt** — cookie session auth with three roles (customer / driver / admin)
- **Zod** — request validation

## The four MVP flows (all working end-to-end)

1. **Customer booking & quote request** — multi-step booking widget. Registered routes get an **instant price**; unregistered areas become a **quote request** broadcast to area drivers.
2. **Driver partner onboarding & booking acceptance** — self-serve registration with document upload, admin approval, and a partner dashboard to accept requests, submit a supply price, run trips and track settlements.
3. **Admin dispatch & pricing** — dashboard with every booking status queue, per-route price rules, commission policies, manual pricing, driver assignment (manual + offer-based), cancellation/refund, and audit logging.
4. **Payment → voucher** — simulated prepayment (card / PayPal module boundary at `/api/payments`), then customer + driver **booking vouchers** (printable / PDF-ready).

> In v1, driver payouts are **not** auto-distributed. Certo Drive collects the customer payment; after a trip completes an admin records the driver settlement status.

## Pricing engine (`src/lib/pricing.ts`)

Final customer price is composed from:
`driver supply price` + `platform margin` (commission %, floored by a **minimum booking fee**) + surcharges (Korean-driver fee, night, holiday, urgent-booking, child seat, airport meet & greet, extra waiting, tolls & parking) + payment processing fee, minus promotions.

Commission is resolved by the **most specific policy** (route > city > country > global), so long-haul Western-Europe routes can use a low rate while short-haul routes rely on the minimum booking fee.

## Booking status machine

`QUOTE_REQUESTED → QUOTE_RECEIVED → AWAITING_CUSTOMER_PAYMENT → PAYMENT_COMPLETED → DRIVER_ASSIGNMENT_PENDING → DRIVER_ASSIGNED → DRIVER_CONFIRMED → IN_PROGRESS → COMPLETED` (plus `CANCELLED`, `REFUNDED`, `NO_SHOW`). Every transition is recorded in `BookingStatusEvent`.

## Getting started

```bash
npm install
cp .env.example .env          # set AUTH_SECRET; DATABASE_URL defaults to SQLite
npm run db:push               # create the SQLite schema
npm run db:seed               # seed admin, drivers, routes, pricing
npm run dev                   # http://localhost:3000
```

### Demo accounts

| Role   | Email                          | Password      |
|--------|--------------------------------|---------------|
| Admin  | `admin@certodrive.com`         | `password123` |
| Driver | `driver.seoul@certodrive.com`  | `password123` |
| Driver | `driver.paris@certodrive.com`  | `password123` |

Customers book without an account and manage bookings via **reference + email** at `/lookup`.

### Try the instant-price path
Book **Seoul → ICN 인천공항 → 서울 시내, Business Sedan** on the homepage: it's a seeded route, so you get a price immediately and can pay. Any other route becomes a quote request routed to matching drivers.

## Notable routes

| Area | Path |
|------|------|
| Customer | `/`, `/register`, `/account` (my bookings), `/booking/[service]`, `/destinations/[city]`, `/lookup`, `/booking/confirm/[reference]` (pay + post-trip review), `/voucher/[code]` |
| Driver | `/driver`, `/driver/profile` (profile, vehicles, documents, availability) |
| Admin | `/admin`, `/admin/bookings`, `/admin/analytics`, `/admin/pricing`, `/admin/promotions`, `/admin/rates`, `/admin/drivers`, `/admin/settlements` (+ CSV export), `/admin/cms`, `/admin/inbox` |
| APIs | `/api/bookings`, `/api/bookings/change`, `/api/payments`, `/api/reviews`, `/api/drivers/*`, `/api/admin/actions`, `/api/auth/*` |

Promotion codes (PERCENT/FIXED) apply at booking; admins manage promos, exchange rates, inquiries and corporate applications. After a completed trip the customer can leave a **review**, which recomputes the driver's rating. The **analytics** page reports revenue by country/route/driver, average margin and conversion rate, normalizing multi-currency totals to USD.

**Booking changes** — from the confirmation page a customer can request changes (date/time/pickup/destination/passengers/flight), verified by email; an admin applies or rejects them and the booking updates in place. **City landing CMS** — admins edit per-city headline, intro, FAQ and SEO at `/admin/cms`; published content overrides the default city page and renders an FAQ section. **Settlement CSV export** — `/api/admin/settlements/export` streams all settlements as CSV.

**Customer accounts** — sign up at `/register`, then `/account` lists your upcoming and past bookings (guest bookings made with the same email are adopted on sign-up). **Driver self-service** — `/driver/profile` edits service areas, languages, settlement details, availability (accepting-bookings toggle + notes), vehicles (add/remove) and document re-uploads; drivers can attach **no-show evidence** when reporting a no-show. **Automated notifications** — `POST/GET /api/cron/reminders` sends idempotent day-before reminders (run it from a scheduler with `?secret=$CRON_SECRET`, or from the admin dashboard button); admins can send a **flight-delay** notice for any booking with a flight number.

## Internationalization & currency

Korean (default) and English throughout, toggled in the header (`cd_locale` cookie). Multi-currency is modelled per route/driver with an `ExchangeRate` table.

## What's stubbed for the MVP

- **Payment** is simulated — the module boundary (`/api/payments`) is where Stripe/PayPal slots in.
- **Notifications** render from templates and persist to the `Notification` table + server log (visible in admin), instead of live email / KakaoTalk / WhatsApp transport.
- **Document upload** saves to `public/uploads` — swap for S3/GCS with the same response contract.
- **Vouchers** are printable HTML pages (browser "Save as PDF"); a server-side PDF renderer can be added later.
