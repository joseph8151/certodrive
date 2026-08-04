import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendNotification } from "@/lib/notifications";
import { generateVoucherCode } from "@/lib/utils";

// Simulated payment capture for the MVP. Marks the booking paid, records the
// payment, issues the customer voucher, and moves it into the dispatch queue.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const reference: string | undefined = body?.reference;
  const method: string = body?.method ?? "CARD";
  if (!reference) return NextResponse.json({ error: "Missing reference" }, { status: 400 });

  const booking = await prisma.booking.findUnique({ where: { reference } });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.status !== "AWAITING_CUSTOMER_PAYMENT") {
    return NextResponse.json({ error: "Booking is not awaiting payment" }, { status: 409 });
  }
  if (booking.customerPrice == null) {
    return NextResponse.json({ error: "No price set" }, { status: 409 });
  }

  const route = `${booking.pickupLocation} → ${booking.destination}`;

  await prisma.$transaction([
    prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: { status: "COMPLETED", method, amount: booking.customerPrice, currency: booking.currency, paidAt: new Date(), transactionRef: `DEMO-${generateVoucherCode()}` },
      create: {
        bookingId: booking.id,
        amount: booking.customerPrice,
        currency: booking.currency,
        method,
        status: "COMPLETED",
        paidAt: new Date(),
        transactionRef: `DEMO-${generateVoucherCode()}`,
      },
    }),
    prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "DRIVER_ASSIGNMENT_PENDING",
        statusEvents: {
          create: [
            { from: booking.status, to: "PAYMENT_COMPLETED", actor: "customer", note: `Paid via ${method}` },
            { from: "PAYMENT_COMPLETED", to: "DRIVER_ASSIGNMENT_PENDING", actor: "system" },
          ],
        },
      },
    }),
    prisma.voucher.create({
      data: { bookingId: booking.id, type: "CUSTOMER", code: generateVoucherCode() },
    }),
  ]);

  await sendNotification({
    template: "PAYMENT_COMPLETED",
    recipientType: "CUSTOMER",
    to: booking.customerEmail,
    bookingId: booking.id,
    context: { reference, customerName: booking.customerName, route, amount: `${booking.customerPrice} ${booking.currency}` },
  });

  return NextResponse.json({ ok: true, status: "DRIVER_ASSIGNMENT_PENDING" });
}
