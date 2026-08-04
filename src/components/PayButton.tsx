"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export default function PayButton({ reference, locale }: { reference: string; locale: Locale }) {
  const router = useRouter();
  const [method, setMethod] = useState("CARD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setError(null);
    try {
      // Simulated payment. A real integration (Stripe/PayPal) would collect
      // card / redirect here; the module boundary is /api/payments.
      const res = await fetch(`/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setLoading(false);
    }
  }

  return (
    <div className="card p-6">
      <h3 className="font-semibold text-lg">{locale === "ko" ? "결제" : "Payment"}</h3>
      <p className="text-sm text-[var(--color-slate)] mt-1">
        {locale === "ko" ? "예약 확정을 위해 선결제가 필요합니다." : "Secure prepayment confirms your booking."}
      </p>

      <div className="mt-4 grid gap-2">
        {[
          { id: "CARD", label: locale === "ko" ? "해외 신용카드 (Visa / Master / Amex)" : "International card (Visa / Master / Amex)" },
          { id: "PAYPAL", label: "PayPal" },
        ].map((m) => (
          <label
            key={m.id}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer ${
              method === m.id ? "border-[var(--color-navy)] bg-[var(--color-mist)]" : "border-[var(--color-line)]"
            }`}
          >
            <input type="radio" name="method" checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-[var(--color-navy)]" />
            <span className="text-sm font-medium">{m.label}</span>
          </label>
        ))}
      </div>

      {error && <div className="mt-3 text-sm text-[#a52626]">{error}</div>}

      <button className="btn btn-gold w-full mt-4" onClick={pay} disabled={loading}>
        {loading ? (locale === "ko" ? "결제 처리 중..." : "Processing...") : locale === "ko" ? "안전하게 결제하기" : "Pay securely"}
      </button>
      <p className="text-xs text-[var(--color-slate)] mt-3 text-center">
        {locale === "ko"
          ? "MVP 데모 결제입니다. 실제 카드가 청구되지 않습니다."
          : "Demo payment for the MVP — no real card is charged."}
      </p>
    </div>
  );
}
