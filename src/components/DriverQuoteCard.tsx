"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

type Booking = {
  reference: string;
  pickupLocation: string;
  destination: string;
  serviceDate: string;
  serviceTime: string;
  vehicleCategory: string;
  passengers: number;
  luggage: number;
  flightNumber: string | null;
  koreanDriverRequired: boolean;
  childSeat: boolean;
  airportPicket: boolean;
  specialRequest: string | null;
};

export default function DriverQuoteCard({
  quote,
  booking,
  locale,
  currency,
}: {
  quote: { id: string };
  booking: Booking;
  locale: Locale;
  currency: string;
}) {
  const router = useRouter();
  const L = locale === "ko";
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "OFFER" | "DECLINE") {
    if (action === "OFFER" && !price) return setError(L ? "공급 가격을 입력하세요." : "Enter your supply price.");
    setLoading(true);
    setError(null);
    const res = await fetch("/api/drivers/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId: quote.id, action, supplyPrice: price ? Number(price) : undefined, note }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "Error");
      setLoading(false);
    }
  }

  const chips = [
    booking.koreanDriverRequired && (L ? "한국어 필수" : "Korean required"),
    booking.childSeat && (L ? "카시트" : "Child seat"),
    booking.airportPicket && (L ? "피켓" : "Meet & greet"),
  ].filter(Boolean) as string[];

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="font-semibold">{booking.pickupLocation} → {booking.destination}</div>
          <div className="text-sm text-[var(--color-slate)]">
            {booking.serviceDate} {booking.serviceTime} · {booking.vehicleCategory} · {booking.passengers}{L ? "인" : "pax"} · {booking.luggage}{L ? "짐" : " bags"}
            {booking.flightNumber ? ` · ${booking.flightNumber}` : ""}
          </div>
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {chips.map((c) => <span key={c} className="pill pill-slate">{c}</span>)}
            </div>
          )}
          {booking.specialRequest && <p className="text-sm mt-2 text-[var(--color-slate)]">“{booking.specialRequest}”</p>}
        </div>
        <span className="text-xs text-[var(--color-slate)]">#{booking.reference}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[160px]">
          <label className="field-label">{L ? `공급 가격 (${currency})` : `Supply price (${currency})`}</label>
          <input type="number" className="input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="field-label">{L ? "메모" : "Note"}</label>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder={L ? "선택" : "optional"} />
        </div>
      </div>

      {error && <div className="text-sm text-[#a52626] mt-2">{error}</div>}

      <div className="flex gap-2 mt-4">
        <button className="btn btn-primary flex-1" disabled={loading} onClick={() => act("OFFER")}>
          {L ? "수락 및 공급가 제출" : "Accept & submit price"}
        </button>
        <button className="btn btn-outline" disabled={loading} onClick={() => act("DECLINE")}>
          {L ? "거절" : "Decline"}
        </button>
      </div>
    </div>
  );
}
