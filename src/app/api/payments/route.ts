import { NextResponse } from "next/server";
import { confirmBookingPayment, paymentConfig } from "@/lib/payments";
import { generateVoucherCode } from "@/lib/utils";

// Manual / bank-transfer / demo confirmation. Only usable when no real gateway
// is configured (or ENABLE_MANUAL_PAYMENT=1). Real card/PayPal/Korean payments
// go through their dedicated gateway routes and share confirmBookingPayment().
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const reference: string | undefined = body?.reference;
  const method: string = body?.method ?? "BANK_TRANSFER";
  if (!reference) return NextResponse.json({ error: "Missing reference" }, { status: 400 });

  if (!paymentConfig().allowManual) {
    return NextResponse.json({ error: "Please use a card, PayPal or Korean payment method." }, { status: 400 });
  }

  const result = await confirmBookingPayment({ reference, method, transactionRef: `MANUAL-${generateVoucherCode()}` });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.code });
  return NextResponse.json({ ok: true, status: result.status });
}
