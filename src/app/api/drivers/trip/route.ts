import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendNotification } from "@/lib/notifications";

const TRANSITIONS: Record<string, { from: string[]; to: string }> = {
  CONFIRM: { from: ["DRIVER_ASSIGNED"], to: "DRIVER_CONFIRMED" },
  START: { from: ["DRIVER_CONFIRMED"], to: "IN_PROGRESS" },
  COMPLETE: { from: ["IN_PROGRESS"], to: "COMPLETED" },
  NO_SHOW: { from: ["DRIVER_CONFIRMED", "IN_PROGRESS"], to: "NO_SHOW" },
};

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "DRIVER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await prisma.driverProfile.findUnique({ where: { userId: session.userId } });
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const { bookingId, action } = body ?? {};
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.assignedDriverId !== profile.id) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const route = `${booking.pickupLocation} → ${booking.destination}`;
  const ctx = { reference: booking.reference, customerName: booking.customerName, driverName: profile.contactName, route, dateTime: `${booking.serviceDate} ${booking.serviceTime}` };

  // Arrival notification is not a status transition.
  if (action === "ARRIVED") {
    await sendNotification({ template: "DRIVER_ARRIVED", recipientType: "CUSTOMER", to: booking.customerEmail, bookingId: booking.id, context: ctx });
    return NextResponse.json({ ok: true });
  }

  const tr = TRANSITIONS[action];
  if (!tr) return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  if (!tr.from.includes(booking.status)) return NextResponse.json({ error: `Cannot ${action} from ${booking.status}` }, { status: 409 });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: tr.to, statusEvents: { create: { from: booking.status, to: tr.to, actor: `driver:${profile.id}` } } },
  });

  if (action === "CONFIRM") {
    await sendNotification({ template: "DRIVER_INFO", recipientType: "CUSTOMER", to: booking.customerEmail, bookingId: booking.id, context: ctx });
  }

  if (action === "COMPLETE") {
    // Record the driver settlement (supply price) as pending.
    const existing = await prisma.settlement.findUnique({ where: { bookingId: booking.id } });
    if (!existing) {
      await prisma.settlement.create({
        data: {
          bookingId: booking.id,
          driverProfileId: profile.id,
          amount: booking.supplyPrice ?? profile.baseSupplyPrice ?? 0,
          currency: profile.settlementCurrency,
          status: "PENDING",
        },
      });
    }
    await sendNotification({ template: "TRIP_COMPLETED", recipientType: "CUSTOMER", to: booking.customerEmail, bookingId: booking.id, context: ctx });
    await sendNotification({ template: "REVIEW_REQUEST", recipientType: "CUSTOMER", to: booking.customerEmail, bookingId: booking.id, context: ctx });
  }

  return NextResponse.json({ ok: true, status: tr.to });
}
