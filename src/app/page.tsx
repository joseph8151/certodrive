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
    { icon: "arrival", href: "/booking/airport-pickup", t: L ? "공항 픽업·샌딩" : "Airport pickup & drop-off", d: L ? "입국장에서 피켓으로 맞이하고, 공항까지 정시에 모십니다." : "Met at arrivals with a name board; on-time rides to the airport." },
    { icon: "car", href: "/booking/intercity", t: L ? "한인 택시·시내 이동" : "Korean taxi · in-city", d: L ? "한국어가 통하는 기사와 도시 안에서 편하게 이동하세요." : "Get around the city with a driver who speaks your language." },
    { icon: "clock", href: "/booking/hourly", t: L ? "하루 종일 기사·차량 전세" : "Full-day driver + vehicle", d: L ? "관광·비즈니스·골프까지, 기사와 차량을 시간 단위로 전세." : "Sightseeing, business or golf — a chauffeur and car by the hour." },
  ];

  const values = [
    { icon: "shield", title: t("value.verified"), desc: t("value.verified.d") },
    { icon: "badge", title: t("value.confirmed"), desc: t("value.confirmed.d") },
    { icon: "tag", title: t("value.fixed"), desc: t("value.fixed.d") },
    { icon: "plane", title: t("value.flight"), desc: t("value.flight.d") },
    { icon: "board", title: t("value.meet"), desc: t("value.meet.d") },
    { icon: "chat", title: t("value.support"), desc: t("value.support.d") },
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
          </div>
          <div id="book" className="scroll-mt-24">
            <BookingWidget locale={locale} prefill={hasPrefill ? prefill : undefined} />
          </div>
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
              <Link key={p.t} href={p.href} className="card p-7 hover:card-shadow transition-shadow group">
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
              <div key={v.title} className="card p-7 hover:card-shadow transition-shadow">
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
                <div key={v} className="card overflow-hidden flex flex-col hover:card-shadow transition-shadow">
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
