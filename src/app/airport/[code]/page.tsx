import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BookingWidget from "@/components/BookingWidget";
import { getLocale } from "@/lib/locale";
import { AIRPORTS, AIRPORT_CODES } from "@/lib/airports";
import { airportFrom } from "@/lib/pricing";
import { formatMoney } from "@/lib/utils";
import { cityImage } from "@/lib/images";

export function generateStaticParams() {
  return AIRPORT_CODES.map((code) => ({ code: code.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const a = AIRPORTS[code.toUpperCase()];
  if (!a) return {};
  return {
    title: `${a.code} ${a.name.ko} 공항 픽업 · 한인 기사 예약`,
    description: `${a.name.ko}(${a.code})에서 검증된 한국어 가능 기사와 함께하는 공항 픽업. 정찰제 요금, 항공편 지연 추적, 입국장 피켓 미팅, 24시간 한국어 지원.`,
  };
}

export default async function AirportPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const a = AIRPORTS[code.toUpperCase()];
  if (!a) notFound();

  const locale = await getLocale();
  const L = locale === "ko";
  const name = a.name[locale];
  const city = a.citySlug[locale];
  const country = a.country[locale];

  const classes = ["Business Sedan", "Premium Sedan", "Standard Van"];
  const classLabels: Record<string, { ko: string; en: string }> = {
    "Business Sedan": { ko: "비즈니스 세단", en: "Business Sedan" },
    "Premium Sedan": { ko: "프리미엄 세단", en: "Premium Sedan" },
    "Standard Van": { ko: "밴 (다인·짐)", en: "Van" },
  };

  const faq = L
    ? [
        { q: `${a.code} 공항에서 기사님을 어디서 만나나요?`, a: a.meet.ko },
        { q: "비행기가 지연되면 어떻게 되나요?", a: "항공편 번호로 도착 시간을 확인해 대기합니다. 지연에 따른 대기는 정책에 따라 처리되며, 큰 변동은 고객센터가 함께 조율합니다." },
        { q: "요금은 언제 확정되나요?", a: `${a.code} → 시내 등 등록 노선은 예약 시 정찰제로 즉시 확정됩니다. 톨게이트·주차·기본 대기가 포함됩니다.` },
        { q: "한국어가 되는 기사인가요?", a: "네. 모든 기사는 한국어 가능 수준을 검증받으며, 예약 시 한국어 기사 지정을 선택할 수 있습니다." },
      ]
    : [
        { q: `Where do I meet my driver at ${a.code}?`, a: a.meet.en },
        { q: "What if my flight is delayed?", a: "We track your flight by number and wait. Delay waiting is handled per policy, with support coordinating larger changes." },
        { q: "When is the price fixed?", a: `Registered routes such as ${a.code} → city are fixed at booking, including tolls, parking and base waiting.` },
        { q: "Will the driver speak Korean?", a: "Yes — every driver's Korean level is verified, and you can require one at booking." },
      ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        serviceType: `${a.code} airport pickup`,
        provider: { "@type": "Organization", name: "Certo Drive" },
        areaServed: { "@type": "Airport", name: `${a.name.en} (${a.code})` },
      },
      { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };

  const prefill = { serviceType: "AIRPORT_PICKUP", pickupCountry: country, pickupCity: city, pickupLocation: `${a.code} ${name}` };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />

      {/* Hero */}
      <section className="relative text-white overflow-hidden" style={{ backgroundColor: "var(--color-graphite)" }}>
        <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(103deg, rgba(17,17,17,0.94) 0%, rgba(17,17,17,0.82) 46%, rgba(17,17,17,0.5) 100%), url(${cityImage(city)})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="container-cd relative py-12 md:py-16 grid lg:grid-cols-[1fr_0.95fr] gap-10 lg:gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60">
              <span className="w-4 h-px bg-white/50" />{country} · {L ? "공항 픽업" : "Airport pickup"}
            </div>
            <div className="mt-4 flex items-end gap-3">
              <span className="font-display text-5xl md:text-6xl leading-none">{a.code}</span>
              <span className="text-white/70 pb-1">{name}</span>
            </div>
            <h1 className="font-display font-semibold text-[1.5rem] md:text-[1.9rem] mt-4 max-w-lg">
              {L ? `${name}에서 검증된 한인 기사와 편안하게` : `A verified Korean-speaking driver at ${name}`}
            </h1>
            <p className="mt-4 text-white/65 max-w-md leading-relaxed">
              {L ? "정찰제 요금, 항공편 지연 추적, 입국장 피켓 미팅. 도착 전에 기사와 차량이 확정됩니다." : "Upfront pricing, flight-delay tracking and a meet & greet — your driver is confirmed before you land."}
            </p>
            {a.terminals.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {a.terminals.map((t) => <span key={t} className="chip bg-white/10 border-white/20 text-white/85">{t}</span>)}
              </div>
            )}
            <Link href={`/destinations/${encodeURIComponent(city)}`} className="mt-6 inline-block text-sm text-white/70 hover:text-white underline">
              {L ? `${city} 전체 서비스 보기 →` : `All ${city} services →`}
            </Link>
          </div>
          <div id="book" className="scroll-mt-24">
            <BookingWidget locale={locale} serviceType="AIRPORT_PICKUP" prefill={prefill} />
          </div>
        </div>
      </section>

      {/* Fares by class */}
      <section className="section">
        <div className="container-cd">
          <div className="max-w-xl">
            <p className="eyebrow">{L ? "예상 요금" : "From fares"}</p>
            <h2 className="font-display text-[1.55rem] md:text-[1.95rem] mt-5">{L ? `${a.code} → ${city} 시내 예상 요금` : `${a.code} → ${city}, from`}</h2>
            <p className="mt-4 text-[var(--color-slate)]">{L ? "차량 클래스에 따라 달라질 수 있으며, 정확한 정찰 요금은 예약 시 확정됩니다." : "Varies by vehicle class; the exact fixed price is confirmed at booking."}</p>
          </div>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {classes.map((c) => {
              const f = airportFrom(a.code, c);
              return (
                <div key={c} className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
                  <div className="font-semibold">{classLabels[c][locale]}</div>
                  <div className="mt-3 text-[11px] text-[var(--color-slate)]">{L ? "부터" : "from"}</div>
                  <div className="font-display text-2xl">{f ? formatMoney(f.amount, f.currency) : "—"}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Meeting guide + destinations */}
      <section className="section pt-0">
        <div className="container-cd grid lg:grid-cols-2 gap-10 lg:gap-14">
          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-7">
            <p className="eyebrow">{L ? "공항 미팅" : "Meet & greet"}</p>
            <h3 className="font-display text-xl mt-4">{L ? "입국장에서 만나는 방법" : "How to meet at arrivals"}</h3>
            <div className="mt-5 flex items-center gap-2 flex-wrap">
              {(L ? ["입국", "수하물", "미팅 포인트", "기사 미팅", "탑승"] : ["Arrivals", "Baggage", "Meeting point", "Meet driver", "Ride"]).map((s, i, arr) => (
                <span key={s} className="flex items-center gap-2">
                  <span className="chip">{s}</span>{i < arr.length - 1 && <span className="text-[var(--color-slate-400)]">→</span>}
                </span>
              ))}
            </div>
            <p className="mt-5 text-[15px] text-[var(--color-slate)] leading-relaxed">{a.meet[locale]}</p>
          </div>
          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-7">
            <p className="eyebrow">{L ? "인기 목적지" : "Popular destinations"}</p>
            <h3 className="font-display text-xl mt-4">{L ? `${a.code}에서 자주 가는 곳` : `Popular from ${a.code}`}</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {a.destinations.map((d) => (
                <Link key={d.en} href={`/destinations/${encodeURIComponent(city)}`} className="chip hover:border-[var(--color-ink)]">{d[locale]}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section pt-0">
        <div className="container-cd max-w-3xl">
          <p className="eyebrow">FAQ</p>
          <h2 className="font-display text-[1.55rem] md:text-[1.95rem] mt-5">{L ? `${a.code} 공항 픽업 자주 묻는 질문` : `${a.code} pickup FAQ`}</h2>
          <div className="mt-8 divide-y divide-[var(--color-line)] border-t border-[var(--color-line)]">
            {faq.map((f) => (
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
      </section>

      <SiteFooter />
    </>
  );
}
