"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { VEHICLE_CATEGORIES } from "@/lib/constants";

// Lightweight self-check before the full application. It never guarantees legal
// authorization — it only routes the driver to the right next step.
export default function DriverEligibilityCheck({ locale }: { locale: Locale }) {
  const L = locale === "ko";
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [authorized, setAuthorized] = useState<"" | "yes" | "no">("");
  const [vehicle, setVehicle] = useState("Business Sedan");
  const [korean, setKorean] = useState<"" | "yes" | "no">("");
  const [result, setResult] = useState<null | "eligible" | "docs" | "blocked">(null);

  function check() {
    if (authorized === "no") return setResult("blocked");
    if (korean === "no") return setResult("blocked");
    if (!country.trim() || authorized === "" || korean === "") return;
    setResult("eligible");
  }

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6 md:p-8">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="field-label">{L ? "활동 국가" : "Where do you drive? (country)"}</label>
          <input className="input" value={country} onChange={(e) => setCountry(e.target.value)} placeholder={L ? "대한민국 / France / USA" : "e.g. France"} />
        </div>
        <div>
          <label className="field-label">{L ? "활동 도시" : "City"}</label>
          <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder={L ? "서울 / Paris" : "e.g. Paris"} />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label">{L ? "해당 지역에서 유상 여객운송을 합법적으로 제공할 수 있나요?" : "Do you have legal authorization to provide paid passenger transport there?"}</label>
          <div className="flex gap-2">
            {(["yes", "no"] as const).map((v) => (
              <button key={v} type="button" onClick={() => setAuthorized(v)}
                className={`btn text-sm flex-1 ${authorized === v ? "btn-primary" : "btn-outline"}`}>
                {v === "yes" ? (L ? "예" : "Yes") : (L ? "아니오" : "No")}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="field-label">{L ? "차량 종류" : "Vehicle type"}</label>
          <select className="select" value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
            {VEHICLE_CATEGORIES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">{L ? "한국어 소통 가능?" : "Can you communicate in Korean?"}</label>
          <div className="flex gap-2">
            {(["yes", "no"] as const).map((v) => (
              <button key={v} type="button" onClick={() => setKorean(v)}
                className={`btn text-sm flex-1 ${korean === v ? "btn-primary" : "btn-outline"}`}>
                {v === "yes" ? (L ? "예" : "Yes") : (L ? "아니오" : "No")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button type="button" onClick={check} className="btn btn-gold mt-5 w-full sm:w-auto">{L ? "자격 확인" : "Check eligibility"}</button>

      {result === "eligible" && (
        <div className="mt-5 rounded-xl border border-[var(--color-line)] bg-[var(--color-mist)] p-4">
          <div className="font-semibold">{L ? "파트너로 지원하실 수 있습니다" : "You may be eligible to join Certo Drive"}</div>
          <p className="mt-1.5 text-sm text-[var(--color-slate)]">{L ? "활동 국가·지역에 따라 추가 서류가 필요할 수 있으며, 최종 승인은 체르토 검토 후 결정됩니다." : "Additional documents may be required in your region, and final approval follows Certo's review."}</p>
          <a href="#apply" className="btn btn-primary text-sm mt-4">{L ? "지원서 작성하기" : "Start your application"}</a>
        </div>
      )}
      {result === "blocked" && (
        <div className="mt-5 rounded-xl border border-[var(--color-line)] bg-[var(--color-mist)] p-4">
          <div className="font-semibold">{L ? "먼저 확인이 필요합니다" : "A couple of things first"}</div>
          <p className="mt-1.5 text-sm text-[var(--color-slate)]">
            {L ? "체르토 드라이브는 유상운송이 합법인 지역에서, 한국어(또는 한국 고객과) 소통이 가능한 기사와 협력합니다. 자격·서류 확인 후 다시 지원해 주세요. 궁금한 점은 지원팀에 문의하세요." : "Certo works with drivers legally able to carry paying passengers who can communicate with Korean customers. Please confirm your authorization, then apply — or ask our support team."}
          </p>
          <a href="mailto:support@certodrive.com" className="btn btn-outline text-sm mt-4">support@certodrive.com</a>
        </div>
      )}
    </div>
  );
}
