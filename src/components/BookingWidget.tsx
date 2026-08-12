"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { makeT } from "@/lib/i18n";
import { formatMoney } from "@/lib/utils";
import AddressAutocomplete from "./AddressAutocomplete";
import MapPreview from "./MapPreview";
import FlightStatus from "./FlightStatus";
import {
  VEHICLE_CATEGORIES,
  VEHICLE_META,
  POPULAR_CITIES,
  COUNTRY_DIAL_CODES,
  SERVICE_TYPES,
} from "@/lib/constants";

const SERVICE_LABELS: Record<string, { ko: string; en: string }> = {
  AIRPORT_PICKUP: { ko: "공항 픽업", en: "Airport pickup" },
  AIRPORT_DROPOFF: { ko: "공항 샌딩", en: "Airport drop-off" },
  INTERCITY: { ko: "도시 간 이동", en: "Intercity" },
  HOURLY: { ko: "시간제 차량", en: "Hourly hire" },
  VIP: { ko: "VIP 의전", en: "VIP chauffeur" },
};

type Form = {
  serviceType: string;
  tripType: string;
  pickupCountry: string;
  pickupCity: string;
  pickupLocation: string;
  destination: string;
  serviceDate: string;
  serviceTime: string;
  returnDate: string;
  returnTime: string;
  flightNumber: string;
  passengers: number;
  adults: number;
  children: number;
  luggage: number;
  vehicleCategory: string;
  koreanDriverRequired: boolean;
  childSeat: boolean;
  airportPicket: boolean;
  hourlyDuration: number;
  specialRequest: string;
  customerName: string;
  customerEmail: string;
  dialCode: string;
  phone: string;
  messenger: string;
  promotionCode: string;
};

export default function BookingWidget({
  locale,
  serviceType = "AIRPORT_PICKUP",
  compact = false,
  prefill,
}: {
  locale: Locale;
  serviceType?: string;
  compact?: boolean;
  prefill?: Partial<Form>;
}) {
  const t = makeT(locale);
  const router = useRouter();
  const cities = POPULAR_CITIES[locale];

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  type Pt = { lat: number; lon: number } | null;
  const [pickupPt, setPickupPt] = useState<Pt>(null);
  const [destPt, setDestPt] = useState<Pt>(null);
  const [form, setForm] = useState<Form>({
    serviceType,
    tripType: "ONE_WAY",
    pickupCountry: "",
    pickupCity: "",
    pickupLocation: "",
    destination: "",
    serviceDate: "",
    serviceTime: "",
    returnDate: "",
    returnTime: "",
    flightNumber: "",
    passengers: 1,
    adults: 1,
    children: 0,
    luggage: 1,
    vehicleCategory: "Business Sedan",
    koreanDriverRequired: true,
    childSeat: false,
    airportPicket: true,
    hourlyDuration: 3,
    specialRequest: "",
    customerName: "",
    customerEmail: "",
    dialCode: "+82",
    phone: "",
    messenger: "",
    promotionCode: "",
    ...prefill,
  });

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const selectedCity = cities.find((c) => c.city === form.pickupCity);
  const isHourly = form.serviceType === "HOURLY";

  // Live price preview (debounced) once the route + vehicle are known.
  const [estimate, setEstimate] = useState<null | { available: boolean; reason?: string; customerPrice?: number; currency?: string }>(null);
  const [estimating, setEstimating] = useState(false);
  useEffect(() => {
    if (isHourly || !form.pickupCountry || !form.pickupCity || !form.pickupLocation || !form.destination || !form.vehicleCategory) {
      setEstimate(null);
      return;
    }
    let cancelled = false;
    setEstimating(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/price-estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pickupCountry: form.pickupCountry, pickupCity: form.pickupCity, pickupLocation: form.pickupLocation, destination: form.destination,
            vehicleCategory: form.vehicleCategory, koreanDriverRequired: form.koreanDriverRequired, childSeat: form.childSeat,
            airportPicket: form.airportPicket, serviceDate: form.serviceDate, serviceTime: form.serviceTime,
          }),
        });
        const data = await res.json();
        if (!cancelled) setEstimate(data);
      } catch {
        if (!cancelled) setEstimate(null);
      } finally {
        if (!cancelled) setEstimating(false);
      }
    }, 450);
    return () => { cancelled = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.pickupCountry, form.pickupCity, form.pickupLocation, form.destination, form.vehicleCategory, form.koreanDriverRequired, form.childSeat, form.airportPicket, form.serviceDate, form.serviceTime, isHourly]);

  function validateStep1(): string | null {
    if (!form.pickupCountry) return locale === "ko" ? "픽업 국가를 선택하세요." : "Select a pickup country.";
    if (!form.pickupCity) return locale === "ko" ? "픽업 도시를 선택하세요." : "Select a pickup city.";
    if (!form.pickupLocation) return locale === "ko" ? "픽업 장소를 입력하세요." : "Enter a pickup location.";
    if (!isHourly && !form.destination) return locale === "ko" ? "목적지를 입력하세요." : "Enter a destination.";
    if (!form.serviceDate) return locale === "ko" ? "날짜를 선택하세요." : "Select a date.";
    if (!form.serviceTime) return locale === "ko" ? "시간을 선택하세요." : "Select a time.";
    return null;
  }

  function validateStep3(): string | null {
    if (!form.customerName) return locale === "ko" ? "이름을 입력하세요." : "Enter your name.";
    if (!form.customerEmail || !form.customerEmail.includes("@"))
      return locale === "ko" ? "올바른 이메일을 입력하세요." : "Enter a valid email.";
    if (!form.phone) return locale === "ko" ? "전화번호를 입력하세요." : "Enter your phone number.";
    return null;
  }

  async function submit() {
    const err = validateStep3();
    if (err) return setError(err);
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        customerPhone: `${form.dialCode} ${form.phone}`.trim(),
        destination: isHourly ? (locale === "ko" ? "시간제 이용" : "Hourly hire") : form.destination,
      };
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      router.push(`/booking/confirm/${data.reference}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setSubmitting(false);
    }
  }

  function goNext() {
    if (step === 1) {
      const err = validateStep1();
      if (err) return setError(err);
    }
    setError(null);
    setStep((s) => Math.min(3, s + 1));
  }

  return (
    <div className={`card card-shadow ${compact ? "p-5" : "p-6 md:p-7"}`}>
      {/* Service tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {SERVICE_TYPES.map((s) => (
          <button
            key={s}
            onClick={() => set("serviceType", s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              form.serviceType === s
                ? "bg-[var(--color-navy)] text-white"
                : "bg-[var(--color-mist)] text-[var(--color-slate)] hover:bg-[var(--color-line)]"
            }`}
          >
            {SERVICE_LABELS[s][locale]}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-5">
        {[
          { n: 1, label: t("book.step1") },
          { n: 2, label: t("book.step2") },
          { n: 3, label: t("book.step3") },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div
              className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= s.n ? "bg-[var(--color-gold)] text-[var(--color-ink)]" : "bg-[var(--color-mist)] text-[var(--color-slate)]"
              }`}
            >
              {s.n}
            </div>
            <span className={`text-xs font-medium ${step >= s.n ? "text-[var(--color-ink)]" : "text-[var(--color-slate)]"} hidden sm:inline`}>
              {s.label}
            </span>
            {i < 2 && <div className="flex-1 h-px bg-[var(--color-line)]" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-[#fdeaea] text-[#a52626] text-sm px-3 py-2">{error}</div>
      )}

      {/* Step 1 — trip */}
      {step === 1 && (
        <div className="grid gap-4">
          <div className="inline-flex rounded-lg border border-[var(--color-line)] overflow-hidden w-fit text-sm">
            {["ONE_WAY", "ROUND_TRIP"].map((tt) => (
              <button
                key={tt}
                onClick={() => set("tripType", tt)}
                className={`px-4 py-1.5 font-medium ${form.tripType === tt ? "bg-[var(--color-navy)] text-white" : "text-[var(--color-slate)]"}`}
              >
                {tt === "ONE_WAY" ? t("book.oneway") : t("book.roundtrip")}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">{t("book.country")}</label>
              <select
                className="select"
                value={form.pickupCountry}
                onChange={(e) => {
                  set("pickupCountry", e.target.value);
                  set("pickupCity", "");
                  set("pickupLocation", "");
                }}
              >
                <option value="">{t("book.selectPlaceholder")}</option>
                {[...new Set(cities.map((c) => c.country))].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">{t("book.city")}</label>
              <select
                className="select"
                value={form.pickupCity}
                onChange={(e) => {
                  set("pickupCity", e.target.value);
                  set("pickupLocation", "");
                }}
                disabled={!form.pickupCountry}
              >
                <option value="">{t("book.selectPlaceholder")}</option>
                {cities.filter((c) => c.country === form.pickupCountry).map((c) => (
                  <option key={c.city} value={c.city}>{c.city}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">{t("book.pickup")}</label>
              <AddressAutocomplete
                locale={locale}
                value={form.pickupLocation}
                onChange={(v) => { set("pickupLocation", v); setPickupPt(null); }}
                onSelect={(s) => setPickupPt(s.lat != null && s.lon != null ? { lat: s.lat, lon: s.lon } : null)}
                quickOptions={selectedCity?.airports ?? []}
                placeholder={locale === "ko" ? "공항 또는 정확한 주소 검색" : "Airport or exact address"}
              />
            </div>
            {!isHourly && (
              <div>
                <label className="field-label">{t("book.destination")}</label>
                <AddressAutocomplete
                  locale={locale}
                  value={form.destination}
                  onChange={(v) => { set("destination", v); setDestPt(null); }}
                  onSelect={(s) => setDestPt(s.lat != null && s.lon != null ? { lat: s.lat, lon: s.lon } : null)}
                  placeholder={locale === "ko" ? "호텔 또는 정확한 주소 검색" : "Hotel or exact address"}
                />
              </div>
            )}
            {isHourly && (
              <div>
                <label className="field-label">{t("book.hours")}</label>
                <input
                  type="number"
                  min={1}
                  className="input"
                  value={form.hourlyDuration}
                  onChange={(e) => set("hourlyDuration", Number(e.target.value))}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">{t("book.date")}</label>
              <input type="date" className="input" value={form.serviceDate} onChange={(e) => set("serviceDate", e.target.value)} />
            </div>
            <div>
              <label className="field-label">{t("book.time")}</label>
              <input type="time" className="input" value={form.serviceTime} onChange={(e) => set("serviceTime", e.target.value)} />
            </div>
          </div>

          {form.tripType === "ROUND_TRIP" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">{t("book.returnDate")}</label>
                <input type="date" className="input" value={form.returnDate} onChange={(e) => set("returnDate", e.target.value)} />
              </div>
              <div>
                <label className="field-label">{t("book.returnTime")}</label>
                <input type="time" className="input" value={form.returnTime} onChange={(e) => set("returnTime", e.target.value)} />
              </div>
            </div>
          )}

          {/* Real map preview of the trip */}
          <MapPreview
            locale={locale}
            pickup={pickupPt}
            destination={destPt}
            pickupLabel={form.pickupLocation}
            destLabel={isHourly ? "" : form.destination}
          />
        </div>
      )}

      {/* Step 2 — vehicle & options */}
      {step === 2 && (
        <div className="grid gap-4">
          <div>
            <label className="field-label">{t("book.vehicle")}</label>
            <div className="grid sm:grid-cols-2 gap-2">
              {VEHICLE_CATEGORIES.map((v) => {
                const meta = VEHICLE_META[v];
                return (
                  <button
                    key={v}
                    onClick={() => set("vehicleCategory", v)}
                    className={`text-left rounded-lg border p-3 transition-colors ${
                      form.vehicleCategory === v
                        ? "border-[var(--color-navy)] bg-[var(--color-mist)]"
                        : "border-[var(--color-line)] hover:border-[var(--color-slate)]"
                    }`}
                  >
                    <div className="font-semibold text-sm">{v}</div>
                    <div className="text-xs text-[var(--color-slate)]">
                      {meta.blurb[locale]} · {meta.pax} {t("fleet.pax")} · {meta.luggage} {t("fleet.bags")}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: "adults" as const, label: t("book.adults"), min: 1 },
              { k: "children" as const, label: t("book.children"), min: 0 },
              { k: "luggage" as const, label: t("book.luggage"), min: 0 },
              { k: "passengers" as const, label: t("book.passengers"), min: 1 },
            ].map((f) => (
              <div key={f.k}>
                <label className="field-label">{f.label}</label>
                <input
                  type="number"
                  min={f.min}
                  className="input"
                  value={form[f.k]}
                  onChange={(e) => set(f.k, Number(e.target.value))}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="field-label">{t("book.flight")} <span className="text-[var(--color-slate)] font-normal">({t("common.optional")})</span></label>
            <input className="input" value={form.flightNumber} onChange={(e) => set("flightNumber", e.target.value.toUpperCase())} placeholder="KE901 / OZ102" />
            {form.flightNumber.trim() && <FlightStatus flight={form.flightNumber} date={form.serviceDate || undefined} locale={locale} />}
          </div>

          <div className="grid gap-2">
            {[
              { k: "koreanDriverRequired" as const, label: t("book.korean") },
              { k: "childSeat" as const, label: t("book.childseat") },
              { k: "airportPicket" as const, label: t("book.picket") },
            ].map((o) => (
              <label key={o.k} className="flex items-center gap-3 rounded-lg border border-[var(--color-line)] px-3 py-2.5 cursor-pointer hover:bg-[var(--color-mist)]">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--color-navy)]"
                  checked={form[o.k] as boolean}
                  onChange={(e) => set(o.k, e.target.checked)}
                />
                <span className="text-sm font-medium">{o.label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="field-label">{t("book.special")} <span className="text-[var(--color-slate)] font-normal">({t("common.optional")})</span></label>
            <textarea className="textarea" rows={2} value={form.specialRequest} onChange={(e) => set("specialRequest", e.target.value)} />
          </div>
        </div>
      )}

      {/* Step 3 — customer */}
      {step === 3 && (
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">{t("book.name")}</label>
              <input className="input" value={form.customerName} onChange={(e) => set("customerName", e.target.value)} />
            </div>
            <div>
              <label className="field-label">{t("book.email")}</label>
              <input type="email" className="input" value={form.customerEmail} onChange={(e) => set("customerEmail", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="field-label">{t("book.phone")}</label>
            <div className="flex gap-2">
              <select className="select w-32" value={form.dialCode} onChange={(e) => set("dialCode", e.target.value)}>
                {COUNTRY_DIAL_CODES.map((d) => <option key={d.code} value={d.code}>{d.label}</option>)}
              </select>
              <input className="input flex-1" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="10-1234-5678" />
            </div>
          </div>
          <div>
            <label className="field-label">{t("book.messenger")} <span className="text-[var(--color-slate)] font-normal">({t("common.optional")})</span></label>
            <input className="input" value={form.messenger} onChange={(e) => set("messenger", e.target.value)} placeholder="KakaoTalk ID / WhatsApp" />
          </div>
          <div>
            <label className="field-label">{locale === "ko" ? "프로모션 코드" : "Promotion code"} <span className="text-[var(--color-slate)] font-normal">({t("common.optional")})</span></label>
            <input className="input uppercase" value={form.promotionCode} onChange={(e) => set("promotionCode", e.target.value.toUpperCase())} placeholder="WELCOME10" />
          </div>
          <p className="text-xs text-[var(--color-slate)]">
            {locale === "ko"
              ? "제출 시 등록된 노선은 즉시 가격이 표시되며, 그 외 지역은 견적 요청으로 접수되어 최종 가격을 안내드립니다."
              : "On submit, registered routes show an instant price. Other areas are received as a quote request and we'll send you the final price."}
          </p>
        </div>
      )}

      {/* Live price preview (steps 2–3) */}
      {step > 1 && estimate && (
        <div className="mt-5 rounded-xl border border-[var(--color-line)] overflow-hidden">
          {estimate.available ? (
            <div>
              <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-mist)]">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[var(--color-slate)]">{locale === "ko" ? "예상 요금 (정찰제)" : "Estimated fixed price"}</span>
                    <span className="pill pill-green text-[10px]">{locale === "ko" ? "즉시 예약" : "Instant"}</span>
                  </div>
                  <div className="text-[11px] text-[var(--color-slate)]">{locale === "ko" ? "결제 전 최종 확인" : "Confirmed before payment"}</div>
                </div>
                <div className="font-display text-2xl font-bold text-[var(--color-navy)]">
                  {formatMoney(estimate.customerPrice, estimate.currency)}
                </div>
              </div>
              <div className="px-4 py-3 border-t border-[var(--color-line)] bg-white">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-slate)]">{locale === "ko" ? "요금에 포함" : "Your fare includes"}</div>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--color-ink)]">
                  {(locale === "ko"
                    ? ["기본 대기시간", "톨게이트", "주차", "항공편 지연 확인", ...(form.airportPicket ? ["공항 피켓 미팅"] : [])]
                    : ["Base waiting", "Tolls", "Parking", "Flight tracking", ...(form.airportPicket ? ["Meet & greet"] : [])]
                  ).map((x) => <span key={x} className="inline-flex items-center gap-1">✓ {x}</span>)}
                </div>
                <p className="mt-2 text-[11px] text-[var(--color-slate)]">
                  {locale === "ko" ? "추가 정차·대기 초과·예약 외 일정 변경은 별도 요금이 안내됩니다." : "Extra stops, waiting beyond the included time, and off-booking changes are advised separately."}
                </p>
              </div>
            </div>
          ) : estimate.reason === "quote" ? (
            <div className="px-4 py-3 bg-[var(--color-mist)] text-sm text-[var(--color-slate)]">
              {locale === "ko"
                ? "이 노선은 맞춤 견적 지역입니다 — 제출하시면 파트너 기사 확인 후 최종 가격을 빠르게 안내드립니다."
                : "This route is quoted individually — submit and we'll confirm the final price with a partner driver shortly."}
            </div>
          ) : null}
        </div>
      )}
      {step > 1 && estimating && !estimate && (
        <div className="mt-5 text-xs text-[var(--color-slate)] text-center">{locale === "ko" ? "예상 요금 계산 중..." : "Estimating price..."}</div>
      )}

      {/* Nav buttons */}
      <div className="flex items-center justify-between mt-6 gap-3">
        {step > 1 ? (
          <button className="btn btn-ghost" onClick={() => { setError(null); setStep((s) => s - 1); }}>
            {t("book.back")}
          </button>
        ) : <span />}
        {step < 3 ? (
          <button className="btn btn-primary flex-1 sm:flex-none" onClick={goNext}>{t("book.next")}</button>
        ) : (
          <button className="btn btn-gold flex-1 sm:flex-none" onClick={submit} disabled={submitting}>
            {submitting ? t("common.loading") : t("book.getPrice")}
          </button>
        )}
      </div>
    </div>
  );
}
