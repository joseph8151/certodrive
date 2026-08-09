import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Direct customer <-> driver chat for a booking.
// - Customer: identified by knowing the booking reference (same trust model as
//   the voucher / lookup pages); posts as CUSTOMER.
// - Driver: must be signed in AND be the assigned driver; posts as DRIVER.
// - Admin: posts as ADMIN.

async function resolveSender(reference: string) {
  const booking = await prisma.booking.findUnique({ where: { reference } });
  if (!booking) return { error: "Booking not found", code: 404 as const };

  const session = await getSession();
  if (session?.role === "ADMIN") {
    return { booking, sender: "ADMIN" as const, senderName: session.name || "Certo Drive" };
  }
  if (session?.role === "DRIVER") {
    const profile = await prisma.driverProfile.findUnique({ where: { userId: session.userId } });
    if (!profile || booking.assignedDriverId !== profile.id) {
      return { error: "Not the assigned driver", code: 403 as const };
    }
    return { booking, sender: "DRIVER" as const, senderName: profile.contactName };
  }
  // Anonymous with the reference → treated as the customer.
  return { booking, sender: "CUSTOMER" as const, senderName: booking.customerName };
}

export async function GET(req: Request) {
  const reference = new URL(req.url).searchParams.get("reference") || "";
  const booking = await prisma.booking.findUnique({ where: { reference } });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const messages = await prisma.bookingMessage.findMany({
    where: { bookingId: booking.id },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const { reference, body } = (await req.json().catch(() => ({}))) as { reference?: string; body?: string };
  if (!reference || !body || !body.trim()) return NextResponse.json({ error: "Missing message" }, { status: 400 });
  if (body.length > 2000) return NextResponse.json({ error: "Message too long" }, { status: 400 });

  const r = await resolveSender(reference);
  if ("error" in r) return NextResponse.json({ error: r.error }, { status: r.code });

  const msg = await prisma.bookingMessage.create({
    data: { bookingId: r.booking.id, sender: r.sender, senderName: r.senderName, body: body.trim() },
  });
  return NextResponse.json({ ok: true, message: msg });
}
