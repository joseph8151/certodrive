"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { VEHICLE_CATEGORIES, LANGUAGE_LEVELS, CURRENCIES } from "@/lib/constants";

type Profile = {
  businessName: string; contactName: string; city: string; country: string;
  airports: string[]; serviceRegions: string[]; koreanLevel: string; englishLevel: string;
  bankAccount: string | null; settlementCurrency: string; baseSupplyPrice: number | null;
  availabilityNote: string | null; acceptingBookings: boolean;
  transportLicenseUrl: string | null; driverLicenseUrl: string | null; insuranceUrl: string | null; vehicleRegUrl: string | null;
};
type Vehicle = { id: string; category: string; makeModel: string | null; maxPassengers: number; maxLuggage: number };

async function post(body: unknown) {
  const res = await fetch("/api/drivers/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Error");
  return res.json();
}
async function upload(file: File): Promise<string> {
  const fd = new FormData(); fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  return (await res.json()).url;
}

function Doc({ label, current, onUploaded }: { label: string; current: string | null; onUploaded: (u: string) => void }) {
  const [state, setState] = useState<"idle" | "up" | "done">("idle");
  return (
    <div>
      <label className="field-label">{label} {current && <span className="text-[#16794a]">✓</span>}</label>
      <input type="file" className="text-sm w-full" onChange={async (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        setState("up"); const url = await upload(f); onUploaded(url); setState("done");
      }} />
      {state === "up" && <span className="text-xs text-[var(--color-slate)]">업로드 중...</span>}
      {state === "done" && <span className="text-xs text-[#16794a]">✓ 완료</span>}
    </div>
  );
}

export default function DriverProfileEditor({ profile, vehicles, locale }: { profile: Profile; vehicles: Vehicle[]; locale: Locale }) {
  const router = useRouter();
  const L = locale === "ko";
  const [f, setF] = useState({
    ...profile,
    airports: profile.airports.join(", "),
    serviceRegions: profile.serviceRegions.join(", "),
    baseSupplyPrice: profile.baseSupplyPrice != null ? String(profile.baseSupplyPrice) : "",
    bankAccount: profile.bankAccount ?? "",
    availabilityNote: profile.availabilityNote ?? "",
  });
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [veh, setVeh] = useState({ category: "Business Sedan", makeModel: "", maxPassengers: 3, maxLuggage: 3 });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));

  async function run(fn: () => Promise<unknown>, ok?: string) {
    setBusy(true); setError(null); setMsg(null);
    try { await fn(); if (ok) setMsg(ok); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setBusy(false); }
  }

  function saveProfile() {
    return post({ action: "UPDATE_PROFILE", profile: {
      businessName: f.businessName, contactName: f.contactName, city: f.city, country: f.country,
      airports: f.airports.split(",").map((s) => s.trim()).filter(Boolean),
      serviceRegions: f.serviceRegions.split(",").map((s) => s.trim()).filter(Boolean),
      koreanLevel: f.koreanLevel, englishLevel: f.englishLevel,
      bankAccount: f.bankAccount, settlementCurrency: f.settlementCurrency,
      baseSupplyPrice: f.baseSupplyPrice ? Number(f.baseSupplyPrice) : null,
      availabilityNote: f.availabilityNote,
      ...docs,
    } });
  }

  return (
    <div className="grid gap-6">
      {error && <div className="rounded-lg bg-[#fdeaea] text-[#a52626] text-sm px-3 py-2">{error}</div>}
      {msg && <div className="rounded-lg bg-[#e6f5ec] text-[#16794a] text-sm px-3 py-2">{msg}</div>}

      {/* Availability */}
      <div className="card p-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{L ? "예약 수락 상태" : "Availability"}</h3>
          <p className="text-sm text-[var(--color-slate)]">{f.acceptingBookings ? (L ? "신규 예약 요청을 받고 있습니다." : "Receiving new booking requests.") : (L ? "신규 요청을 받지 않습니다." : "Not receiving new requests.")}</p>
        </div>
        <button className={`btn ${f.acceptingBookings ? "btn-outline" : "btn-primary"}`} disabled={busy}
          onClick={() => run(async () => { const r = await post({ action: "TOGGLE_ACCEPTING" }); set("acceptingBookings", r.acceptingBookings); })}>
          {f.acceptingBookings ? (L ? "요청 받지 않기" : "Pause requests") : (L ? "요청 받기" : "Resume requests")}
        </button>
      </div>

      {/* Profile */}
      <div className="card p-6 grid gap-4">
        <h3 className="font-semibold text-lg">{L ? "기본 정보" : "Profile"}</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="field-label">{L ? "상호" : "Business"}</label><input className="input" value={f.businessName} onChange={(e) => set("businessName", e.target.value)} /></div>
          <div><label className="field-label">{L ? "담당자" : "Contact"}</label><input className="input" value={f.contactName} onChange={(e) => set("contactName", e.target.value)} /></div>
          <div><label className="field-label">{L ? "국가" : "Country"}</label><input className="input" value={f.country} onChange={(e) => set("country", e.target.value)} /></div>
          <div><label className="field-label">{L ? "도시" : "City"}</label><input className="input" value={f.city} onChange={(e) => set("city", e.target.value)} /></div>
        </div>
        <div><label className="field-label">{L ? "서비스 공항 (쉼표)" : "Airports (comma)"}</label><input className="input" value={f.airports} onChange={(e) => set("airports", e.target.value)} /></div>
        <div><label className="field-label">{L ? "서비스 지역 (쉼표)" : "Regions (comma)"}</label><input className="input" value={f.serviceRegions} onChange={(e) => set("serviceRegions", e.target.value)} /></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="field-label">{L ? "한국어" : "Korean"}</label><select className="select" value={f.koreanLevel} onChange={(e) => set("koreanLevel", e.target.value)}>{LANGUAGE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
          <div><label className="field-label">{L ? "영어" : "English"}</label><select className="select" value={f.englishLevel} onChange={(e) => set("englishLevel", e.target.value)}>{LANGUAGE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div><label className="field-label">{L ? "정산 통화" : "Currency"}</label><select className="select" value={f.settlementCurrency} onChange={(e) => set("settlementCurrency", e.target.value)}>{CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="field-label">{L ? "기본 공급가" : "Base price"}</label><input type="number" className="input" value={f.baseSupplyPrice} onChange={(e) => set("baseSupplyPrice", e.target.value)} /></div>
          <div><label className="field-label">{L ? "은행 계좌" : "Bank account"}</label><input className="input" value={f.bankAccount} onChange={(e) => set("bankAccount", e.target.value)} /></div>
        </div>
        <div><label className="field-label">{L ? "예약 가능 일정 메모 (예: 8/10~8/15 불가)" : "Availability notes (e.g. unavailable Aug 10–15)"}</label><textarea className="textarea" rows={2} value={f.availabilityNote} onChange={(e) => set("availabilityNote", e.target.value)} /></div>
        <div>
          <h4 className="font-medium text-sm mb-2">{L ? "서류 재업로드" : "Re-upload documents"}</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <Doc label={L ? "운송면허" : "Transport license"} current={profile.transportLicenseUrl} onUploaded={(u) => setDocs((d) => ({ ...d, transportLicenseUrl: u }))} />
            <Doc label={L ? "기사 면허" : "Driver license"} current={profile.driverLicenseUrl} onUploaded={(u) => setDocs((d) => ({ ...d, driverLicenseUrl: u }))} />
            <Doc label={L ? "보험증서" : "Insurance"} current={profile.insuranceUrl} onUploaded={(u) => setDocs((d) => ({ ...d, insuranceUrl: u }))} />
            <Doc label={L ? "차량등록증" : "Vehicle reg"} current={profile.vehicleRegUrl} onUploaded={(u) => setDocs((d) => ({ ...d, vehicleRegUrl: u }))} />
          </div>
        </div>
        <button className="btn btn-primary w-fit" disabled={busy} onClick={() => run(saveProfile, L ? "저장되었습니다." : "Saved.")}>{L ? "프로필 저장" : "Save profile"}</button>
      </div>

      {/* Vehicles */}
      <div className="card p-6 grid gap-4">
        <h3 className="font-semibold text-lg">{L ? "차량 관리" : "Vehicles"}</h3>
        <div className="grid gap-2">
          {vehicles.length === 0 && <p className="text-sm text-[var(--color-slate)]">{L ? "등록된 차량이 없습니다." : "No vehicles yet."}</p>}
          {vehicles.map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded-lg border border-[var(--color-line)] p-3">
              <div className="text-sm"><span className="font-medium">{v.category}</span>{v.makeModel ? ` · ${v.makeModel}` : ""} · {v.maxPassengers}{L ? "인" : "pax"} · {v.maxLuggage}{L ? "짐" : " bags"}</div>
              <button className="btn btn-ghost text-sm py-1 px-2" disabled={busy} onClick={() => run(() => post({ action: "DELETE_VEHICLE", vehicleId: v.id }))}>{L ? "삭제" : "Remove"}</button>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-4 gap-3 items-end border-t border-[var(--color-line)] pt-4">
          <div className="sm:col-span-1"><label className="field-label">{L ? "차량 종류" : "Class"}</label><select className="select" value={veh.category} onChange={(e) => setVeh((p) => ({ ...p, category: e.target.value }))}>{VEHICLE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="field-label">{L ? "모델" : "Model"}</label><input className="input" value={veh.makeModel} onChange={(e) => setVeh((p) => ({ ...p, makeModel: e.target.value }))} /></div>
          <div><label className="field-label">{L ? "승객" : "Pax"}</label><input type="number" className="input" value={veh.maxPassengers} onChange={(e) => setVeh((p) => ({ ...p, maxPassengers: Number(e.target.value) }))} /></div>
          <button className="btn btn-outline" disabled={busy} onClick={() => run(() => post({ action: "ADD_VEHICLE", vehicle: veh }), L ? "차량이 추가되었습니다." : "Vehicle added.")}>{L ? "차량 추가" : "Add vehicle"}</button>
        </div>
      </div>
    </div>
  );
}
