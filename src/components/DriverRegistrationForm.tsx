"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { VEHICLE_CATEGORIES, LANGUAGE_LEVELS, CURRENCIES } from "@/lib/constants";

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

function DocUpload({ label, onDone }: { label: string; onDone: (url: string) => void }) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done">("idle");
  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) {
      onDone(data.url);
      setStatus("done");
    } else {
      setStatus("idle");
    }
  }
  return (
    <div>
      <label className="field-label">{label}</label>
      <input type="file" onChange={handle} className="text-sm w-full" />
      {status === "uploading" && <span className="text-xs text-[var(--color-slate)]">업로드 중...</span>}
      {status === "done" && <span className="text-xs text-[#16794a]">✓ 업로드 완료</span>}
    </div>
  );
}

export default function DriverRegistrationForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [f, setF] = useState({
    email: "",
    password: "",
    phone: "",
    partnerType: "INDIVIDUAL",
    businessName: "",
    contactName: "",
    country: "",
    city: "",
    airports: "",
    serviceRegions: "",
    koreanLevel: "CONVERSATIONAL",
    englishLevel: "BASIC",
    bankAccount: "",
    settlementCurrency: "USD",
    baseSupplyPrice: "",
    vehicleCategory: "Business Sedan",
    maxPassengers: 3,
    maxLuggage: 3,
    licenseType: "",
    transportLicenseNo: "",
    termsAgreed: false,
  });
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));
  const L = locale === "ko";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.termsAgreed) return setError(L ? "이용약관에 동의해주세요." : "Please agree to the terms.");
    if (KOREA.test(f.country) && (!f.licenseType || f.licenseType === "NONE" || f.transportLicenseNo.trim().length < 3)) {
      return setError(L ? "국내 운행은 운송면허 종류와 번호가 필수입니다." : "A transport licence type and number are required for Korea.");
    }
    if (KOREA.test(f.country) && !docs.transportLicense) {
      return setError(L ? "국내 운행은 운송면허증 파일 첨부가 필수입니다." : "A transport-licence document is required for Korea.");
    }
    if (KOREA.test(f.country) && !docs.insurance) {
      return setError(L ? "국내 운행은 (유상운송) 보험증서 첨부가 필수입니다." : "An insurance document is required for Korea.");
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/drivers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...f,
          baseSupplyPrice: f.baseSupplyPrice ? Number(f.baseSupplyPrice) : null,
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

  return (
    <form onSubmit={submit} className="grid gap-5">
      <div className="rounded-lg bg-[var(--color-mist)] px-4 py-3 text-sm text-[var(--color-slate)]">
        {L
          ? "몇 분이면 지원이 끝납니다. 제출 후 관리자 승인을 거쳐 활성화되며, 승인되면 이메일로 안내드립니다."
          : "Takes just a few minutes. After you submit, an admin reviews and approves your application."}
      </div>
      <section className="grid gap-4">
        <h3 className="font-semibold">{L ? "계정 · 연락처" : "Account · contact"}</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="field-label">{L ? "이메일" : "Email"}</label><input type="email" className="input" value={f.email} onChange={(e) => set("email", e.target.value)} required /></div>
          <div><label className="field-label">{L ? "비밀번호" : "Password"}</label><input type="password" className="input" value={f.password} onChange={(e) => set("password", e.target.value)} required minLength={6} placeholder={L ? "6자 이상" : "6+ characters"} /></div>
          <div><label className="field-label">{L ? "담당자명" : "Your name"}</label><input className="input" value={f.contactName} onChange={(e) => set("contactName", e.target.value)} required /></div>
          <div><label className="field-label">{L ? "연락처(휴대폰)" : "Phone"}</label><input className="input" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="010-1234-5678" /></div>
        </div>
      </section>

      <section className="grid gap-4">
        <h3 className="font-semibold">{L ? "파트너 정보" : "Partner details"}</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">{L ? "구분" : "Type"}</label>
            <select className="select" value={f.partnerType} onChange={(e) => set("partnerType", e.target.value)}>
              <option value="INDIVIDUAL">{L ? "개인 기사" : "Individual"}</option>
              <option value="COMPANY">{L ? "운송업체" : "Company"}</option>
            </select>
          </div>
          <div><label className="field-label">{L ? "상호(선택)" : "Business name (optional)"}</label><input className="input" value={f.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder={L ? "미입력 시 이름 사용" : "defaults to your name"} /></div>
          <div><label className="field-label">{L ? "국가" : "Country"}</label><input className="input" value={f.country} onChange={(e) => set("country", e.target.value)} placeholder={L ? "대한민국" : "South Korea"} required /></div>
          <div><label className="field-label">{L ? "도시" : "City"}</label><input className="input" value={f.city} onChange={(e) => set("city", e.target.value)} placeholder={L ? "서울" : "Seoul"} required /></div>
          <div><label className="field-label">{L ? "서비스 가능 공항 (선택)" : "Airports (optional)"}</label><input className="input" value={f.airports} onChange={(e) => set("airports", e.target.value)} placeholder="ICN, GMP" /></div>
        </div>
        <div><label className="field-label">{L ? "서비스 가능 지역 (선택)" : "Service regions (optional)"}</label><input className="input" value={f.serviceRegions} onChange={(e) => set("serviceRegions", e.target.value)} placeholder={L ? "서울, 인천, 경기" : "Seoul, Incheon"} /></div>
      </section>

      <section className="grid gap-4">
        <h3 className="font-semibold">
          {L ? "운송 자격" : "Transport licence"}
          {KOREA.test(f.country) && <span className="text-[#a52626] ml-1">*</span>}
        </h3>
        <p className="text-xs text-[var(--color-slate)] -mt-2">
          {L
            ? "체르토 드라이브는 예약을 중개하는 플랫폼입니다. 국내(한국) 운행은 「여객자동차 운수사업법」에 따라 운송면허를 보유한 기사·사업자만 등록할 수 있습니다."
            : "Certo Drive is a booking brokerage. For domestic (Korea) service, only drivers holding a valid transport licence may register."}
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">{L ? "운송면허 종류" : "Licence type"}</label>
            <select className="select" value={f.licenseType} onChange={(e) => set("licenseType", e.target.value)}>
              <option value="">{L ? "선택하세요" : "Select"}</option>
              {LICENSE_TYPES.map((l) => <option key={l.value} value={l.value}>{L ? l.ko : l.en}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">{L ? "운송면허/등록번호" : "Licence / registration no."}</label>
            <input className="input" value={f.transportLicenseNo} onChange={(e) => set("transportLicenseNo", e.target.value)} placeholder={L ? "예: 서울-택시-12345" : "e.g. licence no."} />
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <h3 className="font-semibold">{L ? "차량" : "Vehicle"}</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="field-label">{L ? "차량 종류" : "Vehicle class"}</label>
            <select className="select" value={f.vehicleCategory} onChange={(e) => set("vehicleCategory", e.target.value)}>
              {VEHICLE_CATEGORIES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div><label className="field-label">{L ? "최대 승객" : "Max passengers"}</label><input type="number" min={1} className="input" value={f.maxPassengers} onChange={(e) => set("maxPassengers", Number(e.target.value))} /></div>
          <div><label className="field-label">{L ? "최대 수하물" : "Max luggage"}</label><input type="number" min={0} className="input" value={f.maxLuggage} onChange={(e) => set("maxLuggage", Number(e.target.value))} /></div>
        </div>
      </section>

      <section className="grid gap-4">
        <h3 className="font-semibold">{L ? "언어 능력" : "Languages"}</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">{L ? "한국어" : "Korean"}</label>
            <select className="select" value={f.koreanLevel} onChange={(e) => set("koreanLevel", e.target.value)}>
              {LANGUAGE_LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABELS[l][locale]}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">{L ? "영어" : "English"}</label>
            <select className="select" value={f.englishLevel} onChange={(e) => set("englishLevel", e.target.value)}>
              {LANGUAGE_LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABELS[l][locale]}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <h3 className="font-semibold">{L ? "정산 정보" : "Settlement"} <span className="text-xs font-normal text-[var(--color-slate)]">({L ? "선택 · 나중에 입력 가능" : "optional"})</span></h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1"><label className="field-label">{L ? "정산 통화" : "Currency"}</label>
            <select className="select" value={f.settlementCurrency} onChange={(e) => set("settlementCurrency", e.target.value)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="field-label">{L ? "기본 공급 가격" : "Base supply price"}</label><input type="number" className="input" value={f.baseSupplyPrice} onChange={(e) => set("baseSupplyPrice", e.target.value)} /></div>
          <div><label className="field-label">{L ? "은행 계좌" : "Bank account"}</label><input className="input" value={f.bankAccount} onChange={(e) => set("bankAccount", e.target.value)} /></div>
        </div>
      </section>

      <section className="grid gap-4">
        <h3 className="font-semibold">{L ? "서류 업로드" : "Documents"}</h3>
        {KOREA.test(f.country) && (
          <p className="text-xs text-[var(--color-slate)] -mt-2">
            {L ? "국내 기사는 운송면허증과 보험증서 첨부가 필수입니다." : "Domestic (Korea) drivers must attach a transport licence and insurance."}
          </p>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          <DocUpload label={`${L ? "운송사업 면허증" : "Transport license"}${KOREA.test(f.country) ? " *" : ""}${docs.transportLicense ? " ✓" : ""}`} onDone={(u) => setDocs((d) => ({ ...d, transportLicense: u }))} />
          <DocUpload label={`${L ? "보험증서" : "Insurance"}${KOREA.test(f.country) ? " *" : ""}${docs.insurance ? " ✓" : ""}`} onDone={(u) => setDocs((d) => ({ ...d, insurance: u }))} />
          <DocUpload label={L ? "기사 면허" : "Driver license"} onDone={(u) => setDocs((d) => ({ ...d, driverLicense: u }))} />
          <DocUpload label={L ? "차량등록증" : "Vehicle registration"} onDone={(u) => setDocs((d) => ({ ...d, vehicleReg: u }))} />
          <DocUpload label={L ? "차량 사진" : "Vehicle photo"} onDone={(u) => setDocs((d) => ({ ...d, vehiclePhotos: u }))} />
        </div>
      </section>

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" className="h-4 w-4 mt-0.5 accent-[var(--color-navy)]" checked={f.termsAgreed} onChange={(e) => set("termsAgreed", e.target.checked)} />
        <span>{L ? "이용약관 및 파트너 정산 규정에 동의합니다. 제출 후 관리자 승인 절차가 진행됩니다." : "I agree to the terms and partner settlement policy. Applications are reviewed by an admin before approval."}</span>
      </label>

      {error && <div className="text-sm text-[#a52626]">{error}</div>}
      <button className="btn btn-primary" disabled={loading}>
        {loading ? "..." : L ? "파트너 지원 제출" : "Submit application"}
      </button>
    </form>
  );
}
