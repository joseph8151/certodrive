"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { VEHICLE_CATEGORIES, LANGUAGE_LEVELS, COUNTRY_DIAL_CODES } from "@/lib/constants";

const LEVEL_LABELS: Record<string, { ko: string; en: string }> = {
  NONE: { ko: "불가", en: "None" },
  BASIC: { ko: "기초", en: "Basic" },
  CONVERSATIONAL: { ko: "일상 대화", en: "Conversational" },
  FLUENT: { ko: "능숙", en: "Fluent" },
  NATIVE: { ko: "원어민", en: "Native" },
};

export const LICENSE_TYPES: { value: string; ko: string; en: string }[] = [
  { value: "TAXI", ko: "택시운송사업 면허", en: "Taxi licence" },
  { value: "RENTAL_CAR", ko: "렌터카(자동차대여사업)", en: "Car rental business" },
  { value: "CHARTER_BUS", ko: "전세버스운송사업", en: "Charter bus" },
  { value: "PLATFORM", ko: "플랫폼운송·가맹사업", en: "Platform transport/franchise" },
  { value: "OTHER", ko: "기타 운송 자격", en: "Other" },
  { value: "NONE", ko: "해당 없음 (해외 등)", en: "Not applicable (overseas)" },
];

const KOREA = /대한민국|한국|south\s*korea|korea|^kr$/i;

function DocUpload({ label, done, onDone }: { label: string; done?: boolean; onDone: (url: string) => void }) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done">(done ? "done" : "idle");
  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) { onDone(data.url); setStatus("done"); } else setStatus("idle");
  }
  return (
    <div className="rounded-lg border border-[var(--color-line)] p-3">
      <div className="flex items-center justify-between">
        <label className="field-label mb-0">{label}</label>
        {status === "done" && <span className="pill pill-green">✓</span>}
        {status === "uploading" && <span className="text-xs text-[var(--color-slate)]">…</span>}
      </div>
      <input type="file" accept="image/*,application/pdf" onChange={handle} className="text-xs w-full mt-2" />
      <p className="mt-1 text-[11px] text-[var(--color-slate-400)]">PDF · JPG · PNG</p>
    </div>
  );
}

export default function DriverRegistrationForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const L = locale === "ko";
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [f, setF] = useState({
    email: "", password: "", dialCode: "+82", phone: "", partnerType: "INDIVIDUAL", businessName: "",
    contactName: "", country: "", city: "", airports: "", serviceRegions: "",
    koreanLevel: "CONVERSATIONAL", englishLevel: "BASIC",
    vehicleCategory: "Business Sedan", maxPassengers: 3, maxLuggage: 3,
    licenseType: "", transportLicenseNo: "", termsAgreed: false,
  });
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));
  const isKorea = KOREA.test(f.country);

  const steps = L ? ["기본 정보", "운행 · 서류", "검토"] : ["Personal", "Driving & docs", "Review"];

  function validate(s: number): string | null {
    if (s === 0) {
      if (!f.contactName.trim()) return L ? "이름을 입력하세요." : "Enter your name.";
      if (!f.email.includes("@")) return L ? "올바른 이메일을 입력하세요." : "Enter a valid email.";
      if (f.password.length < 6) return L ? "비밀번호는 6자 이상이어야 합니다." : "Password must be 6+ characters.";
      if (!f.country.trim()) return L ? "국가를 입력하세요." : "Enter your country.";
      if (!f.city.trim()) return L ? "도시를 입력하세요." : "Enter your city.";
    }
    if (s === 1 && isKorea) {
      if (!f.licenseType || f.licenseType === "NONE" || f.transportLicenseNo.trim().length < 3)
        return L ? "국내 운행은 운송면허 종류와 번호가 필수입니다." : "Korea requires a transport licence type and number.";
      if (!docs.transportLicense) return L ? "국내 운행은 운송면허증 첨부가 필수입니다." : "Korea requires a transport-licence document.";
      if (!docs.insurance) return L ? "국내 운행은 보험증서 첨부가 필수입니다." : "Korea requires an insurance document.";
    }
    return null;
  }

  function next() {
    const err = validate(step);
    if (err) return setError(err);
    setError(null);
    const n = Math.min(steps.length - 1, step + 1);
    setStep(n);
    setMaxReached((m) => Math.max(m, n));
  }
  function back() { setError(null); setStep((s) => Math.max(0, s - 1)); }
  function goto(s: number) { if (s <= maxReached) { setError(null); setStep(s); } }

  async function submit() {
    if (!f.termsAgreed) return setError(L ? "이용약관에 동의해주세요." : "Please agree to the terms.");
    for (let s = 0; s < steps.length; s++) { const e = validate(s); if (e) { setStep(s); return setError(e); } }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/drivers/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: f.email, password: f.password, contactName: f.contactName,
          phone: `${f.dialCode} ${f.phone}`.trim(),
          partnerType: f.partnerType, businessName: f.businessName,
          country: f.country, city: f.city,
          koreanLevel: f.koreanLevel, englishLevel: f.englishLevel,
          vehicleCategory: f.vehicleCategory, maxPassengers: f.maxPassengers, maxLuggage: f.maxLuggage,
          licenseType: f.licenseType, transportLicenseNo: f.transportLicenseNo,
          termsAgreed: f.termsAgreed,
          // Payout details are collected later in the driver dashboard, not at signup.
          bankAccount: "", settlementCurrency: "USD", baseSupplyPrice: null,
          airports: f.airports.split(",").map((s) => s.trim()).filter(Boolean),
          serviceRegions: f.serviceRegions.split(",").map((s) => s.trim()).filter(Boolean),
          documents: docs,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      router.push(data.redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setLoading(false);
    }
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div><label className="field-label">{label}</label>{children}</div>
  );

  return (
    <div className="grid gap-6">
      {/* Stepper */}
      <div>
        <div className="hidden sm:flex items-center">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <button type="button" onClick={() => goto(i)} disabled={i > maxReached} className="flex items-center gap-2 disabled:cursor-default">
                <span className={`h-7 w-7 rounded-full grid place-items-center text-xs font-bold shrink-0 ${
                  i === step ? "bg-[var(--color-ink)] text-white" : i <= maxReached ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]" : "bg-[var(--color-mist)] text-[var(--color-slate)]"
                }`}>{i + 1}</span>
                <span className={`text-[13px] font-medium whitespace-nowrap ${i === step ? "text-[var(--color-ink)]" : "text-[var(--color-slate)]"}`}>{s}</span>
              </button>
              {i < steps.length - 1 && <span className="flex-1 h-px bg-[var(--color-line)] mx-3" />}
            </div>
          ))}
        </div>
        <div className="sm:hidden">
          <div className="text-sm font-semibold">{step + 1} / {steps.length} · {steps[step]}</div>
          <div className="mt-2 h-1 rounded-full bg-[var(--color-mist)] overflow-hidden">
            <div className="h-full bg-[var(--color-accent)]" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--color-slate)]">
          {L ? "가입은 3단계면 끝납니다. 정산 계좌 등 상세 정보는 승인 후 대시보드에서 입력합니다." : "Just three steps — payout details are added later in your dashboard after approval."}
        </p>
      </div>

      {/* Step 0 — Personal */}
      {step === 0 && (
        <section className="grid gap-4">
          <h3 className="font-semibold">{L ? "기본 정보" : "Personal"}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={L ? "이름" : "Full name"}><input className="input" value={f.contactName} onChange={(e) => set("contactName", e.target.value)} /></Field>
            <Field label={L ? "이메일" : "Email"}><input type="email" className="input" value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label={L ? "비밀번호" : "Password"}><input type="password" className="input" value={f.password} onChange={(e) => set("password", e.target.value)} placeholder={L ? "6자 이상" : "6+ characters"} /></Field>
            <Field label={L ? "전화번호" : "Phone"}>
              <div className="flex gap-2">
                <select className="select w-28 shrink-0" value={f.dialCode} onChange={(e) => set("dialCode", e.target.value)}>
                  {COUNTRY_DIAL_CODES.map((d) => <option key={d.code} value={d.code}>{d.label}</option>)}
                </select>
                <input className="input flex-1" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder={L ? "전화번호" : "Phone number"} />
              </div>
            </Field>
            <Field label={L ? "활동 국가" : "Country"}><input className="input" value={f.country} onChange={(e) => set("country", e.target.value)} placeholder={L ? "대한민국 / France / USA" : "e.g. France"} /></Field>
            <Field label={L ? "활동 도시" : "City"}><input className="input" value={f.city} onChange={(e) => set("city", e.target.value)} placeholder={L ? "서울 / Paris" : "e.g. Paris"} /></Field>
            <Field label={L ? "한국어" : "Korean"}>
              <select className="select" value={f.koreanLevel} onChange={(e) => set("koreanLevel", e.target.value)}>
                {LANGUAGE_LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABELS[l][locale]}</option>)}
              </select>
            </Field>
            <Field label={L ? "영어" : "English"}>
              <select className="select" value={f.englishLevel} onChange={(e) => set("englishLevel", e.target.value)}>
                {LANGUAGE_LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABELS[l][locale]}</option>)}
              </select>
            </Field>
          </div>
        </section>
      )}

      {/* Step 1 — Driving & documents */}
      {step === 1 && (
        <section className="grid gap-4">
          <h3 className="font-semibold">{L ? "운행 · 서류" : "Driving & documents"}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={L ? "구분" : "Type"}>
              <select className="select" value={f.partnerType} onChange={(e) => set("partnerType", e.target.value)}>
                <option value="INDIVIDUAL">{L ? "개인 기사" : "Individual"}</option>
                <option value="COMPANY">{L ? "운송업체" : "Company"}</option>
              </select>
            </Field>
            <Field label={L ? "상호(선택)" : "Business name (optional)"}><input className="input" value={f.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder={L ? "미입력 시 이름 사용" : "defaults to your name"} /></Field>
            <Field label={L ? "서비스 공항(선택)" : "Airports (optional)"}><input className="input" value={f.airports} onChange={(e) => set("airports", e.target.value)} placeholder="ICN, GMP / CDG, ORY" /></Field>
            <Field label={L ? "서비스 지역(선택)" : "Regions (optional)"}><input className="input" value={f.serviceRegions} onChange={(e) => set("serviceRegions", e.target.value)} placeholder={L ? "서울, 인천" : "Paris, Versailles"} /></Field>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label={L ? "차량 종류" : "Vehicle class"}>
              <select className="select" value={f.vehicleCategory} onChange={(e) => set("vehicleCategory", e.target.value)}>
                {VEHICLE_CATEGORIES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
            <Field label={L ? "최대 승객" : "Max passengers"}><input type="number" min={1} className="input" value={f.maxPassengers} onChange={(e) => set("maxPassengers", Number(e.target.value))} /></Field>
            <Field label={L ? "최대 수하물" : "Max luggage"}><input type="number" min={0} className="input" value={f.maxLuggage} onChange={(e) => set("maxLuggage", Number(e.target.value))} /></Field>
          </div>
          <div className="rounded-lg bg-[var(--color-mist)] p-3 text-xs text-[var(--color-slate)]">
            {L ? "체르토 드라이브는 예약을 중개하는 플랫폼입니다. 유상운송이 합법인 지역에서만 등록할 수 있으며, 필요한 서류는 활동 국가·지역에 따라 다릅니다. 국내(한국)는 운송면허가 필수입니다." : "Certo Drive is a booking brokerage. Register only where paid transport is legal; required documents vary by country. Korea requires a transport licence."}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={`${L ? "운송면허 종류" : "Licence type"}${isKorea ? " *" : ""}`}>
              <select className="select" value={f.licenseType} onChange={(e) => set("licenseType", e.target.value)}>
                <option value="">{L ? "선택하세요" : "Select"}</option>
                {LICENSE_TYPES.map((l) => <option key={l.value} value={l.value}>{L ? l.ko : l.en}</option>)}
              </select>
            </Field>
            <Field label={`${L ? "운송면허/등록번호" : "Licence / registration no."}${isKorea ? " *" : ""}`}>
              <input className="input" value={f.transportLicenseNo} onChange={(e) => set("transportLicenseNo", e.target.value)} placeholder={L ? "예: 서울-택시-12345" : "e.g. licence no."} />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <DocUpload label={`${L ? "운송사업 면허증" : "Transport license"}${isKorea ? " *" : ""}`} done={!!docs.transportLicense} onDone={(u) => setDocs((d) => ({ ...d, transportLicense: u }))} />
            <DocUpload label={`${L ? "보험증서" : "Insurance"}${isKorea ? " *" : ""}`} done={!!docs.insurance} onDone={(u) => setDocs((d) => ({ ...d, insurance: u }))} />
            <DocUpload label={L ? "기사 면허" : "Driver license"} done={!!docs.driverLicense} onDone={(u) => setDocs((d) => ({ ...d, driverLicense: u }))} />
            <DocUpload label={L ? "차량등록증" : "Vehicle registration"} done={!!docs.vehicleReg} onDone={(u) => setDocs((d) => ({ ...d, vehicleReg: u }))} />
            <DocUpload label={L ? "차량 사진" : "Vehicle photo"} done={!!docs.vehiclePhotos} onDone={(u) => setDocs((d) => ({ ...d, vehiclePhotos: u }))} />
          </div>
        </section>
      )}

      {/* Step 2 — Review */}
      {step === 2 && (
        <section className="grid gap-4">
          <h3 className="font-semibold">{L ? "검토 · 제출" : "Review & submit"}</h3>
          <div className="rounded-xl border border-[var(--color-line)] divide-y divide-[var(--color-line)] text-sm">
            {[
              [L ? "이름 · 이메일" : "Name · email", `${f.contactName} · ${f.email}`],
              [L ? "연락처" : "Phone", `${f.dialCode} ${f.phone}`],
              [L ? "지역" : "Location", [f.city, f.country].filter(Boolean).join(", ")],
              [L ? "차량" : "Vehicle", `${f.vehicleCategory} · ${f.maxPassengers}${L ? "인" : "pax"} · ${f.maxLuggage}${L ? "짐" : "bags"}`],
              [L ? "언어" : "Languages", `${L ? "한" : "KR"} ${LEVEL_LABELS[f.koreanLevel][locale]} · ${L ? "영" : "EN"} ${LEVEL_LABELS[f.englishLevel][locale]}`],
              [L ? "운송면허" : "Transport licence", f.licenseType ? `${LICENSE_TYPES.find((l) => l.value === f.licenseType)?.[locale === "ko" ? "ko" : "en"]}${f.transportLicenseNo ? ` · ${f.transportLicenseNo}` : ""}` : (L ? "미입력" : "—")],
              [L ? "첨부 서류" : "Documents", `${Object.keys(docs).length}${L ? "건" : " files"}`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 px-4 py-2.5">
                <span className="text-[var(--color-slate)]">{k}</span>
                <span className="font-medium text-right">{v || "—"}</span>
              </div>
            ))}
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="h-4 w-4 mt-0.5 accent-[var(--color-ink)]" checked={f.termsAgreed} onChange={(e) => set("termsAgreed", e.target.checked)} />
            <span>{L ? "이용약관 및 파트너 정산 규정에 동의합니다. 제출 후 관리자 승인 절차가 진행되며, 승인 후 대시보드에서 정산 정보를 입력합니다." : "I agree to the terms and partner settlement policy. Applications are admin-reviewed; add payout details in your dashboard after approval."}</span>
          </label>
        </section>
      )}

      {error && <div className="rounded-lg bg-[#f6e6e6] text-[#8f2a2a] text-sm px-3 py-2">{error}</div>}

      <div className="flex items-center justify-between gap-3 pt-1">
        {step > 0 ? <button type="button" className="btn btn-ghost" onClick={back}>{L ? "이전" : "Back"}</button> : <span />}
        {step < steps.length - 1 ? (
          <button type="button" className="btn btn-primary" onClick={next}>{L ? "저장하고 계속" : "Save & continue"}</button>
        ) : (
          <button type="button" className="btn btn-gold" onClick={submit} disabled={loading}>{loading ? "..." : L ? "파트너 지원 제출" : "Submit application"}</button>
        )}
      </div>
    </div>
  );
}
