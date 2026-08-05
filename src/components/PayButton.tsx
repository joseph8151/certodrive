"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { formatMoney } from "@/lib/utils";

export type PayConfig = {
  paypal: boolean;
  paypalClientId: string;
  portone: boolean;
  portoneStoreId: string;
  portoneChannelKey: string;
  allowManual: boolean;
};

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") return reject();
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === "1") resolve();
      else existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject());
      return;
    }
    const s = document.createElement("script");
    s.src = src; s.id = id; s.async = true;
    s.addEventListener("load", () => { s.dataset.loaded = "1"; resolve(); });
    s.addEventListener("error", () => reject());
    document.head.appendChild(s);
  });
}

export default function PayButton({
  reference,
  locale,
  amount,
  currency,
  config,
  customerName = "",
  customerEmail = "",
}: {
  reference: string;
  locale: Locale;
  amount: number;
  currency: string;
  config: PayConfig;
  customerName?: string;
  customerEmail?: string;
}) {
  const router = useRouter();
  const L = locale === "ko";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = [
    config.paypal && { id: "PAYPAL", label: "PayPal", desc: L ? "해외 결제 · 카드" : "International · card" },
    config.portone && { id: "KR_EASY", label: L ? "간편결제" : "Easy pay", desc: L ? "카카오페이 · 네이버페이 · 토스" : "KakaoPay · NaverPay · Toss" },
    config.portone && { id: "KR_CARD", label: L ? "국내 카드" : "Korean card", desc: L ? "국내 신용·체크카드" : "Korean credit/debit" },
    config.allowManual && { id: "MANUAL", label: L ? "계좌이체 · 데모" : "Bank transfer · demo", desc: L ? "관리자 확인 결제" : "Manually confirmed" },
  ].filter(Boolean) as { id: string; label: string; desc: string }[];

  const [method, setMethod] = useState(methods[0]?.id ?? "MANUAL");
  const ppRef = useRef<HTMLDivElement>(null);

  // Render PayPal Smart Buttons when that method is active.
  useEffect(() => {
    if (method !== "PAYPAL" || !config.paypal || !config.paypalClientId) return;
    let mounted = true;
    loadScript(`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(config.paypalClientId)}&currency=${encodeURIComponent(currency)}`, "paypal-sdk")
      .then(() => {
        const paypal = (window as unknown as { paypal?: any }).paypal;
        if (!mounted || !ppRef.current || !paypal) return;
        ppRef.current.innerHTML = "";
        paypal.Buttons({
          style: { color: "gold", shape: "pill", label: "pay", height: 46 },
          createOrder: async () => {
            const r = await fetch("/api/payments/paypal/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference }) });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error || "PayPal error");
            return d.id;
          },
          onApprove: async (data: { orderID: string }) => {
            setError(null);
            const r = await fetch("/api/payments/paypal/capture", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference, orderId: data.orderID }) });
            const d = await r.json();
            if (!r.ok) { setError(d.error || "Payment failed"); return; }
            router.refresh();
          },
          onError: () => setError(L ? "PayPal 결제 중 오류가 발생했습니다." : "A PayPal error occurred."),
        }).render(ppRef.current);
      })
      .catch(() => setError(L ? "PayPal을 불러오지 못했습니다." : "Could not load PayPal."));
    return () => { mounted = false; };
  }, [method, config.paypal, config.paypalClientId, currency, reference, router, L]);

  async function payKorean(payMethod: "EASY_PAY" | "CARD") {
    setLoading(true); setError(null);
    try {
      await loadScript("https://cdn.portone.io/v2/browser-sdk.js", "portone-sdk");
      const PortOne = (window as unknown as { PortOne?: any }).PortOne;
      if (!PortOne) throw new Error("SDK");
      const resp = await PortOne.requestPayment({
        storeId: config.portoneStoreId,
        channelKey: config.portoneChannelKey,
        paymentId: `cd-${reference}-${Date.now().toString(36)}`,
        orderName: `Certo Drive ${reference}`,
        totalAmount: Math.round(amount),
        currency: `CURRENCY_${currency}`,
        payMethod,
        customer: { fullName: customerName || undefined, email: customerEmail || undefined },
      });
      if (resp?.code != null) { setError(resp.message || (L ? "결제가 취소되었습니다." : "Payment cancelled.")); setLoading(false); return; }
      const r = await fetch("/api/payments/portone/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference, paymentId: resp.paymentId }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Verification failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error && e.message !== "SDK" ? e.message : (L ? "결제를 완료하지 못했습니다." : "Payment could not be completed."));
      setLoading(false);
    }
  }

  async function payManual() {
    setLoading(true); setError(null);
    try {
      const r = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference, method: "BANK_TRANSFER" }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Payment failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setLoading(false);
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{L ? "결제" : "Payment"}</h3>
        <span className="font-display text-xl font-bold text-[var(--color-navy)]">{formatMoney(amount, currency)}</span>
      </div>
      <p className="text-sm text-[var(--color-slate)] mt-1">
        {L ? "예약 확정을 위해 선결제가 필요합니다." : "Secure prepayment confirms your booking."}
      </p>

      {methods.length === 0 ? (
        <p className="mt-4 text-sm text-[#a52626]">{L ? "결제 수단이 설정되지 않았습니다. 관리자에게 문의하세요." : "No payment method configured."}</p>
      ) : (
        <>
          <div className="mt-4 grid gap-2">
            {methods.map((m) => (
              <label key={m.id} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer ${method === m.id ? "border-[var(--color-navy)] bg-[var(--color-mist)]" : "border-[var(--color-line)]"}`}>
                <input type="radio" name="method" checked={method === m.id} onChange={() => { setMethod(m.id); setError(null); }} className="accent-[var(--color-navy)]" />
                <span>
                  <span className="text-sm font-medium block">{m.label}</span>
                  <span className="text-xs text-[var(--color-slate)]">{m.desc}</span>
                </span>
              </label>
            ))}
          </div>

          {error && <div className="mt-3 text-sm text-[#a52626]">{error}</div>}

          <div className="mt-4">
            {method === "PAYPAL" && <div ref={ppRef} />}
            {method === "KR_EASY" && (
              <button className="btn btn-gold w-full" onClick={() => payKorean("EASY_PAY")} disabled={loading}>
                {loading ? (L ? "결제 진행 중..." : "Processing...") : (L ? "간편결제로 결제하기" : "Pay with easy pay")}
              </button>
            )}
            {method === "KR_CARD" && (
              <button className="btn btn-gold w-full" onClick={() => payKorean("CARD")} disabled={loading}>
                {loading ? (L ? "결제 진행 중..." : "Processing...") : (L ? "카드로 결제하기" : "Pay with card")}
              </button>
            )}
            {method === "MANUAL" && (
              <button className="btn btn-gold w-full" onClick={payManual} disabled={loading}>
                {loading ? (L ? "처리 중..." : "Processing...") : (L ? "결제 확인 요청" : "Confirm payment")}
              </button>
            )}
          </div>

          <p className="text-xs text-[var(--color-slate)] mt-3 text-center">
            {method === "MANUAL"
              ? (L ? "실제 결제 연동 전 임시 확인 수단입니다." : "Temporary confirmation until a live gateway is connected.")
              : (L ? "결제는 안전하게 암호화되어 처리됩니다." : "Payments are securely encrypted.")}
          </p>
        </>
      )}
    </div>
  );
}
