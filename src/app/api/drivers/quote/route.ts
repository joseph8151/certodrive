import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "DRIVER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.driverProfile.findUnique({ where: { userId: session.userId } });
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const { quoteId, action, supplyPrice, note } = body ?? {};
  const quote = await prisma.driverQuote.findUnique({ where: { id: quoteId }, include: { booking: true } });
  if (!quote || quote.driverProfileId !== profile.id) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  if (quote.status !== "REQUESTED") return NextResponse.json({ error: "Quote already handled" }, { status: 409 });

  if (action === "DECLINE") {
    await prisma.driverQuote.update({ where: { id: quoteId }, data: { status: "DECLINED", note: note ?? null, available: false } });
    return NextResponse.json({ ok: true });
  }

  if (action === "OFFER") {
    if (typeof supplyPrice !== "number" || supplyPrice <= 0) {
      return NextResponse.json({ error: "Invalid supply price" }, { status: 400 });
    }
    await prisma.$transaction(async (tx) => {
      await tx.driverQuote.update({
        where: { id: quoteId },
        data: { status: "OFFERED", supplyPrice, note: note ?? null, available: true, currency: profile.settlementCurrency },
      });
      // Move the booking forward on the first received offer.
      if (quote.booking.status === "QUOTE_REQUESTED") {
        await tx.booking.update({
          where: { id: quote.bookingId },
          data: {
            status: "QUOTE_RECEIVED",
            statusEvents: { create: { from: "QUOTE_REQUESTED", to: "QUOTE_RECEIVED", actor: `driver:${profile.id}`, note: "Driver offer received" } },
          },
        });
      }
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
