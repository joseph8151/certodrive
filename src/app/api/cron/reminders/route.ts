import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendNotification } from "@/lib/notifications";

// Day-before reminder job. Idempotent: skips bookings that already have a
// DAY_BEFORE_REMINDER notification. Intended to run daily via a scheduler
// (Vercel Cron / external cron / CI schedule) hitting this URL with
// ?secret=$CRON_SECRET, or manually by an admin from the dashboard.
async function authorized(req: Request): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const url = new URL(req.url);
    if (url.searchParams.get("secret") === secret) return true;
    if (req.headers.get("x-cron-secret") === secret) return true;
  }
  const session = await getSession();
  return session?.role === "ADMIN";
}

const ACTIVE = ["PAYMENT_COMPLETED", "DRIVER_ASSIGNMENT_PENDING", "DRIVER_ASSIGNED", "DRIVER_CONFIRMED"];

async function run() {
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10);

  const bookings = await prisma.booking.findMany({
    where: { serviceDate: tomorrow, status: { in: ACTIVE } },
    include: { assignedDriver: { include: { user: true } }, notifications: { where: { template: "DAY_BEFORE_REMINDER" } } },
  });

  let sent = 0;
  for (const b of bookings) {
    if (b.notifications.length > 0) continue; // already reminded
    const ctx = { reference: b.reference, customerName: b.customerName, route: `${b.pickupLocation} → ${b.destination}`, dateTime: `${b.serviceDate} ${b.serviceTime}` };
    await sendNotification({ template: "DAY_BEFORE_REMINDER", recipientType: "CUSTOMER", to: b.customerEmail, bookingId: b.id, context: ctx });
    if (b.assignedDriver) {
      await sendNotification({ template: "DAY_BEFORE_REMINDER", recipientType: "DRIVER", to: b.assignedDriver.user.email, bookingId: b.id, context: ctx });
    }
    sent += 1;
  }
  return { date: tomorrow, candidates: bookings.length, sent };
}

export async function GET(req: Request) {
  if (!(await authorized(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await run());
}

export async function POST(req: Request) {
  if (!(await authorized(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await run());
}
