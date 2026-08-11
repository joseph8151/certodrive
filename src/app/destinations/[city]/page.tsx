import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BookingWidget from "@/components/BookingWidget";
import Icon from "@/components/Icon";
import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import { formatMoney, safeJson } from "@/lib/utils";
import { POPULAR_CITIES } from "@/lib/constants";
import { cityImage } from "@/lib/images";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const name = decodeURIComponent(city);
  const cms = await prisma.cityContent.findUnique({ where: { city: name } });
  return {
    title: cms?.metaTitle || `${name} 공항 픽업 · 한인 택시 · 하루 종일 전세`,
    description: cms?.metaDescription || `${name}에서 검증된 한인·한국어 가능 기사를 예약하세요. 공항 픽업·샌딩, 한인 택시, 하루 종일 기사·차량 전세. 정찰제 요금과 한국어 지원.`,
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const name = decodeURIComponent(city);
  const locale = await getLocale();
  const L = locale === "ko";

  const cityMeta = POPULAR_CITIES[locale].find((c) => c.city === name) ?? POPULAR_CITIES.ko.find((c) => c.city === name);
  const cms = await prisma.cityContent.findUnique({ where: { city: name } });
  const cmsPublished = cms?.published ? cms : null;
  const cmsFaq = safeJson<{ q: string; a: string }[]>(cmsPublished?.faq, []);
  const faq = cmsFaq.length > 0 ? cmsFaq : (L
    ? [
        { q: `${name} 공항에서 어떻게 만나나요?`, a: "공항 픽업은 입국장에서 기사님이 성함이 적힌 피켓을 들고 기다립니다. 기사님 연락처는 도착 전에 미리 공유됩니다." },
        { q: "요금은 어떻게 확정되나요?", a: `${name}의 등록된 노선은 예약 시 정찰제로 즉시 확정되며, 그 외 노선은 견적 요청 후 안내드립니다. 통행료·주차·기본 대기가 포함됩니다.` },
        { q: "한국어가 되는 기사인가요?", a: "네. 모든 기사는 한국어 가능 수준을 검증받으며, 대부분 한인 또는 한국어 원어민 수준입니다. 예약 시 한국어 기사 지정을 선택할 수 있습니다." },
        { q: "짐이 많거나 인원이 많아도 되나요?", a: "인원과 수하물 수를 입력하면 적합한 차량(세단·밴·미니버스)을 추천합니다. 카시트 등 특별 요청도 가능합니다." },
      ]
    : [
        { q: `How do I meet my driver at ${name} airport?`, a: "For airport pickups, your driver waits at arrivals with a name board, and contact details are shared before you land." },
        { q: "How is the price confirmed?", a: `Registered routes in ${name} are fixed instantly at booking; other routes are quoted on request. Tolls, parking and basic wait time are included.` },
        { q: "Will the driver speak Korean?", a: "Yes — every driver's Korean level is verified, and most are Korean or native-level. You can require a Korean driver when booking." },
        { q: "Can you handle lots of luggage or a big group?", a: "Enter your party and bags and we recommend the right vehicle (sedan, van or minibus). Child seats and special requests are available." },
      ]);
  const routes = await prisma.priceRule.findMany({ where: { city: name, active: true }, orderBy: { driverSupplyPrice: "asc" } });
  const reviewRows = await prisma.review.findMany({
    where: { rating: { gte: 4 }, comment: { not: null }, booking: { pickupCity: name } },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        serviceType: L ? `${name} 공항 픽업 · 한인 택시` : `${name} airport pickup & Korean taxi`,
        provider: { "@type": "Organization", name: "Certo Drive" },
        areaServed: { "@type": "City", name },
        description: L
          ? `${name}에서 검증된 한국어 가능 기사와 함께하는 공항 픽업·시내 이동·하루 종일 전세.`
          : `Verified Korean-speaking drivers in ${name} for airport pickup, city transfers and full-day hire.`,
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <section className="relative text-white overflow-hidden" style={{ backgroundColor: "var(--color-navy)" }}>
        <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(105deg, rgba(30,27,22,0.93) 0%, rgba(41,37,30,0.78) 45%, rgba(41,37,30,0.5) 100%), url(${cityImage(name)})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="container-cd relative py-12 md:py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="eyebrow text-[var(--color-gold)]">{cityMeta?.country ?? ""}</p>
            <h1 className="font-display text-2xl md:text-[2rem] font-semibold mt-3">
              {cmsPublished?.headline || (L ? `${name} 공항 픽업 및 차량 예약` : `${name} airport pickup & chauffeur`)}
            </h1>
            <p className="mt-4 text-white/75 max-w-lg">
              {cmsPublished?.intro || (L ? `${name}에서 검증된 한인 및 한국어 가능 기사가 공항에서 직접 맞이합니다. 정찰제 요금, 출발 전 기사 확정, 24시간 한국어 지원.`
                 : `In ${name}, a verified Korean-speaking chauffeur meets you at the airport. Fixed pricing, driver confirmed before departure, 24/7 Korean support.`)}
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

      {/* Services offered in this city (always shown) */}
      <section className="section">
        <div className="container-cd">
          <div className="max-w-2xl">
            <p className="eyebrow">{L ? "서비스" : "Services"}</p>
            <h2 className="font-display text-3xl font-bold mt-2">{L ? `${name}에서 제공하는 서비스` : `What we offer in ${name}`}</h2>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "arrival", href: "/booking/airport-pickup", t: L ? "공항 픽업·샌딩" : "Airport transfers", d: L ? `${name} 공항에서 시내 호텔·자택까지 피켓 미팅과 정찰 요금으로 편안하게.` : `From the airport to your hotel or home, with a name-board meet and a fixed fare.` },
              { icon: "car", href: "/booking/intercity", t: L ? "한인 택시·시내" : "Korean taxi", d: L ? `${name} 시내 어디든 한국어가 통하는 기사와 함께. 관광·쇼핑·미팅 이동에 최적.` : `Anywhere in ${name} with a Korean-speaking driver — sightseeing, shopping, meetings.` },
              { icon: "clock", href: "/booking/hourly", t: L ? "하루 종일 전세" : "Full-day hire", d: L ? `기사와 차량을 시간 단위로. 여러 목적지를 자유롭게 도는 일정에 이상적입니다.` : `Car and chauffeur by the hour — ideal for multi-stop days.` },
              { icon: "badge", href: "/vip", t: L ? "VIP·기업 의전" : "VIP & corporate", d: L ? `임원·귀빈을 위한 최고급 의전 차량과 전담 기사를 ${name}에서도.` : `Top-tier protocol vehicles and dedicated chauffeurs in ${name} too.` },
            ].map((s) => (
              <a key={s.t} href={s.href} className="card lift p-6 block">
                <div className="h-11 w-11 rounded-full bg-[var(--color-navy)] text-[var(--color-gold)] flex items-center justify-center"><Icon name={s.icon} size={20} /></div>
                <h3 className="mt-4 font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-[var(--color-slate)] leading-relaxed">{s.d}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Why a Korean driver here */}
      <section className="section bg-[var(--color-mist)]">
        <div className="container-cd grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden aspect-[4/3] hidden lg:block" style={{ backgroundColor: "var(--color-navy)", backgroundImage: `linear-gradient(180deg, rgba(30,27,22,0.05), rgba(30,27,22,0.35)), url(${cityImage(name)})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div>
            <p className="eyebrow">{L ? "왜 한인 기사인가" : "Why a Korean driver"}</p>
            <h2 className="font-display text-3xl font-bold mt-2">{L ? `${name}에서도 언어 걱정 없이` : `No language barrier in ${name}`}</h2>
            <div className="mt-6 grid gap-4">
              {[
                { icon: "chat", t: L ? "완벽한 한국어 소통" : "Fluent Korean", d: L ? "목적지와 요청을 한국어로 편하게 전달하고, 현지 팁까지 얻으세요." : "Explain everything in Korean and pick up local tips." },
                { icon: "shield", t: L ? "검증된 신원·보험" : "Vetted & insured", d: L ? "면허·보험·신원 확인을 마친 기사만 배정됩니다." : "Only license-, insurance- and identity-verified drivers." },
                { icon: "tag", t: L ? "바가지 없는 정찰 요금" : "No taxi surprises", d: L ? "예약 시 요금이 확정되어 낯선 도시에서도 마음이 편합니다." : "The fare is fixed at booking — peace of mind in a new city." },
              ].map((x) => (
                <div key={x.t} className="flex gap-4">
                  <span className="shrink-0 h-10 w-10 rounded-full bg-[var(--color-navy)] text-[var(--color-gold)] grid place-items-center"><Icon name={x.icon} size={19} /></span>
                  <div><div className="font-semibold">{x.t}</div><div className="text-sm text-[var(--color-slate)] mt-0.5 leading-relaxed">{x.d}</div></div>
                </div>
              ))}
            </div>
          </div>
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

      {faq.length > 0 && (
        <section className="section">
          <div className="container-cd max-w-3xl">
            <h2 className="font-display text-2xl font-bold mb-6">{L ? "자주 묻는 질문" : "Frequently asked questions"}</h2>
            <div className="grid gap-3">
              {faq.map((item, i) => (
                <details key={i} className="card p-5 group">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                    {item.q}<span className="text-[var(--color-slate)] group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="text-sm text-[var(--color-slate)] mt-3 leading-relaxed">{item.a}</p>
                </details>
              ))}
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
