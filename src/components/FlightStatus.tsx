"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { FlightResult } from "@/lib/flights";

// Inline flight-status checker used in the booking widget. Non-blocking: if the
// tracking API isn't configured, it simply tells the user we'll track it after
// booking, rather than showing an error.
export default function FlightStatus({ flight, date, locale }: { flight: string; date?: string; locale: Locale }) {
  const L = locale === "ko";
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FlightResult | null>(null);

  async function check() {
    if (!flight.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const qs = new URLSearchParams({ flight: flight.trim() });
      if (date) qs.set("date", date);
      const res = await fetch(`/api/flights?${qs.toString()}`);
      setResult(await res.json());
    } catch {
      setResult({ configured: true, found: false });
    } finally {
      setLoading(false);
    }
  }

  const fmt = (s: string | null) => {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleString(L ? "ko-KR" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={check}
        disabled={!flight.trim() || loading}
        className="text-xs font-semibold text-[var(--color-ink)] underline underline-offset-2 disabled:opacity-40"
      >
        {loading ? (L ? "확인 중..." : "Checking...") : (L ? "항공편 도착 시간 확인" : "Check flight arrival")}
      </button>

      {result && (
        <div className="mt-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-mist)] px-3 py-2.5 text-xs">
          {!result.configured ? (
            <span className="text-[var(--color-slate)]">
              {L ? "항공편은 예약 후 자동으로 추적되어, 지연 시 기사님이 대기합니다." : "We track your flight automatically after booking and the driver waits on delays."}
            </span>
          ) : !result.found ? (
            <span className="text-[var(--color-slate)]">
              {L ? "해당 항공편 정보를 찾지 못했습니다. 예약은 그대로 진행하시면 되고, 예약 후 도착 시간을 확인해 드립니다." : "Couldn't find that flight now — book as usual and we'll confirm the arrival time after."}
            </span>
          ) : (
            <div className="grid gap-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--color-ink)]">{result.airline ? `${result.airline} · ` : ""}{result.flightIata}</span>
                {result.status && <span className="chip text-[10px] capitalize">{result.status}</span>}
              </div>
              <div className="text-[var(--color-slate)]">
                {result.departure.iata ?? "—"} → {result.arrival.iata ?? "—"}
              </div>
              {(result.arrival.estimated || result.arrival.scheduled) && (
                <div className="text-[var(--color-ink)]">
                  {L ? "도착 예정" : "Arrival"}: {fmt(result.arrival.estimated || result.arrival.scheduled)}
                  {result.arrival.terminal ? ` · ${L ? "터미널" : "Terminal"} ${result.arrival.terminal}` : ""}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
