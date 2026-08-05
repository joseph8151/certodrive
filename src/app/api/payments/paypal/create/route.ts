import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createOrder } from "@/lib/paypal";
import { paymentConfig } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!paymentConfig().paypal) return NextResponse.json({ error: "PayPal not configured" }, { status: 400 });
  const { reference } = (await req.json().catch(() => ({}))) as { reference?: string };
  if (!reference) return NextResponse.json({ error: "Missing reference" }, { status: 400 });

  const booking = await prisma.booking.findUnique({ where: { reference } });
  if (!booking || booking.customerPrice == null) return NextResponse.json({ error: "Booking not payable" }, { status: 409 });
  if (booking.status !== "AWAITING_CUSTOMER_PAYMENT") return NextResponse.json({ error: "Not awaiting payment" }, { status: 409 });

  try {
    const order = await createOrder(booking.customerPrice, booking.currency, reference);
    return NextResponse.json({ id: order.id });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "PayPal error" }, { status: 502 });
  }
}
