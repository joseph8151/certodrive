import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BookingWidget from "@/components/BookingWidget";
import Testimonials, { type PublicReview } from "@/components/Testimonials";
import { getLocale } from "@/lib/locale";
import { makeT } from "@/lib/i18n";
import { prisma } from "@/lib/db";
import { VEHICLE_CATEGORIES, VEHICLE_META, POPULAR_CITIES } from "@/lib/constants";

export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const locale = await getLocale();
  const t = makeT(locale);
  const sp = await searchParams;

  // Prefill the booking widget from query params (used by rebook / favorites).
  const prefillKeys = ["serviceType", "pickupCountry", "pickupCity", "pickupLocation", "destination", "vehicleCategory"] as const;
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
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    authorName: r.authorName,
    city: r.booking.pickupCity,
    driverName: r.driverProfile?.contactName ?? null,
  }));

  const pillars = locale === "ko"
    ? [
        { icon: "🛬", t: "공항 픽업·샌딩", d: "입국장에서 피켓으로 맞이하고, 공항까지 정시에 모십니다.", href: "/booking/airport-pickup" },
        { icon: "🚕", t: "한인 택시·시내 이동", d: "한국어가 통하는 기사와 도시 안에서 편하게 이동하세요.", href: "/booking/intercity" },
        { icon: "🕐", t: "하루 종일 기사·차량 전세", d: "관광·비즈니스·골프까지, 기사와 차량을 시간 단위로 전세.", href: "/booking/hourly" },
      ]
    : [
        { icon: "🛬", t: "Airport pickup & drop-off", d: "Met at arrivals with a name board; on-time rides to the airport.", href: "/booking/airport-pickup" },
        { icon: "🚕", t: "Korean taxi · in-city rides", d: "Get around the city with a driver who speaks your language.", href: "/booking/intercity" },
        { icon: "🕐", t: "Full-day driver + vehicle", d: "Sightseeing, business or golf — hire a chauffeur and car by the hour.", href: "/booking/hourly" },
      ];

  const values = [
    { icon: "🛡️", title: t("value.verified"), desc: t("value.verified.d") },
    { icon: "✓", title: t("value.confirmed"), desc: t("value.confirmed.d") },
    { icon: "₩", title: t("value.fixed"), desc: t("value.fixed.d") },
    { icon: "✈", title: t("value.flight"), desc: t("value.flight.d") },
    { icon: "🪧", title: t("value.meet"), desc: t("value.meet.d") },
    { icon: "💬", title: t("value.support"), desc: t("value.support.d") },
  ];

  const steps = [
    { n: "01", title: t("how.1"), desc: t("how.1d") },
    { n: "02", title: t("how.2"), desc: t("how.2d") },
    { n: "03", title: t("how.3"), desc: t("how.3d") },
    { n: "04", title: t("how.4"), desc: t("how.4d") },
  ];

  return (
    <>
      <SiteHeader />

      {/* Hero + booking */}
      <section className="hero-gradient text-white">
        <div className="container-cd py-12 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="eyebrow text-[var(--color-gold)]">CERTO DRIVE</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-[3.4rem] leading-[1.1] font-bold mt-4 whitespace-pre-line">
              {t("hero.title")}
            </h1>
            <p className="mt-5 text-white/75 text-lg max-w-xl">{t("hero.subtitle")}</p>
            <div className="mt-7 flex flex-wrap gap-4 text-sm text-white/70">
              <span className="flex items-center gap-2"><span className="text-[var(--color-gold)]">✓</span> {locale === "ko" ? "공항 픽업·샌딩" : "Airport pickup & drop-off"}</span>
              <span className="flex items-center gap-2"><span className="text-[var(--color-gold)]">✓</span> {locale === "ko" ? "한인 택시·하루 종일 전세" : "Korean taxi & full-day hire"}</span>
              <span className="flex items-center gap-2"><span className="text-[var(--color-gold)]">✓</span> {locale === "ko" ? "24시간 한국어 지원" : "24/7 Korean support"}</span>
            </div>
          </div>

          <div id="book" className="scroll-mt-20">
            <BookingWidget locale={locale} prefill={hasPrefill ? prefill : undefined} />
          </div>
        </div>
      </section>

      {/* Service pillars */}
      <section className="section">
        <div className="container-cd">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">{locale === "ko" ? "서비스" : "Services"}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">
              {locale === "ko" ? "공항부터 하루 종일까지, 한 번에" : "From the airport to your whole day"}
            </h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {pillars.map((p) => (
              <Link key={p.t} href={p.href} className="card p-7 hover:card-shadow transition-shadow group">
                <div className="text-3xl">{p.icon}</div>
                <h3 className="mt-4 font-semibold text-lg group-hover:text-[var(--color-gold-dark)]">{p.t}</h3>
                <p className="mt-2 text-sm text-[var(--color-slate)] leading-relaxed">{p.d}</p>
                <span className="mt-4 inline-block text-sm font-medium text-[var(--color-gold-dark)]">
                  {locale === "ko" ? "예약하기 →" : "Book now →"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="section">
        <div className="container-cd">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">{t("value.title")}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{t("hero.title").split("\n")[0]}</h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v) => (
              <div key={v.title} className="card p-6 hover:card-shadow transition-shadow">
                <div className="h-11 w-11 rounded-lg bg-[var(--color-mist)] flex items-center justify-center text-xl">{v.icon}</div>
                <h3 className="mt-4 font-semibold text-lg">{v.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-slate)] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section bg-[var(--color-mist)]">
        <div className="container-cd">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">{t("how.title")}</p>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s) => (
              <div key={s.n} className="relative">
                <div className="font-display text-4xl font-bold text-[var(--color-gold)]">{s.n}</div>
                <h3 className="mt-3 font-semibold text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-slate)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet */}
      <section className="section">
        <div className="container-cd">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">{t("fleet.title")}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">
              {locale === "ko" ? "여행 목적에 맞는 차량" : "The right vehicle for every journey"}
            </h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VEHICLE_CATEGORIES.map((v) => {
              const m = VEHICLE_META[v];
              return (
                <div key={v} className="card p-5 flex flex-col">
                  <div className="aspect-[16/10] rounded-lg bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-ink)] flex items-center justify-center text-white/30 text-4xl">
                    🚘
                  </div>
                  <h3 className="mt-4 font-semibold">{v}</h3>
                  <p className="text-sm text-[var(--color-slate)] mt-1">{m.blurb[locale]}</p>
                  <div className="mt-3 text-xs text-[var(--color-slate)] flex gap-3">
                    <span>👤 {m.pax} {t("fleet.pax")}</span>
                    <span>🧳 {m.luggage} {t("fleet.bags")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="section bg-[var(--color-mist)]">
        <div className="container-cd">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="eyebrow">{t("nav.cities")}</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">
                {locale === "ko" ? "전 세계 주요 도시" : "Major cities worldwide"}
              </h2>
            </div>
            <Link href="/destinations" className="btn btn-outline text-sm">
              {locale === "ko" ? "전체 보기" : "View all"}
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {POPULAR_CITIES[locale].map((c) => (
              <Link
                key={c.city}
                href={`/destinations/${encodeURIComponent(c.city)}`}
                className="card p-5 hover:card-shadow transition-shadow group"
              >
                <div className="text-xs text-[var(--color-slate)]">{c.country}</div>
                <div className="font-display text-xl font-bold mt-1 group-hover:text-[var(--color-gold-dark)]">{c.city}</div>
                <div className="text-xs text-[var(--color-slate)] mt-2">{c.airports.join(" · ")}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials reviews={reviews} locale={locale} />

      {/* CTA */}
      <section className="section">
        <div className="container-cd">
          <div className="hero-gradient rounded-2xl text-white p-10 md:p-14 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold">{t("cta.title")}</h2>
            <p className="mt-3 text-white/75">{t("cta.sub")}</p>
            <Link href="/#book" className="btn btn-gold mt-7 inline-flex">{t("nav.book")}</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
