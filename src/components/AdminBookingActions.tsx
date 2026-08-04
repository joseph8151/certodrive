"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { formatMoney } from "@/lib/utils";

type Quote = {
  id: string;
  supplyPrice: number | null;
  currency: string;
  status: string;
  note: string | null;
  driver: { id: string; contactName: string; businessName: string; koreanLevel: string; rating: number; city: string };
};

type Props = {
  bookingId: string;
  status: string;
  currency: string;
  supplyPrice: number | null;
  customerPrice: number | null;
  hasVoucher: boolean;
  flightNumber: string | null;
  quotes: Quote[];
  approvedDrivers: { id: string; contactName: string; businessName: string; city: string; koreanLevel: string }[];
  locale: Locale;
};

async function post(body: unknown) {
  const res = await fetch("/api/admin/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error ?? "Action failed");
  }
  return res.json();
}

export default function AdminBookingActions({
  bookingId, status, currency, supplyPrice, customerPrice, hasVoucher, flightNumber, quotes, approvedDrivers, locale,
}: Props) {
  const router = useRouter();
  const L = locale === "ko";
  const [supply, setSupply] = useState(supplyPrice ? String(supplyPrice) : "");
  const [toll, setToll] = useState("");
  const [waiting, setWaiting] = useState("");
  const [holiday, setHoliday] = useState(false);
  const [driverId, setDriverId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>, okMsg?: string) {
    setBusy(true); setError(null); setMsg(null);
    try { await fn(); if (okMsg) setMsg(okMsg); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setBusy(false); }
  }

  const canPrice = ["QUOTE_REQUESTED", "QUOTE_RECEIVED", "AWAITING_CUSTOMER_PAYMENT"].includes(status);
  const canConfirmPayment = status === "AWAITING_CUSTOMER_PAYMENT";
  const canAssign = ["PAYMENT_COMPLETED", "DRIVER_ASSIGNMENT_PENDING", "DRIVER_ASSIGNED"].includes(status);
  const canCancel = !["COMPLETED", "CANCELLED", "REFUNDED"].includes(status);
  const canFlightDelay = !!flightNumber && ["PAYMENT_COMPLETED", "DRIVER_ASSIGNMENT_PENDING", "DRIVER_ASSIGNED", "DRIVER_CONFIRMED", "IN_PROGRESS"].includes(status);

  return (
    <div className="grid gap-5">
      {error && <div className="rounded-lg bg-[#fdeaea] text-[#a52626] text-sm px-3 py-2">{error}</div>}
      {msg && <div className="rounded-lg bg-[#e6f5ec] text-[#16794a] text-sm px-3 py-2">{msg}</div>}

      {/* Driver offers */}
      {quotes.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold mb-3">{L ? "기사 공급가 제안" : "Driver offers"}</h3>
          <div className="grid gap-2">
            {quotes.map((q) => (
              <div key={q.id} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-line)] p-3">
                <div>
                  <div className="font-medium text-sm">{q.driver.contactName} · {q.driver.businessName}</div>
                  <div className="text-xs text-[var(--color-slate)]">{q.driver.city} · KO {q.driver.koreanLevel} · ★{q.driver.rating.toFixed(1)} {q.note ? `· ${q.note}` : ""}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatMoney(q.supplyPrice, q.currency)}</span>
                  {q.supplyPrice != null && (
                    <button className="btn btn-outline text-sm py-1.5 px-3" disabled={busy}
                      onClick={() => run(() => post({ action: "SET_PRICE", bookingId, supplyPrice: q.supplyPrice }), L ? "가격이 설정되었습니다." : "Price set.")}>
                      {L ? "이 가격 적용" : "Use price"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing */}
      {canPrice && (
        <div className="card p-5">
          <h3 className="font-semibold mb-3">{L ? "최종 가격 계산" : "Set final price"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="field-label">{L ? `기사 공급가 (${currency})` : `Driver supply (${currency})`}</label><input type="number" className="input" value={supply} onChange={(e) => setSupply(e.target.value)} /></div>
            <div><label className="field-label">{L ? "톨게이트·주차" : "Toll & parking"}</label><input type="number" className="input" value={toll} onChange={(e) => setToll(e.target.value)} /></div>
            <div><label className="field-label">{L ? "추가 대기(시간)" : "Extra waiting (hrs)"}</label><input type="number" className="input" value={waiting} onChange={(e) => setWaiting(e.target.value)} /></div>
            <label className="flex items-center gap-2 mt-6 text-sm"><input type="checkbox" className="accent-[var(--color-navy)]" checked={holiday} onChange={(e) => setHoliday(e.target.checked)} />{L ? "휴일 할증 적용" : "Holiday surcharge"}</label>
          </div>
          <button className="btn btn-primary mt-4" disabled={busy || !supply}
            onClick={() => run(() => post({ action: "SET_PRICE", bookingId, supplyPrice: Number(supply), tollAndParking: toll, extraWaitingHours: waiting, isHoliday: holiday }), L ? "고객에게 결제 요청을 발송했습니다." : "Price set & payment requested.")}>
            {L ? "가격 계산 및 결제 요청" : "Calculate & request payment"}
          </button>
        </div>
      )}

      {/* Manual payment confirm */}
      {canConfirmPayment && (
        <div className="card p-5">
          <h3 className="font-semibold">{L ? "결제 확인" : "Confirm payment"}</h3>
          <p className="text-sm text-[var(--color-slate)] mt-1">{L ? "고객가" : "Customer price"}: <b>{formatMoney(customerPrice, currency)}</b></p>
          <button className="btn btn-outline mt-3" disabled={busy}
            onClick={() => run(() => post({ action: "CONFIRM_PAYMENT", bookingId }), L ? "결제가 확인되었습니다." : "Payment confirmed.")}>
            {L ? "수동 결제 확인 (계좌이체 등)" : "Mark as paid (bank transfer)"}
          </button>
        </div>
      )}

      {/* Assign driver */}
      {canAssign && (
        <div className="card p-5">
          <h3 className="font-semibold mb-3">{L ? "기사 배정" : "Assign driver"}</h3>
          <div className="flex gap-2">
            <select className="select flex-1" value={driverId} onChange={(e) => setDriverId(e.target.value)}>
              <option value="">{L ? "기사 선택" : "Select driver"}</option>
              {approvedDrivers.map((d) => (
                <option key={d.id} value={d.id}>{d.contactName} — {d.businessName} ({d.city}, KO {d.koreanLevel})</option>
              ))}
            </select>
            <button className="btn btn-primary" disabled={busy || !driverId}
              onClick={() => run(() => post({ action: "ASSIGN_DRIVER", bookingId, driverProfileId: driverId }), L ? "기사가 배정되었습니다." : "Driver assigned.")}>
              {L ? "배정" : "Assign"}
            </button>
          </div>
        </div>
      )}

      {/* Voucher + cancel */}
      <div className="card p-5 grid gap-3">
        <h3 className="font-semibold">{L ? "바우처 및 상태" : "Voucher & status"}</h3>
        <button className="btn btn-primary" disabled={busy}
          onClick={() => run(() => post({ action: "GENERATE_VOUCHER", bookingId }), L ? "바우처가 생성되었습니다." : "Vouchers generated.")}>
          {hasVoucher ? (L ? "바우처 재생성/확인" : "Ensure vouchers") : (L ? "예약 바우처 생성" : "Generate vouchers")}
        </button>
        {canFlightDelay && (
          <button className="btn btn-outline" disabled={busy}
            onClick={() => run(() => post({ action: "FLIGHT_DELAY", bookingId }), L ? "항공편 지연 안내를 발송했습니다." : "Flight-delay notice sent.")}>
            {L ? "항공편 지연 안내 발송" : "Send flight-delay notice"}
          </button>
        )}
        {canCancel && (
          <div className="flex gap-2">
            <button className="btn btn-ghost flex-1" disabled={busy}
              onClick={() => run(() => post({ action: "CANCEL", bookingId, refund: false }), L ? "취소되었습니다." : "Cancelled.")}>
              {L ? "예약 취소" : "Cancel"}
            </button>
            <button className="btn btn-outline flex-1" disabled={busy}
              onClick={() => run(() => post({ action: "CANCEL", bookingId, refund: true }), L ? "환불 처리되었습니다." : "Refunded.")}>
              {L ? "취소 및 환불" : "Cancel & refund"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
