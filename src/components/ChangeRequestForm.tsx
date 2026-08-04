"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

export default function ChangeRequestForm({ reference, locale }: { reference: string; locale: Locale }) {
  const L = locale === "ko";
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({ email: "", serviceDate: "", serviceTime: "", pickupLocation: "", destination: "", passengers: "", flightNumber: "", note: "" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading"); setError(null);
    const changes: Record<string, string> = {};
    for (const k of ["serviceDate", "serviceTime", "pickupLocation", "destination", "passengers", "flightNumber"] as const) {
      if (f[k]) changes[k] = f[k];
    }
    const res = await fetch("/api/bookings/change", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, email: f.email, changes, note: f.note }),
    });
    if (res.ok) setStatus("done");
    else { const d = await res.json().catch(() => ({})); setError(d.error ?? "Error"); setStatus("idle"); }
  }

  if (status === "done") {
    return (
      <div className="card p-6 text-center">
        <div className="text-2xl">✅</div>
        <p className="mt-2 font-medium">{L ? "변경 요청이 접수되었습니다." : "Change request received."}</p>
        <p className="text-sm text-[var(--color-slate)] mt-1">{L ? "매니저 확인 후 이메일로 안내드립니다." : "We'll email you once a manager reviews it."}</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <button className="flex items-center justify-between w-full" onClick={() => setOpen((v) => !v)}>
        <span className="font-semibold text-lg">{L ? "예약 변경 요청" : "Request a change"}</span>
        <span className="text-[var(--color-slate)]">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <form onSubmit={submit} className="grid gap-3 mt-4">
          <p className="text-sm text-[var(--color-slate)]">{L ? "변경할 항목만 입력하세요. 본인 확인을 위해 예약 이메일이 필요합니다." : "Fill only the fields you want to change. Your booking email is required to verify."}</p>
          <div><label className="field-label">{L ? "예약 이메일" : "Booking email"}</label><input type="email" className="input" value={f.email} onChange={(e) => set("email", e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="field-label">{L ? "새 날짜" : "New date"}</label><input type="date" className="input" value={f.serviceDate} onChange={(e) => set("serviceDate", e.target.value)} /></div>
            <div><label className="field-label">{L ? "새 시간" : "New time"}</label><input type="time" className="input" value={f.serviceTime} onChange={(e) => set("serviceTime", e.target.value)} /></div>
          </div>
          <div><label className="field-label">{L ? "새 픽업 장소" : "New pickup"}</label><input className="input" value={f.pickupLocation} onChange={(e) => set("pickupLocation", e.target.value)} /></div>
          <div><label className="field-label">{L ? "새 목적지" : "New destination"}</label><input className="input" value={f.destination} onChange={(e) => set("destination", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="field-label">{L ? "승객 수" : "Passengers"}</label><input type="number" min={1} className="input" value={f.passengers} onChange={(e) => set("passengers", e.target.value)} /></div>
            <div><label className="field-label">{L ? "항공편" : "Flight"}</label><input className="input" value={f.flightNumber} onChange={(e) => set("flightNumber", e.target.value.toUpperCase())} /></div>
          </div>
          <div><label className="field-label">{L ? "요청 메모" : "Note"}</label><textarea className="textarea" rows={2} value={f.note} onChange={(e) => set("note", e.target.value)} /></div>
          {error && <div className="text-sm text-[#a52626]">{error}</div>}
          <button className="btn btn-primary" disabled={status === "loading"}>{status === "loading" ? "..." : L ? "변경 요청 보내기" : "Send change request"}</button>
        </form>
      )}
    </div>
  );
}
