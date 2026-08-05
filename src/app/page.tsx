import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BookingWidget from "@/components/BookingWidget";
import Testimonials, { type PublicReview } from "@/components/Testimonials";
import Icon from "@/components/Icon";
import CarArt from "@/components/CarArt";
import { getLocale } from "@/lib/locale";
import { makeT } from "@/lib/i18n";
import { prisma } from "@/lib/db";
import { VEHICLE_CATEGORIES, VEHICLE_META, POPULAR_CITIES } from "@/lib/constants";
import { IMG, cityImage } from "@/lib/images";

function carType(v: string): "sedan" | "van" | "minibus" {
  if (v === "Minibus") return "minibus";
  if (v.includes("Van")) return "van";
  return "sedan";
}

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

  const reviewRows = await prisma.review.findMany({
    where: { rating: { gte: 4 }, comment: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { booking: { select: { pickupCity: true } }, driverProfile: { select: { contactName: true } } },
  });
  const reviews: PublicReview[] = reviewRows.map((r) => ({
    id: r.id, rating: r.rating, comment: r.comment, authorName: r.authorName,
    city: r.booking.pickupCity, driverName: r.driverProfile?.contactName ?? null,
  }));

  const pillars = [
    {
      icon: "arrival", href: "/booking/airport-pickup",
      t: L ? "공항 픽업·샌딩" : "Airport pickup & drop-off",
      d: L
        ? "낯선 공항, 긴 비행 뒤 가장 반가운 건 이름이 적힌 피켓입니다. 검증된 한인 기사가 입국장에서 기다렸다가 짐을 함께 옮기고, 예약하신 차량으로 목적지까지 모십니다. 항공편은 자동으로 확인되어 지연되어도 추가 요금 없이 대기하며, 요금에는 통행료와 공항 주차비까지 포함됩니다."
        : "After a long flight, nothing beats seeing your name on a board. A verified Korean driver waits at arrivals, helps with your bags, and takes you door to door. We track your flight automatically — delays mean no extra charge — and the fare already covers tolls and airport parking.",
    },
    {
      icon: "car", href: "/booking/intercity",
      t: L ? "한인 택시·시내 이동" : "Korean taxi · in-city",
      d: L
        ? "언어 때문에 목적지를 설명하느라 진땀 빼는 일은 이제 없습니다. 한국어가 완벽하게 통하는 기사와 함께 시내 어디든 편하게 이동하고, 맛집이나 동선까지 현지 팁을 얻으세요. 미터기 바가지 걱정 없이 예약 시 요금이 확정되어 마음이 편합니다."
        : "No more struggling to explain where you're going. Ride anywhere in the city with a driver who speaks fluent Korean, and pick up local tips on food and routes along the way. The fare is fixed when you book — no meter surprises, no haggling.",
    },
    {
      icon: "clock", href: "/booking/hourly",
      t: L ? "하루 종일 기사·차량 전세" : "Full-day driver + vehicle",
      d: L
        ? "관광, 비즈니스 미팅, 골프 라운딩, 웨딩 촬영까지 — 하루 일정 전체를 기사와 차량이 함께합니다. 여러 목적지를 자유롭게 돌고, 필요할 때 대기하며, 다음 장소로 매끄럽게 이동하세요. 시간 단위로 예약하고, 일정은 그날그날 유연하게 조정할 수 있습니다."
        : "Sightseeing, business meetings, a round of golf, a wedding shoot — one chauffeur and car for the whole day. Roam between stops freely, keep the car waiting when you need it, and glide to the next place. Booked by the hour, with an itinerary you can adjust on the day.",
    },
  ];

  const values = [
    { icon: "shield", title: L ? "검증된 한인 기사" : "Verified Korean drivers", desc: L ? "운전면허, 영업·보험 서류, 신원 확인을 모두 통과한 기사만 배정됩니다. 한국어 가능 수준도 직접 검증해 낯선 나라에서도 믿고 맡길 수 있습니다." : "Only drivers who pass license, insurance and identity checks are assigned — and we verify their Korean level ourselves, so you can trust every ride abroad." },
    { icon: "badge", title: L ? "관리자가 확인하는 배차" : "Human-confirmed dispatch", desc: L ? "자동 매칭이 아니라, 담당자가 요청과 기사를 직접 확인해 배정합니다. 문제가 생기면 체르토 드라이브가 중간에서 책임지고 대응합니다." : "Not blind auto-matching — a real coordinator reviews each request and driver. If anything goes wrong, Certo Drive steps in and takes responsibility." },
    { icon: "tag", title: L ? "정찰제 투명 요금" : "Fixed, transparent fares", desc: L ? "예약하는 순간 최종 금액이 확정됩니다. 등록된 노선은 즉시 가격이 나오고, 통행료·주차·대기까지 포함해 도착 후 추가 청구가 없습니다." : "The final price is locked the moment you book. Registered routes price instantly, with tolls, parking and waiting included — never a surprise charge on arrival." },
    { icon: "plane", title: L ? "항공편 실시간 확인" : "Live flight tracking", desc: L ? "입국 항공편을 자동으로 모니터링해 지연·조기 도착에 맞춰 기사님이 대기합니다. 비행이 늦어져도 추가 요금 없이 여유롭게 기다립니다." : "We monitor your inbound flight and adjust pickup for delays or early landings. Even a late arrival means the driver waits — at no extra cost." },
    { icon: "board", title: L ? "입국장 미팅·피켓" : "Meet & greet service", desc: L ? "복잡한 입국장에서 헤맬 필요 없이, 성함이 적힌 피켓을 든 기사님을 바로 찾을 수 있습니다. 연락처도 미리 공유되어 안심입니다." : "No wandering a crowded arrivals hall — find your driver instantly by the name board, with contact details shared in advance." },
    { icon: "chat", title: L ? "24시간 한국어 지원" : "24/7 Korean support", desc: L ? "예약 전 문의부터 이동 중 변경까지, 한국어로 언제든 도와드립니다. 시차 걱정 없이 필요한 순간에 바로 연락하세요." : "From pre-booking questions to mid-trip changes, we help in Korean around the clock — reach us the moment you need us, no time-zone worries." },
  ];

  const steps = [
    { n: "01", title: t("how.1"), desc: t("how.1d") },
    { n: "02", title: t("how.2"), desc: t("how.2d") },
    { n: "03", title: t("how.3"), desc: t("how.3d") },
    { n: "04", title: t("how.4"), desc: t("how.4d") },
  ];

  const photoBg = (url: string, overlay: string) => ({
    backgroundColor: "var(--color-navy)",
    backgroundImage: `${overlay}, url(${url})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  });

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="relative text-white overflow-hidden" style={{ backgroundColor: "var(--color-navy)" }}>
        <div
          className="absolute inset-0"
          style={photoBg(IMG.hero, "linear-gradient(105deg, rgba(11,17,28,0.94) 0%, rgba(13,21,37,0.80) 42%, rgba(13,21,37,0.50) 100%)")}
        />
        <div className="container-cd relative py-14 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="eyebrow text-[var(--color-gold)]">CERTO DRIVE</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.08] font-bold mt-4 whitespace-pre-line">
              {t("hero.title")}
            </h1>
            <p className="mt-5 text-white/80 text-lg max-w-xl">{t("hero.subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75">
              {[L ? "공항 픽업·샌딩" : "Airport pickup & drop-off", L ? "한인 택시·하루 종일 전세" : "Korean taxi & full-day hire", L ? "24시간 한국어 지원" : "24/7 Korean support"].map((x) => (
                <span key={x} className="flex items-center gap-2"><Icon name="badge" size={16} className="text-[var(--color-gold)]" /> {x}</span>
              ))}
            </div>
            {/* Social-proof glass chip */}
            <div className="mt-8 inline-flex items-center gap-4 glass rounded-full pl-4 pr-5 py-2.5">
              <div className="flex -space-x-2">
                {[IMG.meet, IMG.family, IMG.vipBand].map((src) => (
                  <span key={src} className="h-8 w-8 rounded-full ring-2 ring-white/70 bg-cover bg-center" style={{ backgroundImage: `url(${src})` }} />
                ))}
              </div>
              <div className="text-sm leading-tight">
                <div className="font-semibold text-[var(--color-gold)]">★★★★★ 4.9/5</div>
                <div className="text-white/70 text-xs">{L ? "전 세계 여행자들이 신뢰합니다" : "Trusted by travelers worldwide"}</div>
              </div>
            </div>
          </div>
          <div id="book" className="scroll-mt-24">
            <BookingWidget locale={locale} prefill={hasPrefill ? prefill : undefined} />
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-b border-[var(--color-line)] bg-white">
        <div className="container-cd py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { n: "40+", l: L ? "서비스 도시" : "Cities served" },
            { n: "100%", l: L ? "검증된 한인 기사" : "Verified Korean drivers" },
            { n: "4.9★", l: L ? "평균 만족도" : "Average rating" },
            { n: "24/7", l: L ? "한국어 지원" : "Korean support" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-3xl md:text-4xl font-bold text-[var(--color-navy)]">{s.n}</div>
              <div className="mt-1 text-xs md:text-sm text-[var(--color-slate)]">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Service pillars */}
      <section className="section">
        <div className="container-cd">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">{L ? "서비스" : "Services"}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{L ? "공항부터 하루 종일까지, 한 번에" : "From the airport to your whole day"}</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {pillars.map((p) => (
              <Link key={p.t} href={p.href} className="card lift p-7 hover:card-shadow transition-shadow group">
                <div className="h-12 w-12 rounded-full border border-[var(--color-gold)]/40 text-[var(--color-gold-dark)] flex items-center justify-center">
                  <Icon name={p.icon} size={22} />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold group-hover:text-[var(--color-gold-dark)]">{p.t}</h3>
                <p className="mt-2 text-sm text-[var(--color-slate)] leading-relaxed">{p.d}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-[var(--color-gold-dark)]">{L ? "예약하기 →" : "Book now →"}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="section bg-[var(--color-mist)]">
        <div className="container-cd">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">{t("value.title")}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{L ? "믿고 맡기는 이유" : "Why travelers trust us"}</h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v) => (
              <div key={v.title} className="card lift p-7 hover:card-shadow transition-shadow">
                <div className="h-12 w-12 rounded-full bg-[var(--color-navy)] text-[var(--color-gold)] flex items-center justify-center">
                  <Icon name={v.icon} size={22} />
                </div>
                <h3 className="mt-4 font-semibold text-lg">{v.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-slate)] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="section">
        <div className="container-cd">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">{L ? "이럴 때 이용하세요" : "Made for"}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{L ? "여행 유형에 딱 맞는 이동" : "The right ride for your trip"}</h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { img: IMG.family, t: L ? "가족 여행" : "Family trips", d: L ? "아이 카시트, 넉넉한 짐 공간, 안전한 한인 기사와 함께 온 가족이 편안하게." : "Child seats, luggage space and a trusted Korean driver for the whole family." },
              { img: IMG.vipBand, t: L ? "비즈니스 출장" : "Business travel", d: L ? "정시 도착과 조용한 이동. 공항 미팅부터 미팅 장소까지 매끄럽게." : "On-time, quiet rides — from airport meet to your meeting." },
              { img: IMG.meet, t: L ? "허니문·기념 여행" : "Honeymoon & special trips", d: L ? "프리미엄 차량으로 특별한 날을 더 특별하게 모십니다." : "A premium vehicle to make special days even more memorable." },
              { img: IMG.reviews, t: L ? "골프·장거리" : "Golf & long-haul", d: L ? "골프백과 장거리 이동도 여유롭게. 하루 종일 전세도 가능." : "Golf bags and long distances handled — full-day hire available." },
              { img: IMG.airport, t: L ? "효도 관광" : "Parents & seniors", d: L ? "부모님도 언어 걱정 없이. 문 앞까지 세심하게 모십니다." : "No language worries for parents — door-to-door care." },
              { img: cityImage(L ? "서울" : "Seoul"), t: L ? "유학생·장기 체류" : "Students & long stays", d: L ? "입국·이사·정착까지, 든든한 한인 기사가 도와드립니다." : "Arrivals, moving and settling in — a Korean driver who helps." },
            ].map((u) => (
              <div key={u.t} className="card lift overflow-hidden hover:card-shadow transition-shadow">
                <div className="aspect-[16/9]" style={photoBg(u.img, "linear-gradient(180deg, rgba(11,17,28,0.08) 0%, rgba(11,17,28,0.35) 100%)")} />
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold">{u.t}</h3>
                  <p className="mt-2 text-sm text-[var(--color-slate)] leading-relaxed">{u.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why a Korean driver */}
      <section className="section bg-[var(--color-mist)]">
        <div className="container-cd">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">{L ? "왜 한인 기사인가" : "Why a Korean driver"}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{L ? "낯선 도시, 언어 걱정 없이" : "A new city, without the language barrier"}</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { icon: "chat", t: L ? "완벽한 한국어 소통" : "Fluent Korean", d: L ? "목적지·요청사항을 한국어로 편하게. 오해 없는 이동." : "Explain destinations and requests in Korean — no misunderstandings." },
              { icon: "shield", t: L ? "검증된 신원과 안전" : "Vetted & safe", d: L ? "면허·보험·신원 확인을 마친 기사만 배정됩니다." : "Only drivers with verified license, insurance and identity." },
              { icon: "tag", t: L ? "투명한 사전 요금" : "Transparent fares", d: L ? "현지 택시 바가지 걱정 없이 예약 시 금액 확정." : "No taxi surprises — the price is fixed when you book." },
            ].map((x) => (
              <div key={x.t} className="card lift p-7">
                <div className="h-12 w-12 rounded-full bg-[var(--color-navy)] text-[var(--color-gold)] flex items-center justify-center">
                  <Icon name={x.icon} size={22} />
                </div>
                <h3 className="mt-4 font-semibold text-lg">{x.t}</h3>
                <p className="mt-2 text-sm text-[var(--color-slate)] leading-relaxed">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial band */}
      <section className="relative text-white" style={{ backgroundColor: "var(--color-navy)" }}>
        <div className="absolute inset-0" style={photoBg(IMG.editorial, "linear-gradient(90deg, rgba(11,17,28,0.92) 0%, rgba(13,21,37,0.72) 55%, rgba(13,21,37,0.45) 100%)")} />
        <div className="container-cd relative py-20 md:py-28">
          <div className="max-w-xl">
            <p className="eyebrow text-[var(--color-gold)]">{L ? "체르토 드라이브" : "The Certo standard"}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-3 leading-tight">
              {L ? "낯선 도시에서도, 한국어로 통하는 품격 있는 이동" : "Effortless, dignified travel — in your own language"}
            </h2>
            <p className="mt-4 text-white/75 leading-relaxed">
              {L ? "검증된 한인·한국어 가능 기사가 공항에서 맞이하고, 문제가 생기면 체르토 드라이브가 중간에서 직접 대응합니다. 가족여행부터 기업 의전까지." : "A verified Korean-speaking chauffeur meets you at the airport, and if anything goes wrong, Certo Drive steps in directly — from family trips to executive protocol."}
            </p>
            <Link href="/#book" className="btn btn-gold mt-7 inline-flex">{t("nav.book")}</Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container-cd">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">{t("how.title")}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{L ? "예약부터 도착까지" : "Booking to arrival"}</h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.n} className="relative">
                <div className="font-display text-5xl font-bold text-[var(--color-gold)]/90">{s.n}</div>
                <h3 className="mt-3 font-semibold text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-slate)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet */}
      <section className="section bg-[var(--color-mist)]">
        <div className="container-cd">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">{t("fleet.title")}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{L ? "여행 목적에 맞는 차량" : "The right vehicle for every journey"}</h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VEHICLE_CATEGORIES.map((v) => {
              const m = VEHICLE_META[v];
              return (
                <div key={v} className="card lift overflow-hidden flex flex-col hover:card-shadow transition-shadow">
                  <div className="aspect-[16/10] bg-gradient-to-br from-[#1d2c48] to-[var(--color-ink)] flex items-center justify-center px-4">
                    <CarArt type={carType(v)} className="w-full max-w-[220px]" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold">{v}</h3>
                    <p className="text-sm text-[var(--color-slate)] mt-1">{m.blurb[locale]}</p>
                    <div className="mt-3 text-xs text-[var(--color-slate)] flex gap-4 border-t border-[var(--color-line)] pt-3">
                      <span>{m.pax} {t("fleet.pax")}</span>
                      <span>{m.luggage} {t("fleet.bags")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Destinations — photo cards */}
      <section className="section">
        <div className="container-cd">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="eyebrow">{t("nav.cities")}</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{L ? "전 세계 주요 도시" : "Major cities worldwide"}</h2>
            </div>
            <Link href="/destinations" className="btn btn-outline text-sm">{L ? "전체 보기" : "View all"}</Link>
          </div>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {POPULAR_CITIES[locale].map((c) => (
              <Link
                key={c.city}
                href={`/destinations/${encodeURIComponent(c.city)}`}
                className="relative rounded-2xl overflow-hidden aspect-[4/5] flex flex-col justify-end p-5 text-white group"
                style={photoBg(cityImage(c.city), "linear-gradient(180deg, rgba(12,18,30,0.10) 0%, rgba(11,17,28,0.85) 78%)")}
              >
                <div className="text-[11px] uppercase tracking-wide text-white/70">{c.country}</div>
                <div className="font-display text-2xl font-bold leading-tight">{c.city}</div>
                <div className="text-[11px] text-white/65 mt-1">{c.airports.join(" · ")}</div>
                <span className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-gold)]">
                  <Icon name="arrival" size={20} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials reviews={reviews} locale={locale} />

      {/* FAQ */}
      <section className="section bg-[var(--color-mist)]">
        <div className="container-cd max-w-3xl">
          <div className="text-center">
            <p className="eyebrow">FAQ</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{L ? "예약 전에 궁금한 점" : "Before you book"}</h2>
          </div>
          <div className="mt-10 divide-y divide-[var(--color-line)] card px-6">
            {(L
              ? [
                  { q: "요금은 어떻게 결정되나요?", a: "등록된 노선은 예약 시 정찰제로 즉시 확정됩니다. 등록되지 않은 노선은 견적 요청 후 기사 공급가를 바탕으로 최종 금액을 안내드립니다. 어느 경우든 결제 전에 금액을 확인하실 수 있습니다." },
                  { q: "정말 한국어가 되는 기사인가요?", a: "네. 모든 기사는 한국어 가능 수준을 검증받으며, 대부분 한인 또는 한국어 원어민 수준입니다. 예약 시 한국어 기사 지정을 선택할 수 있습니다." },
                  { q: "공항에서 어떻게 만나나요?", a: "공항 픽업은 입국장에서 성함이 적힌 피켓을 들고 기다립니다. 기사님 연락처는 사전에 공유됩니다." },
                  { q: "결제와 취소는 어떻게 하나요?", a: "카드로 안전하게 사전 결제하며, 취소·환불 규정에 따라 처리됩니다. 자세한 내용은 취소·환불 규정 페이지를 참고하세요." },
                  { q: "아이 카시트나 특별 요청도 되나요?", a: "카시트, 추가 정차, 짐 많은 이동 등 대부분의 요청이 가능합니다. 예약 시 요청사항에 남겨주세요." },
                ]
              : [
                  { q: "How is the price decided?", a: "Registered routes are fixed instantly at booking. For other routes we send a quote based on the driver's supply price. Either way you see the amount before paying." },
                  { q: "Are the drivers really Korean-speaking?", a: "Yes. Every driver's Korean level is verified, and most are Korean or native-level speakers. You can require a Korean driver when booking." },
                  { q: "How do I meet the driver at the airport?", a: "For airport pickups, your driver waits at arrivals with a name board, and contact details are shared in advance." },
                  { q: "How do payment and cancellation work?", a: "You prepay securely by card, and refunds follow our cancellation policy — see the cancellation page for details." },
                  { q: "Can I request a child seat or special stops?", a: "Child seats, extra stops and luggage-heavy trips are usually fine — just add them to your booking notes." },
                ]
            ).map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex items-center justify-between cursor-pointer font-semibold list-none">
                  {f.q}
                  <span className="text-[var(--color-gold-dark)] transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-[var(--color-slate)] leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section pt-0">
        <div className="container-cd">
          <div className="hero-gradient rounded-3xl text-white p-10 md:p-16 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold">{t("cta.title")}</h2>
            <p className="mt-3 text-white/75">{t("cta.sub")}</p>
            <Link href="/#book" className="btn btn-gold mt-8 inline-flex">{t("nav.book")}</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
