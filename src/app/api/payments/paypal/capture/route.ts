import { NextResponse } from "next/server";
import { captureOrder } from "@/lib/paypal";
import { confirmBookingPayment, paymentConfig } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!paymentConfig().paypal) return NextResponse.json({ error: "PayPal not configured" }, { status: 400 });
  const { reference, orderId } = (await req.json().catch(() => ({}))) as { reference?: string; orderId?: string };
  if (!reference || !orderId) return NextResponse.json({ error: "Missing reference or orderId" }, { status: 400 });

  try {
    const result = await captureOrder(orderId);
    if (result.status !== "COMPLETED") return NextResponse.json({ error: `PayPal status ${result.status}` }, { status: 402 });

    const cap = result.purchase_units?.[0]?.payments?.captures?.[0];
    const paidAmount = cap ? Number(cap.amount.value) : undefined;
    const confirmed = await confirmBookingPayment({
      reference,
      method: "PAYPAL",
      transactionRef: cap?.id ?? orderId,
      paidAmount,
      paidCurrency: cap?.amount.currency_code,
    });
    if (!confirmed.ok) return NextResponse.json({ error: confirmed.error }, { status: confirmed.code });
    return NextResponse.json({ ok: true, status: confirmed.status });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "PayPal capture error" }, { status: 502 });
  }
}
