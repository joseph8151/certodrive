import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BookingWidget from "@/components/BookingWidget";
import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import { POPULAR_CITIES } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const name = decodeURIComponent(city);
  return {
    title: `${name} 공항 픽업 · 한인 기사 차량 예약`,
    description: `${name}에서 검증된 한인·한국어 가능 기사를 예약하세요. 공항 픽업, 샌딩, 도시 간 이동. 정찰제 요금과 한국어 지원.`,
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const name = decodeURIComponent(city);
  const locale = await getLocale();
  const L = locale === "ko";

  const cityMeta = POPULAR_CITIES[locale].find((c) => c.city === name) ?? POPULAR_CITIES.ko.find((c) => c.city === name);
  const routes = await prisma.priceRule.findMany({ where: { city: name, active: true }, orderBy: { driverSupplyPrice: "asc" } });
  const reviewRows = await prisma.review.findMany({
    where: { rating: { gte: 4 }, comment: { not: null }, booking: { pickupCity: name } },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <>
      <SiteHeader />
      <section className="hero-gradient text-white">
        <div className="container-cd py-12 md:py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="eyebrow text-[var(--color-gold)]">{cityMeta?.country ?? ""}</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold mt-3">
              {L ? `${name} 공항 픽업 및 차량 예약` : `${name} airport pickup & chauffeur`}
            </h1>
            <p className="mt-4 text-white/75 max-w-lg">
              {L ? `${name}에서 검증된 한인 및 한국어 가능 기사가 공항에서 직접 맞이합니다. 정찰제 요금, 출발 전 기사 확정, 24시간 한국어 지원.`
                 : `In ${name}, a verified Korean-speaking chauffeur meets you at the airport. Fixed pricing, driver confirmed before departure, 24/7 Korean support.`}
            </p>
            {cityMeta && (
              <div className="mt-6 flex flex-wrap gap-2">
                {cityMeta.airports.map((a) => <span key={a} className="pill pill-slate bg-white/10 text-white">{a}</span>)}
              </div>
            )}
          </div>
          <div id="book" className="scroll-mt-20"><BookingWidget locale={locale} /></div>
        </div>
      </section>

      {routes.length > 0 && (
        <section className="section">
          <div className="container-cd max-w-3xl">
            <h2 className="font-display text-2xl font-bold mb-2">{L ? "대표 노선 요금" : "Sample route prices"}</h2>
            <p className="text-sm text-[var(--color-slate)] mb-6">
              {L ? "아래는 기준 공급가이며, 최종 고객 가격은 옵션과 할증에 따라 예약창에서 확정됩니다." : "Base supply prices shown; the final customer price is confirmed in the booking widget with options and surcharges."}
            </p>
            <div className="card overflow-hidden">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>{L ? "노선" : "Route"}</th>
                    <th>{L ? "차량" : "Vehicle"}</th>
                    <th>{L ? "기준가" : "From"}</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((r) => (
                    <tr key={r.id}>
                      <td>{r.pickupLocation} → {r.destination}</td>
                      <td className="text-sm">{r.vehicleCategory}</td>
                      <td className="font-medium">{formatMoney(r.driverSupplyPrice, r.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {reviewRows.length > 0 && (
        <section className="section bg-[var(--color-mist)]">
          <div className="container-cd max-w-3xl">
            <h2 className="font-display text-2xl font-bold mb-6">{L ? `${name} 이용 후기` : `Reviews in ${name}`}</h2>
            <div className="grid gap-4">
              {reviewRows.map((r) => (
                <figure key={r.id} className="card p-5">
                  <span className="text-[var(--color-gold)]">{"★".repeat(r.rating)}<span className="text-[var(--color-line)]">{"★".repeat(5 - r.rating)}</span></span>
                  {r.comment && <blockquote className="mt-2 text-[15px]">“{r.comment}”</blockquote>}
                  <figcaption className="mt-2 text-sm text-[var(--color-slate)]">{r.authorName ?? (L ? "고객" : "Traveler")}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}
      <SiteFooter />
    </>
  );
}
