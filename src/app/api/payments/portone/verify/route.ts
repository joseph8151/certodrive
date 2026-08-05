import { NextResponse } from "next/server";
import { confirmBookingPayment, paymentConfig } from "@/lib/payments";

export const dynamic = "force-dynamic";

// Verifies a PortOne (아임포트 v2) payment server-side, then confirms the
// booking. PortOne aggregates Korean methods: card, KakaoPay, NaverPay, Toss,
// bank transfer, phone. The browser requests payment via the PortOne SDK and
// hands us the paymentId; we confirm it against PortOne's API (never trusting
// the client) before marking the booking paid.
export async function POST(req: Request) {
  if (!paymentConfig().portone) return NextResponse.json({ error: "Korean payments not configured" }, { status: 400 });
  const secret = process.env.PORTONE_API_SECRET!;
  const { reference, paymentId } = (await req.json().catch(() => ({}))) as { reference?: string; paymentId?: string };
  if (!reference || !paymentId) return NextResponse.json({ error: "Missing reference or paymentId" }, { status: 400 });

  try {
    const res = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `PortOne ${secret}` },
    });
    const p = await res.json();
    if (!res.ok) return NextResponse.json({ error: p?.message || "PortOne lookup failed" }, { status: 502 });

    if (p.status !== "PAID") return NextResponse.json({ error: `Payment status ${p.status}` }, { status: 402 });

    const method = `KR:${p.method?.type ?? p.channel?.pgProvider ?? "PORTONE"}`;
    const confirmed = await confirmBookingPayment({
      reference,
      method,
      transactionRef: paymentId,
      paidAmount: typeof p.amount?.total === "number" ? p.amount.total : undefined,
      paidCurrency: p.currency,
    });
    if (!confirmed.ok) return NextResponse.json({ error: confirmed.error }, { status: confirmed.code });
    return NextResponse.json({ ok: true, status: confirmed.status });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "PortOne error" }, { status: 502 });
  }
}
