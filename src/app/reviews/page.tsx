import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/Icon";
import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import { IMG } from "@/lib/images";

export const metadata: Metadata = {
  title: "고객 후기",
  description: "Certo Drive를 이용한 여행자들의 실제 후기. 검증된 한인·한국어 기사와 함께한 공항 픽업·전세 경험.",
};

function Stars({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span className={`text-[var(--color-gold)] ${className}`}>
      {"★".repeat(n)}<span className="text-[var(--color-line)]">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export default async function ReviewsPage() {
  const locale = await getLocale();
  const L = locale === "ko";

  const [reviews, agg] = await Promise.all([
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 60,
      include: { booking: { select: { pickupCity: true, pickupCountry: true, serviceType: true } }, driverProfile: { select: { contactName: true } } },
    }),
    prisma.review.aggregate({ _avg: { rating: true }, _count: true }),
  ]);

  const avg = agg._avg.rating ?? 0;
  const total = agg._count;
  const dist = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }));
  const withComment = reviews.filter((r) => r.comment);

  const SERVICE_LABEL: Record<string, { ko: string; en: string }> = {
    AIRPORT_PICKUP: { ko: "공항 픽업", en: "Airport pickup" },
    AIRPORT_DROPOFF: { ko: "공항 샌딩", en: "Airport drop-off" },
    INTERCITY: { ko: "도시 간 이동", en: "Intercity" },
    HOURLY: { ko: "시간제", en: "Hourly" },
    VIP: { ko: "VIP 의전", en: "VIP" },
  };

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="relative text-white overflow-hidden" style={{ backgroundColor: "var(--color-navy)" }}>
        <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(105deg, rgba(30,27,22,0.92), rgba(41,37,30,0.55)), url(${IMG.reviews})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="container-cd relative py-16 md:py-20">
          <p className="eyebrow text-[var(--color-gold)]">{L ? "고객 후기" : "Reviews"}</p>
          <h1 className="font-display text-2xl md:text-[2rem] font-bold mt-3 max-w-2xl">
            {L ? "여행자들이 남긴 진짜 후기" : "Real stories from our travelers"}
          </h1>
          {total > 0 && (
            <div className="mt-6 flex items-center gap-4">
              <span className="font-display text-5xl font-bold">{avg.toFixed(1)}</span>
              <div>
                <Stars n={Math.round(avg)} className="text-2xl" />
                <div className="text-sm text-white/70 mt-1">{L ? `${total}개의 후기` : `${total} reviews`}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust band */}
      <section className="border-b border-[var(--color-line)] bg-white">
        <div className="container-cd py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "shield", t: L ? "검증된 후기만" : "Verified only", d: L ? "실제 완료된 운행 고객만 작성" : "Only completed-trip customers" },
            { icon: "badge", t: L ? "검증 한인 기사" : "Verified drivers", d: L ? "면허·보험·신원 확인 완료" : "License, insurance, ID checked" },
            { icon: "globe", t: L ? "전 세계 도시" : "Cities worldwide", d: L ? "서울·파리·도쿄·뉴욕 등" : "Seoul, Paris, Tokyo, NYC…" },
            { icon: "chat", t: L ? "24시간 한국어" : "24/7 Korean", d: L ? "언제든 한국어로 지원" : "Support anytime, in Korean" },
          ].map((x) => (
            <div key={x.t} className="flex items-start gap-3">
              <span className="shrink-0 h-10 w-10 rounded-full bg-[var(--color-navy)] text-[var(--color-gold)] grid place-items-center"><Icon name={x.icon} size={19} /></span>
              <div><div className="font-semibold text-sm">{x.t}</div><div className="text-xs text-[var(--color-slate)] mt-0.5">{x.d}</div></div>
            </div>
          ))}
        </div>
      </section>

      <main className="container-cd py-12 md:py-16">
        {total === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--color-slate)]">{L ? "아직 후기가 없습니다. 첫 이용의 주인공이 되어보세요." : "No reviews yet — be the first to travel with us."}</p>
            <Link href="/#book" className="btn btn-primary mt-5 inline-flex">{L ? "예약하기" : "Book now"}</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Rating breakdown */}
            <aside className="lg:col-span-1">
              <div className="card p-6 lg:sticky lg:top-24">
                <h2 className="font-semibold mb-4">{L ? "평점 분포" : "Rating breakdown"}</h2>
                <div className="grid gap-2">
                  {dist.map((d) => (
                    <div key={d.star} className="flex items-center gap-2 text-sm">
                      <span className="w-6 text-[var(--color-slate)]">{d.star}★</span>
                      <div className="flex-1 h-2 rounded-full bg-[var(--color-mist)] overflow-hidden">
                        <div className="h-full rounded-full bg-[var(--color-gold)]" style={{ width: `${total ? (d.count / reviews.length) * 100 : 0}%` }} />
                      </div>
                      <span className="w-6 text-right text-[var(--color-slate)]">{d.count}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-5 border-t border-[var(--color-line)] text-sm text-[var(--color-slate)] flex items-start gap-2">
                  <Icon name="shield" size={18} className="text-[var(--color-gold-dark)] shrink-0 mt-0.5" />
                  {L ? "모든 후기는 실제 완료된 운행 고객만 작성할 수 있습니다." : "Only customers with a completed trip can leave a review."}
                </div>
              </div>
            </aside>

            {/* Review cards */}
            <div className="lg:col-span-3 grid sm:grid-cols-2 gap-5">
              {withComment.map((r) => (
                <figure key={r.id} className="card lift p-6 flex flex-col">
                  <div className="flex items-center justify-between">
                    <Stars n={r.rating} />
                    <span className="text-xs text-[var(--color-slate)]">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <blockquote className="mt-3 text-[15px] leading-relaxed flex-1">“{r.comment}”</blockquote>
                  <figcaption className="mt-4 pt-4 border-t border-[var(--color-line)] text-sm">
                    <span className="font-medium">{r.authorName ?? (L ? "고객" : "Traveler")}</span>
                    <span className="text-[var(--color-slate)]">
                      {" · "}{r.booking.pickupCity}
                      {r.booking.serviceType ? ` · ${SERVICE_LABEL[r.booking.serviceType]?.[locale] ?? ""}` : ""}
                      {r.driverProfile ? ` · ${L ? "기사" : "Driver"} ${r.driverProfile.contactName}` : ""}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* CTA */}
      <section className="section pt-0">
        <div className="container-cd">
          <div className="hero-gradient rounded-3xl text-white p-10 md:p-14 text-center">
            <h2 className="font-display text-3xl font-bold">{L ? "다음 후기의 주인공이 되어보세요" : "Your story could be next"}</h2>
            <p className="mt-3 text-white/75 max-w-xl mx-auto">{L ? "검증된 한인·한국어 기사와 함께 편안한 여행을 시작하세요." : "Start an effortless trip with a verified Korean-speaking chauffeur."}</p>
            <Link href="/#book" className="btn btn-gold mt-7 inline-flex">{L ? "예약하기" : "Book now"}</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
