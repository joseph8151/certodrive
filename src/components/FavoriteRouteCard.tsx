"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export type Favorite = {
  id: string; serviceType: string; pickupCountry: string; pickupCity: string;
  pickupLocation: string; destination: string; vehicleCategory: string; label: string | null;
};

export function bookHref(f: { serviceType: string; pickupCountry: string; pickupCity: string; pickupLocation: string; destination: string; vehicleCategory: string }) {
  const q = new URLSearchParams({
    serviceType: f.serviceType, pickupCountry: f.pickupCountry, pickupCity: f.pickupCity,
    pickupLocation: f.pickupLocation, destination: f.destination, vehicleCategory: f.vehicleCategory,
  });
  return `/?${q.toString()}#book`;
}

export default function FavoriteRouteCard({ fav, locale }: { fav: Favorite; locale: Locale }) {
  const router = useRouter();
  const L = locale === "ko";
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    const res = await fetch("/api/favorites", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: fav.id }) });
    if (res.ok) router.refresh(); else setBusy(false);
  }

  return (
    <div className="card p-5 flex flex-col">
      <div className="text-xs text-[var(--color-slate)]">{fav.pickupCity}, {fav.pickupCountry}</div>
      <div className="font-medium mt-1">{fav.pickupLocation} → {fav.destination}</div>
      <div className="text-xs text-[var(--color-slate)] mt-1">{fav.vehicleCategory}</div>
      <div className="flex gap-2 mt-4">
        <Link href={bookHref(fav)} className="btn btn-primary text-sm py-1.5 px-3 flex-1">{L ? "이 노선 예약" : "Book this route"}</Link>
        <button className="btn btn-ghost text-sm py-1.5 px-3" disabled={busy} onClick={remove}>{L ? "삭제" : "Remove"}</button>
      </div>
    </div>
  );
}
