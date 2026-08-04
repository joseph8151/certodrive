"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { CURRENCIES } from "@/lib/constants";

export default function RateForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const L = locale === "ko";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({ base: "USD", target: "KRW", rate: "" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await fetch("/api/admin/actions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "UPSERT_RATE", ...f }),
    });
    if (res.ok) { setF({ ...f, rate: "" }); router.refresh(); }
    else { const d = await res.json().catch(() => ({})); setError(d.error ?? "Error"); }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-4 gap-3 items-end">
      <div>
        <label className="field-label">{L ? "기준 통화" : "Base"}</label>
        <select className="select" value={f.base} onChange={(e) => set("base", e.target.value)}>{CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
      </div>
      <div>
        <label className="field-label">{L ? "대상 통화" : "Target"}</label>
        <select className="select" value={f.target} onChange={(e) => set("target", e.target.value)}>{CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
      </div>
      <div><label className="field-label">{L ? "환율" : "Rate"}</label><input type="number" step="0.0001" className="input" value={f.rate} onChange={(e) => set("rate", e.target.value)} required /></div>
      <button className="btn btn-primary" disabled={busy}>{L ? "저장" : "Save"}</button>
      {error && <div className="sm:col-span-4 text-sm text-[#a52626]">{error}</div>}
    </form>
  );
}
