"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { VEHICLE_CATEGORIES, CURRENCIES } from "@/lib/constants";

const LANG = ["NATIVE", "FLUENT", "CONVERSATIONAL", "BASIC", "NONE"];

// Staff-facing quick-add. Registers a driver on their behalf and marks the
// profile APPROVED immediately, so a driver can start receiving assignments
// without going through the public /partners application + review loop.
export default function AdminDriverForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const L = locale === "ko";
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const empty = {
    contactName: "", email: "", phone: "", password: "",
    partnerType: "INDIVIDUAL", businessName: "",
    country: "", city: "", airports: "", serviceRegions: "",
    koreanLevel: "NATIVE", englishLevel: "CONVERSATIONAL",
    settlementCurrency: "USD", baseSupplyPrice: "",
    vehicleCategory: "Business Sedan", vehicleModel: "", vehicleYear: "",
  };
  const [f, setF] = useState(empty);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null); setDone(null);
    const res = await fetch("/api/admin/actions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CREATE_DRIVER", driver: f }),
    });
    if (res.ok) {
      setDone(L ? `${f.contactName} 기사가 등록·승인되었습니다.` : `${f.contactName} registered & approved.`);
      setF(empty);
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Error");
    }
    setBusy(false);
  }

  if (!open) {
    return (
      <div className="card p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="font-semibold">{L ? "기사 직접 등록" : "Register a driver"}</div>
          <div className="text-sm text-[var(--color-slate)]">
            {L ? "직원이 기사를 대신 등록하고 즉시 승인합니다." : "Add a driver on their behalf and approve instantly."}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>{L ? "새 기사 추가" : "Add driver"}</button>
      </div>
    );
  }

  const inp = (k: keyof typeof empty, label: string, opts: { type?: string; required?: boolean; ph?: string } = {}) => (
    <div>
      <label className="field-label">{label}</label>
      <input className="input" type={opts.type ?? "text"} placeholder={opts.ph} value={f[k]} onChange={(e) => set(k, e.target.value)} required={opts.required} />
    </div>
  );

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold">{L ? "기사 직접 등록" : "Register a driver"}</div>
        <button className="btn btn-ghost text-sm" onClick={() => setOpen(false)}>{L ? "닫기" : "Close"}</button>
      </div>
      <form onSubmit={submit} className="grid gap-3">
        <div className="grid sm:grid-cols-3 gap-3">
          {inp("contactName", L ? "이름 *" : "Name *", { required: true })}
          {inp("email", L ? "이메일 *" : "Email *", { type: "email", required: true })}
          {inp("phone", L ? "연락처" : "Phone")}
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="field-label">{L ? "파트너 유형" : "Partner type"}</label>
            <select className="select" value={f.partnerType} onChange={(e) => set("partnerType", e.target.value)}>
              <option value="INDIVIDUAL">{L ? "개인" : "Individual"}</option>
              <option value="COMPANY">{L ? "법인/업체" : "Company"}</option>
            </select>
          </div>
          {inp("businessName", L ? "상호(선택)" : "Business name", { ph: L ? "미입력시 이름 사용" : "defaults to name" })}
          {inp("password", L ? "초기 비밀번호" : "Initial password", { ph: "password123" })}
        </div>
        <div className="grid sm:grid-cols-4 gap-3">
          {inp("country", L ? "국가 *" : "Country *", { required: true })}
          {inp("city", L ? "도시 *" : "City *", { required: true })}
          {inp("airports", L ? "담당 공항" : "Airports", { ph: L ? "쉼표로 구분" : "comma separated" })}
          {inp("serviceRegions", L ? "서비스 지역" : "Regions", { ph: L ? "쉼표로 구분" : "comma separated" })}
        </div>
        <div className="grid sm:grid-cols-4 gap-3">
          <div>
            <label className="field-label">{L ? "한국어" : "Korean"}</label>
            <select className="select" value={f.koreanLevel} onChange={(e) => set("koreanLevel", e.target.value)}>
              {LANG.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">{L ? "영어" : "English"}</label>
            <select className="select" value={f.englishLevel} onChange={(e) => set("englishLevel", e.target.value)}>
              {LANG.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">{L ? "정산 통화" : "Settle currency"}</label>
            <select className="select" value={f.settlementCurrency} onChange={(e) => set("settlementCurrency", e.target.value)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {inp("baseSupplyPrice", L ? "기본 공급가" : "Base supply", { type: "number" })}
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="field-label">{L ? "차량 등급" : "Vehicle class"}</label>
            <select className="select" value={f.vehicleCategory} onChange={(e) => set("vehicleCategory", e.target.value)}>
              {VEHICLE_CATEGORIES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          {inp("vehicleModel", L ? "차종" : "Make/model", { ph: "Mercedes-Benz E-Class" })}
          {inp("vehicleYear", L ? "연식" : "Year", { type: "number" })}
        </div>
        {error && <div className="text-sm text-[#a52626]">{error}</div>}
        {done && <div className="text-sm text-[#16794a]">{done}</div>}
        <button className="btn btn-primary w-fit" disabled={busy}>
          {busy ? (L ? "저장 중…" : "Saving…") : (L ? "기사 등록 및 승인" : "Register & approve")}
        </button>
      </form>
    </div>
  );
}
