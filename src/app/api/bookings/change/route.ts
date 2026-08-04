import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendNotification } from "@/lib/notifications";

const TERMINAL = ["COMPLETED", "CANCELLED", "REFUNDED", "NO_SHOW"];
const ALLOWED = ["serviceDate", "serviceTime", "pickupLocation", "destination", "passengers", "flightNumber"] as const;

// Customer requests changes to an active booking. Verified by reference + email.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const reference: string | undefined = body?.reference;
  const email: string | undefined = body?.email;
  const note: string | undefined = body?.note;
  const changesIn = (body?.changes ?? {}) as Record<string, unknown>;

  if (!reference || !email) return NextResponse.json({ error: "Missing reference or email" }, { status: 400 });

  const booking = await prisma.booking.findUnique({ where: { reference } });
  if (!booking || booking.customerEmail.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (TERMINAL.includes(booking.status)) {
    return NextResponse.json({ error: "This booking can no longer be changed online. Please contact support." }, { status: 409 });
  }

  // Keep only allowed, non-empty fields that actually differ.
  const changes: Record<string, string | number> = {};
  for (const key of ALLOWED) {
    const v = changesIn[key];
    if (v === undefined || v === null || v === "") continue;
    const val = key === "passengers" ? Number(v) : String(v);
    if (val !== (booking as Record<string, unknown>)[key]) changes[key] = val;
  }
  if (Object.keys(changes).length === 0 && !note) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }

  await prisma.bookingChangeRequest.create({
    data: { bookingId: booking.id, changes: JSON.stringify(changes), note: note ?? null },
  });

  await sendNotification({
    template: "CHANGE_REQUESTED",
    recipientType: "CUSTOMER",
    to: booking.customerEmail,
    bookingId: booking.id,
    context: { reference: booking.reference, customerName: booking.customerName, route: `${booking.pickupLocation} → ${booking.destination}` },
  });

  return NextResponse.json({ ok: true });
}
