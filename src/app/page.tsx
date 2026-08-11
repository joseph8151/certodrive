import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BookingWidget from "@/components/BookingWidget";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import Icon from "@/components/Icon";
import { getLocale } from "@/lib/locale";
import { makeT } from "@/lib/i18n";
import { prisma } from "@/lib/db";
import { VEHICLE_CATEGORIES, VEHICLE_META } from "@/lib/constants";
import { IMG, cityImage } from "@/lib/images";

export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const locale = await getLocale();
  const t = makeT(locale);
  const L = locale === "ko";
  const sp = await searchParams;

  const prefillKeys = ["serviceType", "pickupCountry", "pickupCity", "pickupLocation", "destination", "vehicleCategory", "promotionCode"] as const;
  if (sp.promo) sp.promotionCode = sp.promo;
  const prefill: Record<string, string> = {};
  for (const k of prefillKeys) if (sp[k]) prefill[k] = String(sp[k]);
  const hasPrefill = Object.keys(prefill).length > 0;

  // Real, verified drivers only — no sample data shown publicly.
  const driverRows = await prisma.driverProfile.findMany({
    where: { approvalStatus: "APPROVED" },
    orderBy: [{ rating: "desc" }, { ratingCount: "desc" }],
    take: 4,
    include: { vehicles: true },
  });
  const LANG_LABEL: Record<string, { ko: string; en: string }> = {
    NATIVE: { ko: "원어민", en: "Native" }, FLUENT: { ko: "유창", en: "Fluent" },
    CONVERSATIONAL: { ko: "회화", en: "Conversational" }, BASIC: { ko: "기초", en: "Basic" }, NONE: { ko: "", en: "" },
  };

  // Featured real review, if any exist.
  const reviewRows = await prisma.review.findMany({
    where: { rating: { gte: 4 }, comment: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: { booking: { select: { pickupCity: true, pickupLocation: true, destination: true, serviceDate: true } } },
  });

  const photoBg = (url: string, overlay: string) => ({
    backgroundColor: "var(--color-graphite)",
    backgroundImage: `${overlay}, url(${url})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  });

  // ── Priced routes (edit here until wired to live pricing) ──────────────────
  const routes = [
    { code: "ICN", city: L ? "서울" : "Seoul", to: L ? "강남 · 서울 시내" : "Gangnam · Seoul", from: "₩90,000", slug: L ? "서울" : "Seoul" },
    { code: "NRT", city: L ? "도쿄" : "Tokyo", to: L ? "도쿄 시내" : "Central Tokyo", from: "¥25,000", slug: L ? "도쿄" : "Tokyo" },
    { code: "CDG", city: L ? "파리" : "Paris", to: L ? "파리 시내" : "Central Paris", from: "€95", slug: L ? "파리" : "Paris" },
    { code: "LHR", city: L ? "런던" : "London", to: L ? "런던 시내" : "Central London", from: "£110", slug: L ? "런던" : "London" },
    { code: "JFK", city: L ? "뉴욕" : "New York", to: L ? "맨해튼" : "Manhattan", from: "$145", slug: L ? "뉴욕" : "New York" },
    { code: "FCO", city: L ? "로마" : "Rome", to: L ? "로마 시내" : "Central Rome", from: "€90", slug: L ? "로마" : "Rome" },
  ];

  const cities = [
    { codes: "ICN · GMP", name: L ? "서울" : "Seoul", country: L ? "대한민국" : "South Korea", slug: L ? "서울" : "Seoul" },
    { codes: "NRT · HND", name: L ? "도쿄" : "Tokyo", country: L ? "일본" : "Japan", slug: L ? "도쿄" : "Tokyo" },
    { codes: "CDG · ORY", name: L ? "파리" : "Paris", country: L ? "프랑스" : "France", slug: L ? "파리" : "Paris" },
    { codes: "LHR · LGW", name: L ? "런던" : "London", country: L ? "영국" : "UK", slug: L ? "런던" : "London" },
    { codes: "JFK · EWR", name: L ? "뉴욕" : "New York", country: L ? "미국" : "USA", slug: L ? "뉴욕" : "New York" },
    { codes: "FCO", name: L ? "로마" : "Rome", country: L ? "이탈리아" : "Italy", slug: L ? "로마" : "Rome" },
    { codes: "BCN", name: L ? "바르셀로나" : "Barcelona", country: L ? "스페인" : "Spain", slug: L ? "바르셀로나" : "Barcelona" },
    { codes: "BKK", name: L ? "방콕" : "Bangkok", country: L ? "태국" : "Thailand", slug: L ? "방콕" : "Bangkok" },
  ];

  const Check = () => (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0" aria-hidden>
      <path d="M4 10.5l3.5 3.5L16 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <>
      <SiteHeader />

      {/* ═══ HERO — dark, real booking search on a strong photo ═══ */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: "var(--color-graphite)" }}>
        <div className="absolute inset-0" style={photoBg(IMG.hero, "linear-gradient(103deg, rgba(17,17,17,0.94) 0%, rgba(17,17,17,0.82) 46%, rgba(17,17,17,0.5) 100%)")} />
        <div className="container-cd relative py-14 md:py-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] live-dot" />
              {L ? "글로벌 한국어 모빌리티 네트워크" : "Global Korean-speaking mobility network"}
            </div>
            <h1 className="font-display text-[2.7rem] leading-[1.02] sm:text-6xl lg:text-[4.4rem] mt-5 whitespace-pre-line">
              {t("hero.title")}
            </h1>
            <p className="mt-6 text-white/70 text-base md:text-lg max-w-lg leading-relaxed">{t("hero.subtitle")}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/65">
              {[
                L ? "검증된 한인 기사" : "Verified drivers",
                L ? "정찰제 요금" : "Upfront pricing",
                L ? "출발 전 배정" : "Assigned before departure",
                L ? "24시간 한국어 지원" : "24/7 Korean support",
              ].map((f) => (
                <span key={f} className="flex items-center gap-2">
                  <span className="text-[var(--color-accent)]"><Check /></span>{f}
                </span>
              ))}
            </div>
          </div>
          <div id="book" className="scroll-mt-24">
            <BookingWidget locale={locale} prefill={hasPrefill ? prefill : undefined} />
          </div>
        </div>
      </section>

      {/* ═══ Live city ticker ═══ */}
      <div className="border-b border-[var(--color-line)] bg-[var(--color-bg)]">
        <div className="container-cd py-3.5 flex items-center gap-4">
          <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate)] shrink-0">
            {L ? "운행 도시" : "Live in"}
          </span>
          <div className="marquee-mask flex-1 overflow-hidden">
            <div className="flex w-max marquee-track">
              {[0, 1].map((dup) => (
                <div key={dup} className="flex items-center gap-6 pr-6 text-sm text-[var(--color-slate)] whitespace-nowrap" aria-hidden={dup === 1}>
                  {(L
                    ? ["서울", "인천공항", "도쿄", "오사카", "파리", "런던", "뉴욕", "로스앤젤레스", "로마", "바르셀로나", "방콕", "싱가포르"]
                    : ["Seoul", "Incheon", "Tokyo", "Osaka", "Paris", "London", "New York", "Los Angeles", "Rome", "Barcelona", "Bangkok", "Singapore"]
                  ).map((c) => (
                    <span key={c} className="flex items-center gap-6">
                      <span>{c}</span><span className="text-[var(--color-line-strong)]">/</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ WHAT IS CERTO — the core clarification (managed, not a marketplace) ═══ */}
      <section className="section">
        <div className="container-cd grid lg:grid-cols-[0.9fr_1.1fr] gap-14 lg:gap-20 items-start">
          <div className="lg:sticky lg:top-24">
            <p className="eyebrow">{L ? "체르토 드라이브란" : "What Certo is"}</p>
            <h2 className="font-display text-[2.1rem] md:text-[2.7rem] mt-5">
              {L ? "기사 연결이 아니라, 예약부터 도착까지 관리되는 이동 서비스입니다." : "Not a driver marketplace. A managed ride, from booking to arrival."}
            </h2>
            <p className="mt-6 text-[var(--color-slate)] leading-relaxed">
              {L
                ? "이동 정보를 입력하면 체르토 드라이브가 예약 내용을 직접 확인하고, 해당 지역에서 운행 가능한 검증된 기사와 차량을 배정합니다. 예약이 확정되면 출발 전에 기사·차량 정보를 받아보고, 공항 픽업부터 목적지 도착까지 저희가 예약을 관리합니다."
                : "You enter your trip, and Certo reviews it, then assigns a verified driver and vehicle available in that city. Once confirmed, you receive the driver and vehicle details before departure — and we manage the booking all the way to your destination."}
            </p>
            <p className="mt-4 text-[var(--color-slate)] leading-relaxed">
              {L
                ? "해외에서 기사와 연락이 어렵거나 운행 중 문제가 생겨도, 고객이 직접 해결하도록 두지 않습니다. 체르토 드라이브가 중간에서 지원합니다."
                : "If the driver is hard to reach abroad or something goes wrong mid-trip, you don't sort it out alone — Certo steps in between."}
            </p>
          </div>

          {/* Comparison — answers "Uber? 한인택시? 연락처 연결?" directly */}
          <div className="grid gap-3">
            {[
              {
                k: "certo", name: "Certo Drive", accent: true,
                rows: L
                  ? ["예약을 사람이 직접 확인하고 배차", "출발 전에 기사·차량 확정", "정찰제 — 예약 시 요금 확정", "문제 발생 시 체르토가 중간 지원"]
                  : ["Every booking human-reviewed & assigned", "Driver & vehicle confirmed before departure", "Upfront fixed price at booking", "Certo mediates if anything goes wrong"],
              },
              {
                k: "hail", name: L ? "호출 앱 (우버 등)" : "Ride-hailing (Uber, etc.)", accent: false,
                rows: L
                  ? ["현장에서 즉시 매칭 (사전 확정 없음)", "누가 올지 도착까지 알 수 없음", "수요에 따라 요금 변동", "문제는 앱/기사와 직접 해결"]
                  : ["Matched on the spot, nothing pre-confirmed", "You don't know who comes until arrival", "Surge pricing varies with demand", "You resolve issues with the app/driver"],
              },
              {
                k: "taxi", name: L ? "일반 한인택시 연결" : "Typical Korean-taxi referral", accent: false,
                rows: L
                  ? ["기사 연락처만 전달", "검증·보험 확인이 제각각", "요금은 기사와 직접 흥정", "이후 관리·책임 주체가 불명확"]
                  : ["Just hands you a driver's contact", "Vetting & insurance are inconsistent", "You negotiate the fare with the driver", "No clear party managing the trip"],
              },
            ].map((c) => (
              <div key={c.k} className={`rounded-2xl border p-6 ${c.accent ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white" : "border-[var(--color-line)] bg-white"}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-display text-lg ${c.accent ? "text-white" : "text-[var(--color-ink)]"}`}>{c.name}</span>
                  {c.accent && <span className="chip bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-accent-ink)]">{L ? "관리형" : "Managed"}</span>}
                </div>
                <ul className="mt-4 grid gap-2.5">
                  {c.rows.map((r, i) => (
                    <li key={i} className={`flex items-start gap-2.5 text-sm ${c.accent ? "text-white/80" : "text-[var(--color-slate)]"}`}>
                      <span className={c.accent ? "text-[var(--color-accent)] mt-0.5" : "text-[var(--color-slate-400)] mt-0.5"}>
                        {c.accent ? <Check /> : <span className="block w-4 h-4 text-center leading-4">·</span>}
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MANAGED FLOW — BOOK → CERTO CHECK → … → SUPPORT ═══ */}
      <section className="bg-[var(--color-graphite)] text-white">
        <div className="container-cd py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60">
              <span className="w-4 h-px bg-white/50" />{L ? "관리형 배차" : "Certo managed dispatch"}
            </div>
            <h2 className="font-display text-3xl md:text-[2.6rem] mt-4">
              {L ? "모든 예약은 체르토가 확인하고, 배정하고, 지원합니다." : "Every booking is reviewed, assigned and supported by Certo."}
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-6 gap-px rounded-2xl overflow-hidden border border-white/10 bg-white/10">
            {[
              { n: "01", t: L ? "예약" : "Book", d: L ? "이동 정보 입력" : "Enter your trip" },
              { n: "02", t: L ? "체르토 확인" : "Certo check", d: L ? "예약 내용 검토" : "We review it" },
              { n: "03", t: L ? "기사 배정" : "Driver assigned", d: L ? "지역 검증 기사" : "Verified & local" },
              { n: "04", t: L ? "기사 정보 전달" : "Driver details", d: L ? "출발 전 공유" : "Sent before you go" },
              { n: "05", t: L ? "픽업" : "Pickup", d: L ? "공항·현장 미팅" : "Airport meet" },
              { n: "06", t: L ? "지원" : "Support", d: L ? "도착까지 관리" : "Managed to arrival" },
            ].map((s) => (
              <div key={s.n} className="bg-[var(--color-graphite)] p-5">
                <div className="text-[var(--color-accent)] font-display text-sm">{s.n}</div>
                <div className="mt-3 font-semibold">{s.t}</div>
                <div className="mt-1 text-[13px] text-white/55 leading-snug">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICES — varied editorial rows (not identical cards) ═══ */}
      <section className="section">
        <div className="container-cd">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div className="max-w-xl">
              <p className="eyebrow">{L ? "서비스" : "Services"}</p>
              <h2 className="font-display text-[2.1rem] md:text-[2.7rem] mt-5">{L ? "어떤 이동이든, 한 곳에서" : "Every kind of ride, in one place"}</h2>
            </div>
          </div>

          {/* Row 1 — Airport Transfer: split photo + included-detail list */}
          <div className="mt-14 grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="rounded-2xl overflow-hidden aspect-[4/3]" style={photoBg(IMG.airport, "linear-gradient(180deg, rgba(17,17,17,0.05), rgba(17,17,17,0.25))")} />
            <div>
              <div className="text-[13px] font-semibold text-[var(--color-slate)]">01 — {L ? "공항 픽업·샌딩" : "Airport transfer"}</div>
              <h3 className="font-display text-2xl md:text-3xl mt-2">{L ? "도착하면, 기사가 기다리고 있습니다" : "Land, and your driver is already there"}</h3>
              <p className="mt-4 text-[var(--color-slate)] leading-relaxed">
                {L ? "항공편 번호로 도착 시간을 확인해 대기하고, 입국장에서 이름 피켓으로 맞이합니다. 목적지까지 정찰제로 이동합니다." : "We track your flight, wait for delays, and meet you at arrivals with a name board — then drive you to your destination at a fixed price."}
              </p>
              <ul className="mt-6 grid sm:grid-cols-2 gap-2.5 text-sm">
                {(L
                  ? ["항공편 지연 자동 확인", "무료 대기시간 포함", "입국장 피켓 미팅", "톨게이트·주차 포함", "카시트 요청 가능", "터미널 변경 대응"]
                  : ["Flight-delay tracking", "Free waiting time included", "Meet & greet name board", "Tolls & parking included", "Child seat on request", "Terminal-change handling"]
                ).map((x) => (
                  <li key={x} className="flex items-center gap-2 text-[var(--color-ink)]"><span className="text-[var(--color-ink)]"><Check /></span>{x}</li>
                ))}
              </ul>
              <Link href="/booking/airport-pickup" className="btn btn-outline mt-7 text-sm">{L ? "공항 픽업 예약" : "Book airport transfer"}</Link>
            </div>
          </div>

          {/* Row 2 — Point-to-point + Hourly: two distinct blocks, reversed weight */}
          <div className="mt-8 grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[var(--color-line)] p-8 bg-white flex flex-col">
              <div className="text-[13px] font-semibold text-[var(--color-slate)]">02 — {L ? "지점 간 이동 · 한인 택시" : "Point-to-point · Korean taxi"}</div>
              <h3 className="font-display text-2xl mt-2">{L ? "호텔↔공항, 시내 어디든" : "Hotel ↔ airport, anywhere in the city"}</h3>
              <p className="mt-3 text-[var(--color-slate)] leading-relaxed text-[15px]">
                {L ? "호텔에서 관광지로, 집에서 공항으로 — 특정 장소에서 특정 장소까지 한 번에. 한국어가 통하는 기사와 미터기 흥정 없이 확정 요금으로." : "Hotel to sights, home to airport — one fixed run between two points, with a Korean-speaking driver and no meter haggling."}
              </p>
              <Link href="/booking/intercity" className="mt-auto pt-6 text-sm font-semibold text-[var(--color-ink)] hover:underline">{L ? "이동 예약 →" : "Book a transfer →"}</Link>
            </div>
            <div className="rounded-2xl border border-[var(--color-line)] p-8 bg-[var(--color-mist)] flex flex-col">
              <div className="text-[13px] font-semibold text-[var(--color-slate)]">03 — {L ? "시간제 차량" : "Hourly hire"}</div>
              <h3 className="font-display text-2xl mt-2">{L ? "기사와 차량을, 시간 단위로" : "A driver and car, by the hour"}</h3>
              <p className="mt-3 text-[var(--color-slate)] leading-relaxed text-[15px]">
                {L ? "쇼핑·여러 미팅·병원·골프·시내 관광까지. 여러 목적지를 자유롭게 도는 하루 전세. 시간만큼만 결제합니다." : "Shopping, multiple meetings, golf, city touring — multi-stop hire by the hour. Pay for the time you use."}
              </p>
              <Link href="/booking/hourly" className="mt-auto pt-6 text-sm font-semibold text-[var(--color-ink)] hover:underline">{L ? "시간제 예약 →" : "Book hourly →"}</Link>
            </div>
          </div>

          {/* Row 3 — Long distance: route-UI block */}
          <div className="mt-8 grid lg:grid-cols-[1fr_0.85fr] gap-6 items-stretch">
            <div className="rounded-2xl border border-[var(--color-line)] p-8 bg-white">
              <div className="text-[13px] font-semibold text-[var(--color-slate)]">04 — {L ? "장거리 · 도시 간 이동" : "Long distance · intercity"}</div>
              <h3 className="font-display text-2xl mt-2">{L ? "도시와 도시 사이도, 한 번에" : "City to city, in a single ride"}</h3>
              <p className="mt-3 text-[var(--color-slate)] leading-relaxed text-[15px] max-w-md">
                {L ? "파리 → 브뤼셀, 도쿄 → 하코네처럼 도시 간 장거리 이동을 편안하게. 중간 정차와 짐도 넉넉하게." : "Paris → Brussels, Tokyo → Hakone — long intercity runs in comfort, with stops and luggage handled."}
              </p>
            </div>
            {/* Route diagram */}
            <div className="rounded-2xl bg-[var(--color-ink)] text-white p-8 flex flex-col justify-center">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center pt-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />
                  <span className="w-px flex-1 my-1 border-l border-dashed border-white/30 min-h-[46px]" />
                  <span className="h-2.5 w-2.5 rounded-full ring-2 ring-white/60" />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] text-white/45 uppercase tracking-wider">CDG · 09:30</div>
                  <div className="font-semibold">Paris</div>
                  <div className="my-3 text-[12px] text-white/45">≈ 45–60 min · {L ? "정찰제" : "fixed fare"}</div>
                  <div className="text-[11px] text-white/45 uppercase tracking-wider">10:15</div>
                  <div className="font-semibold">Brussels</div>
                </div>
              </div>
              <Link href="/booking/intercity" className="btn btn-gold mt-7 text-sm w-fit">{L ? "장거리 견적" : "Get a quote"}</Link>
            </div>
          </div>

          {/* Row 4 — Business / VIP: dark full-bleed callout */}
          <div className="mt-8 rounded-2xl overflow-hidden relative text-white" style={photoBg(IMG.vipBand, "linear-gradient(100deg, rgba(17,17,17,0.92) 0%, rgba(17,17,17,0.6) 100%)")}>
            <div className="relative p-8 md:p-12 max-w-xl">
              <div className="text-[13px] font-semibold text-white/60">05 — {L ? "비즈니스 · VIP 의전" : "Business · VIP"}</div>
              <h3 className="font-display text-2xl md:text-3xl mt-2">{L ? "출장·임원 이동·단체 의전" : "Travel, executive moves & delegations"}</h3>
              <p className="mt-3 text-white/70 leading-relaxed">
                {L ? "정시 도착과 조용한 이동, 공항 의전과 다중 차량 배차까지. 기업·여행사 제휴도 지원합니다. (지역·조건에 따라 제공)" : "On-time, discreet rides, airport protocol and multi-vehicle dispatch — with corporate and agency partnerships. (Availability varies by city.)"}
              </p>
              <Link href="/vip" className="btn btn-gold mt-7 text-sm">{L ? "비즈니스 문의" : "Business enquiry"}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — 6 steps incl. airport meeting ═══ */}
      <section className="section bg-[var(--color-mist)]">
        <div className="container-cd">
          <div className="max-w-xl">
            <p className="eyebrow">{L ? "이용 방법" : "How it works"}</p>
            <h2 className="font-display text-[2.1rem] md:text-[2.7rem] mt-5">{L ? "예약부터 도착까지, 6단계" : "From booking to arrival, in six steps"}</h2>
          </div>
          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {[
              { n: "01", t: L ? "이동 정보 입력" : "Enter your trip", d: L ? "출발지·목적지·날짜·시간·인원·짐을 입력합니다. 공항 픽업은 공항·항공편·도착 시간까지 함께 입력합니다." : "Pickup, destination, date, time, passengers and bags. For airport pickups, add your airport, flight and arrival time." },
              { n: "02", t: L ? "요금 확인" : "See your price", d: L ? "등록된 노선은 즉시 정찰 요금이 표시되고, 그 외 지역은 체르토가 기사·차량 가능 여부를 확인해 견적을 보내드립니다." : "Registered routes show an instant fixed price. For other areas, Certo checks driver and vehicle availability and sends a quote." },
              { n: "03", t: L ? "예약 확정 · 결제" : "Confirm & pay", d: L ? "결제와 배차가 확정되면 예약번호·픽업·도착지·일시·차량·최종 요금이 담긴 확정 안내를 받습니다." : "Once payment and dispatch are set, you get a confirmation with booking number, pickup, destination, time, vehicle and final price." },
              { n: "04", t: L ? "기사 정보 전달" : "Driver details sent", d: L ? "운행 전에 기사 이름·사진·연락처, 차종·차량번호·차량 사진, 미팅 방법을 전달드립니다. 결제 후 채팅으로 기사와 직접 소통할 수 있습니다." : "Before the trip you receive the driver's name, photo and contact, the vehicle and plate, and how to meet — plus in-app chat with the driver after payment." },
              { n: "05", t: L ? "공항·현장 픽업" : "Airport / pickup", d: L ? "입국 → 수하물 수령 → 미팅 포인트 이동 → 기사 미팅 → 탑승. 어디서 만날지 미리 안내드립니다." : "Arrive → collect bags → walk to the meeting point → meet your driver → get in. We tell you exactly where to meet." },
              { n: "06", t: L ? "운행 완료 · 후기" : "Complete & review", d: L ? "목적지 도착으로 운행이 완료되고, 기사와 운행에 대한 후기를 남길 수 있습니다." : "Arrival completes the trip, and you can leave a review of the driver and the ride." },
            ].map((s) => (
              <div key={s.n} className="border-t border-[var(--color-line-strong)] pt-5">
                <div className="font-display text-3xl text-[var(--color-ink)]">{s.n}</div>
                <h3 className="mt-3 font-semibold text-lg">{s.t}</h3>
                <p className="mt-2 text-[15px] text-[var(--color-slate)] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
          {/* Airport meeting mini-illustration */}
          <div className="mt-12 rounded-2xl border border-[var(--color-line)] bg-white p-6 md:p-8 grid md:grid-cols-[auto_1fr] gap-6 items-center">
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              {(L ? ["입국", "수하물", "미팅 포인트", "기사 미팅", "탑승"] : ["Arrivals", "Baggage", "Meeting point", "Meet driver", "Ride"]).map((s, i, a) => (
                <span key={s} className="flex items-center gap-2 md:gap-3">
                  <span className="chip">{s}</span>
                  {i < a.length - 1 && <span className="text-[var(--color-slate-400)]">→</span>}
                </span>
              ))}
            </div>
            <p className="text-sm text-[var(--color-slate)] md:text-right">
              {L ? "공항에서는 입국장 지정 미팅 포인트에서 이름 피켓을 든 기사님을 만납니다." : "At the airport, meet your driver holding a name board at the designated arrivals meeting point."}
            </p>
          </div>
        </div>
      </section>

      {/* ═══ CERTO VERIFIED — trust UI / driver verification ═══ */}
      <section className="section">
        <div className="container-cd grid lg:grid-cols-[1fr_0.9fr] gap-12 lg:gap-16 items-center">
          <div>
            <p className="eyebrow">{L ? "신뢰" : "Trust"}</p>
            <h2 className="font-display text-[2.1rem] md:text-[2.7rem] mt-5">{L ? "모든 기사는 Certo Verified 입니다" : "Every driver is Certo Verified"}</h2>
            <p className="mt-6 text-[var(--color-slate)] leading-relaxed max-w-lg">
              {L ? "면허·보험·차량·운송 자격과 한국어 소통 가능 여부까지 관리자가 직접 확인한 기사만 배정됩니다. 아래는 고객에게 공개되는 기사 프로필 예시입니다." : "Only drivers whose license, insurance, vehicle, transport eligibility and Korean communication we've reviewed get assigned. Below is an example of the profile customers see."}
            </p>
            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              {(L
                ? ["운전면허 확인", "자동차·영업 보험 확인", "차량 서류·상태 확인", "운송 자격 확인", "한국어 소통 확인", "신원 확인"]
                : ["Driver license verified", "Vehicle & commercial insurance", "Vehicle documents & condition", "Transport eligibility", "Korean communication", "Identity verified"]
              ).map((x) => (
                <div key={x} className="flex items-center gap-2.5 text-sm">
                  <span className="grid place-items-center w-5 h-5 rounded-full bg-[var(--color-ink)] text-[var(--color-accent)]"><Check /></span>
                  {x}
                </div>
              ))}
            </div>
          </div>
          {/* Sample verified-driver profile card */}
          <div className="card p-6 max-w-sm mx-auto lg:mx-0 w-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-slate)]">{L ? "예시 프로필" : "Sample profile"}</span>
              <span className="chip bg-[var(--color-ink)] text-white border-[var(--color-ink)]"><Icon name="shield" size={12} /> Certo Verified</span>
            </div>
            <div className="mt-4 flex items-center gap-3.5">
              <span className="h-14 w-14 rounded-full grid place-items-center font-display text-xl text-white bg-[var(--color-graphite)]">D</span>
              <div>
                <div className="font-semibold text-lg leading-tight">Daniel Kim</div>
                <div className="text-sm text-[var(--color-slate)]">Paris, France</div>
              </div>
              <div className="ml-auto text-right">
                <div className="font-display text-xl">4.9</div>
                <div className="text-[11px] text-[var(--color-slate)]">★ · 37 {L ? "운행" : "rides"}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--color-line)] text-sm flex items-center gap-2 text-[var(--color-slate)]">
              <Icon name="car" size={16} className="text-[var(--color-ink)]" /> Mercedes-Benz E-Class · 3{L ? "인" : " pax"} · 3{L ? "짐" : " bags"}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["한국어 · Native", "English · Fluent", "Français"].map((c) => <span key={c} className="chip">{c}</span>)}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {(L ? [["면허", "확인"], ["보험", "확인"], ["차량", "확인"]] : [["License", "OK"], ["Insurance", "OK"], ["Vehicle", "OK"]]).map(([a, b]) => (
                <div key={a} className="rounded-lg bg-[var(--color-mist)] py-2">
                  <div className="text-[11px] text-[var(--color-slate)]">{a}</div>
                  <div className="text-[13px] font-semibold text-[#1f6b3f]">{b}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ REAL VERIFIED DRIVERS (only if present) ═══ */}
      {driverRows.length > 0 && (
        <section className="section pt-0">
          <div className="container-cd">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <h2 className="font-display text-2xl md:text-3xl">{L ? "지금 운행 중인 기사" : "Drivers on the network"}</h2>
              <Link href="/partners" className="text-sm font-semibold hover:underline">{L ? "기사로 합류 →" : "Become a driver →"}</Link>
            </div>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {driverRows.map((d) => {
                const car = d.vehicles[0];
                const langs = [
                  { l: L ? "한국어" : "Korean", v: LANG_LABEL[d.koreanLevel]?.[locale] },
                  { l: L ? "영어" : "English", v: LANG_LABEL[d.englishLevel]?.[locale] },
                ].filter((x) => x.v);
                return (
                  <div key={d.id} className="card lift p-5">
                    <div className="flex items-center gap-3">
                      <span className="h-11 w-11 rounded-full grid place-items-center font-display text-white bg-[var(--color-graphite)]">{d.contactName?.trim()?.[0] ?? "C"}</span>
                      <div>
                        <div className="font-semibold leading-tight">{d.contactName}</div>
                        <div className="text-xs text-[var(--color-slate)]">{d.city}, {d.country}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-sm">
                      <span>★</span><span className="font-semibold">{d.rating.toFixed(1)}</span>
                      <span className="text-xs text-[var(--color-slate)]">({d.ratingCount})</span>
                      <span className="ml-auto chip text-[11px]"><Icon name="shield" size={11} /> Verified</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {langs.map((x) => <span key={x.l} className="chip text-[11px]">{x.l} · {x.v}</span>)}
                    </div>
                    {car && (
                      <div className="mt-3 pt-3 border-t border-[var(--color-line)] text-xs text-[var(--color-slate)] flex items-center gap-2">
                        <Icon name="car" size={14} className="text-[var(--color-ink)]" />
                        {car.category}{car.makeModel && car.makeModel !== "—" ? ` · ${car.makeModel}` : ""}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ CITIES + starting prices ═══ */}
      <section className="section bg-[var(--color-mist)]">
        <div className="container-cd">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="eyebrow">{L ? "서비스 도시" : "Cities"}</p>
              <h2 className="font-display text-[2.1rem] md:text-[2.7rem] mt-5">{L ? "주요 글로벌 도시" : "Popular destinations"}</h2>
            </div>
            <Link href="/destinations" className="btn btn-outline text-sm">{L ? "전체 도시" : "All cities"}</Link>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cities.map((c) => (
              <Link key={c.name} href={`/destinations/${encodeURIComponent(c.slug)}`} className="group relative rounded-2xl overflow-hidden aspect-[4/5] flex flex-col justify-between p-5 text-white" style={photoBg(cityImage(c.slug), "linear-gradient(180deg, rgba(17,17,17,0.1) 0%, rgba(17,17,17,0.82) 82%)")}>
              <div className="text-[11px] font-semibold tracking-[0.14em] text-white/80">{c.codes}</div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-white/55">{c.country}</div>
                <div className="font-display text-2xl">{c.name}</div>
                <div className="mt-1 text-[13px] text-white/70 flex items-center gap-1.5">{L ? "공항 → 시내" : "Airport → city"} <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span></div>
              </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ POPULAR ROUTES — priced route list ═══ */}
      <section className="section">
        <div className="container-cd">
          <div className="max-w-xl">
            <p className="eyebrow">{L ? "인기 노선" : "Popular routes"}</p>
            <h2 className="font-display text-[2.1rem] md:text-[2.7rem] mt-5">{L ? "노선별 예상 요금" : "Sample fares by route"}</h2>
            <p className="mt-4 text-[var(--color-slate)]">{L ? "대표 노선의 시작 요금입니다. 차량·옵션·시간대에 따라 예약 시 정확한 정찰 요금이 확정됩니다." : "Starting fares for popular routes. Your exact fixed price is confirmed at booking, based on vehicle, options and time."}</p>
          </div>
          <div className="mt-10 rounded-2xl border border-[var(--color-line)] overflow-hidden bg-white divide-y divide-[var(--color-line)]">
            {routes.map((r) => (
              <Link key={r.code + r.city} href={`/destinations/${encodeURIComponent(r.slug)}`} className="flex items-center gap-4 md:gap-6 px-5 md:px-7 py-5 hover:bg-[var(--color-mist)] transition-colors">
                <span className="font-display text-lg w-14 shrink-0">{r.code}</span>
                <span className="flex items-center gap-2.5 text-sm md:text-base min-w-0">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-accent-strong)] shrink-0" />
                  <span className="font-medium truncate">{r.city}</span>
                  <span className="text-[var(--color-slate-400)]">→</span>
                  <span className="text-[var(--color-slate)] truncate">{r.to}</span>
                </span>
                <span className="ml-auto text-right shrink-0">
                  <span className="block text-[11px] text-[var(--color-slate)]">{L ? "부터" : "from"}</span>
                  <span className="font-display text-lg">{r.from}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHO IT'S FOR ═══ */}
      <section className="section bg-[var(--color-graphite)] text-white">
        <div className="container-cd">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60">
              <span className="w-4 h-px bg-white/50" />{L ? "이런 분께" : "Made for"}
            </div>
            <h2 className="font-display text-[2.1rem] md:text-[2.7rem] mt-4">{L ? "이럴 때, 체르토 드라이브" : "When Certo Drive fits"}</h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
            {(L ? [
              "해외 공항에서 택시 잡기가 불안한 여행객",
              "부모님·가족의 공항 픽업을 대신 예약하는 분",
              "어린 자녀와 함께 이동하는 가족",
              "캐리어와 짐이 많은 여행객",
              "현지 언어가 어려운 분",
              "안정적인 이동이 필요한 출장 비즈니스 고객",
              "골프·투어·행사로 하루 차량이 필요한 분",
              "여러 도시를 이동하는 장거리 여행객",
              "VIP 의전이 필요한 개인·기업 고객",
            ] : [
              "Travelers wary of hailing a taxi at a foreign airport",
              "Booking an airport pickup for parents or family",
              "Families traveling with young children",
              "Travelers with lots of luggage",
              "Anyone who finds the local language hard",
              "Business travelers who need reliable transfers",
              "Golf, tours and events needing a car for the day",
              "Long-distance trips across several cities",
              "Individuals or companies needing VIP protocol",
            ]).map((x, i) => (
              <div key={i} className="flex items-start gap-3 border-t border-white/12 pt-5">
                <span className="font-display text-sm text-[var(--color-accent)]">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-white/80 leading-relaxed">{x}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED REVIEW (real only) ═══ */}
      {reviewRows.length > 0 && (
        <section className="section">
          <div className="container-cd">
            <p className="eyebrow">{L ? "고객 후기" : "Reviews"}</p>
            <div className="mt-8 grid lg:grid-cols-[1.3fr_1fr] gap-8 items-stretch">
              {/* Featured */}
              <figure className="rounded-2xl border border-[var(--color-line)] bg-white p-8 md:p-10 flex flex-col">
                <div className="text-[var(--color-ink)] text-lg">★★★★★</div>
                <blockquote className="mt-5 font-display text-2xl md:text-[1.9rem] leading-snug">
                  “{reviewRows[0].comment}”
                </blockquote>
                <figcaption className="mt-auto pt-7 flex items-center gap-3 text-sm">
                  <span className="font-semibold">{reviewRows[0].authorName || (L ? "체르토 고객" : "Certo customer")}</span>
                  <span className="text-[var(--color-slate)]">· {reviewRows[0].booking.pickupCity}</span>
                  <span className="ml-auto chip"><Icon name="shield" size={12} /> {L ? "예약 인증" : "Verified booking"}</span>
                </figcaption>
              </figure>
              {/* Smaller */}
              <div className="grid gap-4">
                {reviewRows.slice(1, 3).map((r) => (
                  <figure key={r.id} className="rounded-2xl border border-[var(--color-line)] bg-white p-6 flex flex-col">
                    <div className="text-[var(--color-ink)] text-sm">{"★".repeat(r.rating)}</div>
                    <blockquote className="mt-3 text-[15px] leading-relaxed text-[var(--color-ink)] line-clamp-4">“{r.comment}”</blockquote>
                    <figcaption className="mt-3 text-xs text-[var(--color-slate)] flex items-center gap-2">
                      {r.authorName || (L ? "고객" : "Customer")} · {r.booking.pickupCity}
                      <span className="ml-auto chip text-[10px]">{L ? "예약 인증" : "Verified"}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ FAQ — categorized ═══ */}
      <section className="section bg-[var(--color-mist)]">
        <div className="container-cd grid lg:grid-cols-[0.7fr_1.3fr] gap-10 lg:gap-16">
          <div className="lg:sticky lg:top-24 self-start">
            <p className="eyebrow">FAQ</p>
            <h2 className="font-display text-[2.1rem] md:text-[2.7rem] mt-5">{L ? "예약 전에 궁금한 점" : "Before you book"}</h2>
            <p className="mt-4 text-[var(--color-slate)]">{L ? "더 궁금한 점은 언제든 고객센터로 문의하세요." : "Anything else — reach our support team anytime."}</p>
            <Link href="/support" className="btn btn-outline mt-6 text-sm">{L ? "고객센터" : "Support"}</Link>
          </div>
          <div className="space-y-8">
            {(L ? FAQ_KO : FAQ_EN).map((group) => (
              <div key={group.cat}>
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate)] mb-1">{group.cat}</h3>
                <div className="divide-y divide-[var(--color-line)] border-t border-[var(--color-line)]">
                  {group.items.map((f) => (
                    <details key={f.q} className="group py-4">
                      <summary className="flex items-start justify-between gap-4 cursor-pointer font-medium list-none">
                        <span>{f.q}</span>
                        <span className="text-[var(--color-slate)] transition-transform group-open:rotate-45 text-xl leading-none mt-0.5">+</span>
                      </summary>
                      <p className="mt-3 text-[15px] text-[var(--color-slate)] leading-relaxed">{f.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA (customer + driver) ═══ */}
      <section className="section pt-0">
        <div className="container-cd grid md:grid-cols-[1.4fr_1fr] gap-5">
          <div className="rounded-3xl bg-[var(--color-ink)] text-white p-10 md:p-14">
            <h2 className="font-display text-3xl md:text-[2.6rem]">{L ? "다음 이동, 지금 확정하세요" : "Confirm your next ride now"}</h2>
            <p className="mt-4 text-white/65 max-w-md">{L ? "요금을 먼저 확인하고, 검증된 한인 기사와 함께 이동하세요." : "See your price first, then travel with a verified Korean-speaking driver."}</p>
            <Link href="/#book" className="btn btn-gold mt-8">{t("nav.book")}</Link>
          </div>
          <div className="rounded-3xl border border-[var(--color-line)] bg-white p-10 md:p-14 flex flex-col">
            <h2 className="font-display text-2xl">{L ? "기사 파트너 모집" : "Drive with Certo"}</h2>
            <p className="mt-3 text-[var(--color-slate)] leading-relaxed">{L ? "한국인 여행객의 이동을 함께할 검증된 파트너 기사를 찾습니다. 배차·정산은 플랫폼이 관리합니다." : "We partner with verified Korean-speaking drivers. Certo manages dispatch and settlement."}</p>
            <Link href="/partners" className="btn btn-outline mt-auto pt-3 text-sm w-fit">{L ? "파트너 지원하기 →" : "Apply to drive →"}</Link>
          </div>
        </div>
      </section>

      {/* Fleet reference (compact, admin-owned data) */}
      <FleetStrip locale={locale} />

      <SiteFooter />
      <StickyMobileCTA locale={locale} />
    </>
  );
}

// Small vehicle-class reference — compact spec list, not gradient art cards.
function FleetStrip({ locale }: { locale: import("@/lib/i18n").Locale }) {
  const L = locale === "ko";
  return (
    <section className="border-t border-[var(--color-line)] bg-[var(--color-bg)]">
      <div className="container-cd py-12">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h3 className="font-display text-xl">{L ? "차량 클래스" : "Vehicle classes"}</h3>
          <span className="text-sm text-[var(--color-slate)]">{L ? "예약 시 선택" : "Choose at booking"}</span>
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-5">
          {VEHICLE_CATEGORIES.map((v) => {
            const m = VEHICLE_META[v];
            return (
              <div key={v} className="border-t border-[var(--color-line)] pt-3">
                <div className="font-semibold text-sm">{v}</div>
                <div className="text-xs text-[var(--color-slate)] mt-1">{m.blurb[locale]} · {m.pax} {L ? "인" : "pax"} · {m.luggage} {L ? "짐" : "bags"}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── FAQ content (categorized). Answers describe what the platform actually
//    does; unset commercial policies are described as "per policy", not invented.
const FAQ_KO = [
  {
    cat: "서비스",
    items: [
      { q: "Certo Drive는 어떤 서비스인가요?", a: "예약부터 도착까지 관리되는 이동 서비스입니다. 이동 정보를 입력하면 체르토가 예약을 확인하고, 검증된 한인·한국어 가능 기사와 차량을 배정합니다." },
      { q: "Uber(호출앱)와 어떤 차이가 있나요?", a: "우버는 현장에서 즉시 매칭되고 누가 올지 도착 전까지 알 수 없습니다. 체르토는 출발 전에 기사·차량이 확정되고, 요금도 예약 시 정해집니다. 사전 예약형 관리 서비스입니다." },
      { q: "그냥 한인택시 회사인가요?", a: "아닙니다. 체르토는 특정 기사 한 명이 아니라, 여러 검증된 파트너 기사와 협력하는 플랫폼입니다. 예약·결제·배차·고객지원을 체르토가 관리합니다." },
      { q: "기사님은 모두 한국인인가요?", a: "한인 또는 한국어가 가능한 기사와 협력합니다. 예약 시 한국어 가능 기사 지정을 선택할 수 있습니다." },
    ],
  },
  {
    cat: "예약 · 기사 배정",
    items: [
      { q: "예약하면 바로 기사 배정이 되나요?", a: "등록된 노선은 즉시 요금이 확정되며, 결제 후 체르토가 배차를 확정합니다. 그 외 지역은 기사·차량 가능 여부 확인 후 견적과 배차가 진행됩니다." },
      { q: "기사 정보는 언제 받나요?", a: "예약이 확정되면 운행 전에 기사 이름·사진·연락처와 차량 정보(차종·차량번호·사진), 미팅 방법을 전달드립니다. 결제 후에는 채팅으로 기사와 직접 소통할 수 있습니다." },
      { q: "예약이 확정되었는지 어떻게 확인하나요?", a: "확정 시 예약번호·픽업 장소·도착지·일시·차량·최종 요금이 담긴 확정 안내를 받습니다. 예약 조회 페이지에서도 상태를 확인할 수 있습니다." },
    ],
  },
  {
    cat: "요금",
    items: [
      { q: "요금은 언제 확정되나요?", a: "등록된 노선은 예약 시점에 정찰제로 즉시 확정됩니다. 그 외 지역은 견적으로 안내되며, 결제 전에 최종 금액을 확인하실 수 있습니다." },
      { q: "예약 요금 외에 현장 추가 비용이 있나요?", a: "표시된 정찰 요금에는 톨게이트·주차·기본 대기시간이 포함됩니다. 예약에 없던 추가 정차나 초과 대기 등 변경 사항은 별도로 안내됩니다." },
      { q: "팁을 줘야 하나요?", a: "팁은 필수가 아닙니다. 요금은 예약 시 확정된 금액으로 진행됩니다." },
    ],
  },
  {
    cat: "공항 픽업",
    items: [
      { q: "공항에서 기사님을 어디서 만나나요?", a: "입국장의 지정 미팅 포인트에서 이름 피켓을 든 기사님을 만납니다. 정확한 미팅 위치는 예약 확정 안내에 포함됩니다." },
      { q: "비행기가 지연되면 어떻게 되나요?", a: "항공편 번호로 도착 시간을 확인해 대기합니다. 지연에 따른 추가 대기는 정책에 따라 처리되며, 큰 변동은 고객센터가 함께 조율합니다." },
      { q: "입국 심사가 오래 걸리면요?", a: "공항 픽업에는 기본 무료 대기시간이 포함됩니다. 예상보다 지연될 경우 기사님과 채팅·연락으로 상황을 공유할 수 있습니다." },
      { q: "항공편이 취소되면 어떻게 하나요?", a: "가능한 한 빨리 고객센터로 알려주세요. 취소·변경은 취소·환불 규정에 따라 처리됩니다." },
    ],
  },
  {
    cat: "차량 · 짐",
    items: [
      { q: "짐이 많은데 괜찮나요?", a: "예약 시 승객 수와 짐 수량을 입력하면 그에 맞는 차량 클래스를 안내드립니다. 대형 캐리어가 많은 경우 밴·프리미엄 밴을 선택하세요." },
      { q: "카시트를 신청할 수 있나요?", a: "예약 옵션에서 카시트를 요청할 수 있습니다. 유아·어린이 동반 예약도 가능합니다." },
      { q: "원하는 차량을 지정할 수 있나요?", a: "차량 클래스(세단·밴·프리미엄·VIP 등)를 선택할 수 있습니다. 특정 차종이 필요하면 요청사항에 남겨주세요(지역·조건에 따라 제공)." },
    ],
  },
  {
    cat: "변경 · 취소 · 문제",
    items: [
      { q: "예약 변경이나 취소가 가능한가요?", a: "가능합니다. 변경·취소 및 환불은 취소·환불 규정에 따라 처리되며, 자세한 내용은 해당 페이지를 참고하세요." },
      { q: "기사님과 연락이 안 되거나 늦으면요?", a: "고객이 직접 해결하지 않습니다. 채팅으로 우선 연락하고, 문제가 지속되면 체르토 고객센터가 중간에서 직접 지원합니다." },
      { q: "고객센터는 어떻게 연락하나요?", a: "고객지원 페이지 또는 support@certodrive.com으로 문의하시면 한국어로 도와드립니다. 24시간 지원됩니다." },
    ],
  },
];

const FAQ_EN = [
  {
    cat: "Service",
    items: [
      { q: "What is Certo Drive?", a: "A managed ride service from booking to arrival. You enter your trip, Certo reviews it, and we assign a verified Korean-speaking driver and vehicle." },
      { q: "How is it different from Uber?", a: "Ride-hailing matches you on the spot and you don't know who's coming until they arrive. With Certo, the driver, vehicle and price are all set before departure. It's a pre-booked, managed service." },
      { q: "Is this just a Korean-taxi company?", a: "No. Certo works with many verified partner drivers, not a single driver. We manage booking, payment, dispatch and support." },
      { q: "Are all drivers Korean?", a: "We work with Korean and Korean-speaking drivers, and you can require a Korean-speaking driver at booking." },
    ],
  },
  {
    cat: "Booking & assignment",
    items: [
      { q: "Is a driver assigned immediately?", a: "Registered routes are priced instantly and dispatch is confirmed after payment. Other areas go through an availability check, then a quote and assignment." },
      { q: "When do I get driver details?", a: "Once confirmed, before the trip, you receive the driver's name, photo and contact, the vehicle details and plate, and how to meet — plus in-app chat after payment." },
      { q: "How do I know it's confirmed?", a: "You get a confirmation with booking number, pickup, destination, time, vehicle and final price, and can check status on the booking-lookup page." },
    ],
  },
  {
    cat: "Pricing",
    items: [
      { q: "When is my price fixed?", a: "Registered routes are fixed at booking. Other areas are quoted, and you always see the final amount before paying." },
      { q: "Any extra charges on the day?", a: "The fixed fare includes tolls, parking and base waiting time. Changes such as unplanned extra stops or extended waiting are advised separately." },
      { q: "Do I need to tip?", a: "Tipping isn't required — you pay the price fixed at booking." },
    ],
  },
  {
    cat: "Airport pickup",
    items: [
      { q: "Where do I meet the driver?", a: "At the designated arrivals meeting point, where the driver holds a name board. The exact spot is in your confirmation." },
      { q: "What if my flight is delayed?", a: "We track your flight and wait. Delay-related waiting is handled per policy, and support helps coordinate larger changes." },
      { q: "What if immigration takes a long time?", a: "Airport pickups include free base waiting time, and you can share your status with the driver via chat." },
      { q: "What if my flight is cancelled?", a: "Let support know as soon as possible. Cancellations and changes follow our cancellation policy." },
    ],
  },
  {
    cat: "Vehicle & luggage",
    items: [
      { q: "I have a lot of luggage — is that ok?", a: "Enter passengers and bags at booking and we'll match a suitable class. For many large cases, choose a van or premium van." },
      { q: "Can I request a child seat?", a: "Yes, request a child seat in the booking options. Bookings with infants and children are welcome." },
      { q: "Can I choose the vehicle?", a: "You choose a class (sedan, van, premium, VIP). For a specific model, add it to your notes (availability varies)." },
    ],
  },
  {
    cat: "Changes, cancellation & issues",
    items: [
      { q: "Can I change or cancel?", a: "Yes. Changes, cancellations and refunds follow our cancellation policy — see that page for details." },
      { q: "What if the driver is late or unreachable?", a: "You don't handle it alone. Use chat first, and if it persists, Certo support steps in directly." },
      { q: "How do I contact support?", a: "Use the support page or email support@certodrive.com for help in Korean, 24/7." },
    ],
  },
];
