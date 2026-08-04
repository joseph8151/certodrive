"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { VEHICLE_CATEGORIES, CURRENCIES } from "@/lib/constants";

export default function PriceRuleForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const L = locale === "ko";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({
    country: "", city: "", pickupLocation: "", destination: "",
    vehicleCategory: "Business Sedan", driverSupplyPrice: "", currency: "USD", estimatedMinutes: "",
  });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await fetch("/api/admin/actions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CREATE_PRICE_RULE", rule: f }),
    });
    if (res.ok) {
      setF({ ...f, pickupLocation: "", destination: "", driverSupplyPrice: "", estimatedMinutes: "" });
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Error");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="field-label">{L ? "국가" : "Country"}</label><input className="input" value={f.country} onChange={(e) => set("country", e.target.value)} required /></div>
        <div><label className="field-label">{L ? "도시" : "City"}</label><input className="input" value={f.city} onChange={(e) => set("city", e.target.value)} required /></div>
        <div><label className="field-label">{L ? "픽업 장소/공항" : "Pickup/airport"}</label><input className="input" value={f.pickupLocation} onChange={(e) => set("pickupLocation", e.target.value)} required /></div>
        <div><label className="field-label">{L ? "목적지" : "Destination"}</label><input className="input" value={f.destination} onChange={(e) => set("destination", e.target.value)} required /></div>
      </div>
      <div className="grid sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <label className="field-label">{L ? "차량" : "Vehicle"}</label>
          <select className="select" value={f.vehicleCategory} onChange={(e) => set("vehicleCategory", e.target.value)}>
            {VEHICLE_CATEGORIES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div><label className="field-label">{L ? "공급가" : "Supply price"}</label><input type="number" className="input" value={f.driverSupplyPrice} onChange={(e) => set("driverSupplyPrice", e.target.value)} required /></div>
        <div>
          <label className="field-label">{L ? "통화" : "Currency"}</label>
          <select className="select" value={f.currency} onChange={(e) => set("currency", e.target.value)}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      {error && <div className="text-sm text-[#a52626]">{error}</div>}
      <button className="btn btn-primary w-fit" disabled={busy}>{L ? "노선 가격 추가" : "Add route price"}</button>
    </form>
  );
}
