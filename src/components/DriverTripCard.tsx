"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import StatusPill from "./StatusPill";

type Booking = {
  id: string;
  reference: string;
  status: string;
  pickupLocation: string;
  destination: string;
  serviceDate: string;
  serviceTime: string;
  flightNumber: string | null;
  customerName: string;
  customerPhone: string;
  messenger: string | null;
  passengers: number;
  specialRequest: string | null;
};

export default function DriverTripCard({ booking, locale }: { booking: Booking; locale: Locale }) {
  const router = useRouter();
  const L = locale === "ko";
  const [loading, setLoading] = useState(false);

  async function action(action: string, evidenceUrl?: string) {
    setLoading(true);
    const res = await fetch("/api/drivers/trip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: booking.id, action, evidenceUrl }),
    });
    if (res.ok) router.refresh();
    else setLoading(false);
  }

  async function reportNoShow(e: React.ChangeEvent<HTMLInputElement> | null) {
    let evidenceUrl: string | undefined;
    const file = e?.target.files?.[0];
    if (file) {
      setLoading(true);
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      if (up.ok) evidenceUrl = (await up.json()).url;
    }
    await action("NO_SHOW", evidenceUrl);
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">{booking.pickupLocation} → {booking.destination}</div>
          <div className="text-sm text-[var(--color-slate)]">{booking.serviceDate} {booking.serviceTime}{booking.flightNumber ? ` · ${booking.flightNumber}` : ""}</div>
        </div>
        <StatusPill status={booking.status} locale={locale} />
      </div>

      <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
        <div><span className="text-[var(--color-slate)]">{L ? "고객" : "Customer"}: </span>{booking.customerName} ({booking.passengers}{L ? "인" : "pax"})</div>
        <div><span className="text-[var(--color-slate)]">{L ? "연락처" : "Contact"}: </span>{booking.customerPhone}{booking.messenger ? ` · ${booking.messenger}` : ""}</div>
      </div>
      {booking.specialRequest && <p className="text-sm mt-2 text-[var(--color-slate)]">“{booking.specialRequest}”</p>}

      <div className="flex flex-wrap gap-2 mt-4">
        {booking.status === "DRIVER_ASSIGNED" && (
          <button className="btn btn-primary" disabled={loading} onClick={() => action("CONFIRM")}>{L ? "운행 확정" : "Confirm trip"}</button>
        )}
        {booking.status === "DRIVER_CONFIRMED" && (
          <>
            <button className="btn btn-outline" disabled={loading} onClick={() => action("ARRIVED")}>{L ? "도착 알림" : "Notify arrival"}</button>
            <button className="btn btn-primary" disabled={loading} onClick={() => action("START")}>{L ? "운행 시작" : "Start trip"}</button>
          </>
        )}
        {booking.status === "IN_PROGRESS" && (
          <button className="btn btn-gold" disabled={loading} onClick={() => action("COMPLETE")}>{L ? "운행 완료" : "Complete trip"}</button>
        )}
        {["DRIVER_CONFIRMED", "IN_PROGRESS"].includes(booking.status) && (
          <div className="flex items-center gap-2">
            <label className="btn btn-ghost cursor-pointer">
              {L ? "노쇼 증빙 업로드" : "No-show + evidence"}
              <input type="file" className="hidden" disabled={loading} onChange={(e) => reportNoShow(e)} />
            </label>
            <button className="btn btn-ghost text-xs px-2" disabled={loading} onClick={() => reportNoShow(null)}>{L ? "증빙 없이 노쇼" : "No-show only"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
