"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export default function PromoForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const L = locale === "ko";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({ code: "", description: "", discountType: "PERCENT", value: "", maxUses: "", expiresAt: "" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await fetch("/api/admin/actions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CREATE_PROMO", promo: f }),
    });
    if (res.ok) { setF({ code: "", description: "", discountType: "PERCENT", value: "", maxUses: "", expiresAt: "" }); router.refresh(); }
    else { const d = await res.json().catch(() => ({})); setError(d.error ?? "Error"); }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="field-label">{L ? "코드" : "Code"}</label><input className="input uppercase" value={f.code} onChange={(e) => set("code", e.target.value.toUpperCase())} required /></div>
        <div>
          <label className="field-label">{L ? "유형" : "Type"}</label>
          <select className="select" value={f.discountType} onChange={(e) => set("discountType", e.target.value)}>
            <option value="PERCENT">{L ? "정률(%)" : "Percent (%)"}</option>
            <option value="FIXED">{L ? "정액" : "Fixed"}</option>
          </select>
        </div>
        <div><label className="field-label">{L ? "값" : "Value"}</label><input type="number" step="0.01" className="input" value={f.value} onChange={(e) => set("value", e.target.value)} required /></div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1"><label className="field-label">{L ? "최대 사용 횟수" : "Max uses"}</label><input type="number" className="input" value={f.maxUses} onChange={(e) => set("maxUses", e.target.value)} placeholder={L ? "무제한" : "unlimited"} /></div>
        <div><label className="field-label">{L ? "만료일" : "Expires"}</label><input type="date" className="input" value={f.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} /></div>
        <div><label className="field-label">{L ? "설명" : "Description"}</label><input className="input" value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
      </div>
      {error && <div className="text-sm text-[#a52626]">{error}</div>}
      <button className="btn btn-primary w-fit" disabled={busy}>{L ? "프로모션 추가" : "Add promotion"}</button>
    </form>
  );
}
