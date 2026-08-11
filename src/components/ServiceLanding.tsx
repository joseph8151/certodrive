import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BookingWidget from "@/components/BookingWidget";
import CarArt from "@/components/CarArt";
import Icon from "@/components/Icon";
import type { Locale } from "@/lib/i18n";
import { IMG } from "@/lib/images";
import { VEHICLE_CATEGORIES, VEHICLE_META } from "@/lib/constants";

function carType(v: string): "sedan" | "van" | "minibus" {
  if (v === "Minibus") return "minibus";
  if (v.includes("Van")) return "van";
  return "sedan";
}

type Detail = {
  heroImg: string;
  included: { t: string; d: string }[];
  steps: { t: string; d: string }[];
  faq: { q: string; a: string }[];
};

// Per-service rich content. Keyed by serviceType with a Korean/English variant.
function detailFor(serviceType: string, L: boolean): Detail {
  const commonSteps = L
    ? [
        { t: "여정 입력", d: "픽업 위치·시간·인원을 입력하면 즉시 가격 또는 견적을 안내합니다." },
        { t: "확정·결제", d: "요금을 확인하고 카드로 안전하게 사전 결제합니다." },
        { t: "기사 배정", d: "검증된 한인·한국어 기사가 배정되고 연락처가 공유됩니다." },
        { t: "탑승·완료", d: "기사님을 만나 편안하게 이동하고, 도착 후 후기를 남기세요." },
      ]
    : [
        { t: "Enter your trip", d: "Add pickup, time and party size — get an instant price or a quote." },
        { t: "Confirm & pay", d: "Review the fare and prepay securely by card." },
        { t: "Driver assigned", d: "A verified Korean-speaking driver is assigned and shared with you." },
        { t: "Ride & done", d: "Meet your driver, travel in comfort, and leave a review." },
      ];

  const map: Record<string, Detail> = {
    AIRPORT_PICKUP: {
      heroImg: IMG.airport,
      included: L
        ? [
            { t: "입국장 미팅·이름 피켓", d: "도착 게이트에서 기사님이 이름 피켓을 들고 기다립니다." },
            { t: "항공편 실시간 확인", d: "지연·조기 도착을 자동 반영, 60분 무료 대기." },
            { t: "톨게이트·주차 포함", d: "정찰제 요금에 통행료와 공항 주차비 포함." },
            { t: "수하물 도움", d: "짐 운반을 도와 차량까지 편하게 안내." },
          ]
        : [
            { t: "Meet & greet with name board", d: "Your driver waits at the arrival gate with a name sign." },
            { t: "Live flight tracking", d: "Delays and early arrivals handled — 60 min free wait." },
            { t: "Tolls & parking included", d: "Fixed fare covers highway tolls and airport parking." },
            { t: "Luggage assistance", d: "Help with bags all the way to the vehicle." },
          ],
      steps: commonSteps,
      faq: L
        ? [
            { q: "비행기가 지연되면 어떻게 되나요?", a: "항공편을 자동으로 확인해 도착 시간에 맞춰 대기합니다. 도착 후 60분까지 무료 대기가 포함됩니다." },
            { q: "입국장에서 어떻게 만나나요?", a: "기사님이 성함이 적힌 피켓을 들고 입국장 게이트에서 기다립니다. 연락처도 사전에 공유됩니다." },
            { q: "요금에 톨게이트·주차비가 포함되나요?", a: "네. 등록된 노선은 정찰제로 통행료와 공항 주차비까지 포함된 금액입니다." },
          ]
        : [
            { q: "What if my flight is delayed?", a: "We track your flight automatically and adjust the pickup. Up to 60 minutes of free wait time is included." },
            { q: "How do I find my driver?", a: "Your driver waits at the arrivals gate with a name board, and contact details are shared in advance." },
            { q: "Are tolls and parking included?", a: "Yes — for registered routes the fixed fare already includes tolls and airport parking." },
          ],
    },
    AIRPORT_DROPOFF: {
      heroImg: IMG.airport,
      included: L
        ? [
            { t: "정시 도어 픽업", d: "출발 시간에 맞춰 호텔·자택 앞으로 배차." },
            { t: "넉넉한 수하물 공간", d: "인원과 짐에 맞는 차량을 추천." },
            { t: "정찰제 요금", d: "숨은 비용 없는 투명한 금액." },
            { t: "여유로운 도착", d: "체크인 시간을 고려한 출발 안내." },
          ]
        : [
            { t: "On-time door pickup", d: "Timed to your departure, from hotel or home." },
            { t: "Plenty of luggage room", d: "The right vehicle for your party and bags." },
            { t: "Fixed pricing", d: "A transparent fare with no hidden costs." },
            { t: "Arrive with time to spare", d: "Departure timed around your check-in." },
          ],
      steps: commonSteps,
      faq: L
        ? [
            { q: "출발 시간은 어떻게 정하나요?", a: "항공편 시간과 공항 혼잡도를 고려해 여유 있는 픽업 시간을 안내드립니다." },
            { q: "짐이 많은데 괜찮을까요?", a: "인원과 수하물 수를 입력하면 적합한 차량 등급을 추천합니다. 밴·미니버스도 선택 가능합니다." },
          ]
        : [
            { q: "How is the pickup time decided?", a: "We suggest a comfortable pickup time based on your flight and airport traffic." },
            { q: "Can you handle a lot of luggage?", a: "Enter your party size and bags and we recommend the right vehicle class — vans and minibuses available." },
          ],
    },
    INTERCITY: {
      heroImg: IMG.reviews,
      included: L
        ? [
            { t: "도어투도어 직행", d: "환승·대기 없이 목적지까지 한 번에." },
            { t: "장거리 프리미엄 차량", d: "장시간 이동도 편안한 좌석과 공간." },
            { t: "거리 기반 정찰제", d: "투명한 거리 기반 요금 안내." },
            { t: "중간 경유 가능", d: "필요 시 경유지 추가 상담." },
          ]
        : [
            { t: "Door-to-door direct", d: "Straight to your destination, no transfers." },
            { t: "Premium long-haul cars", d: "Comfortable seating and space for long rides." },
            { t: "Distance-based pricing", d: "Transparent fares based on distance." },
            { t: "Stops on request", d: "Add waypoints when you need them." },
          ],
      steps: commonSteps,
      faq: L
        ? [
            { q: "얼마나 먼 거리까지 가능한가요?", a: "도시 간 장거리 이동을 전문으로 합니다. 노선이 등록되어 있지 않아도 견적 요청으로 안내드립니다." },
            { q: "중간에 들를 수 있나요?", a: "경유지 추가가 가능합니다. 예약 시 요청 사항에 남겨주시면 반영됩니다." },
          ]
        : [
            { q: "How far can you travel?", a: "We specialize in long-distance city-to-city trips. Even unregistered routes can be quoted on request." },
            { q: "Can we make a stop on the way?", a: "Yes — add waypoints in your booking notes and we'll accommodate them." },
          ],
    },
    HOURLY: {
      heroImg: IMG.vipBand,
      included: L
        ? [
            { t: "자유로운 다목적지", d: "하루 동안 원하는 곳을 자유롭게 이동." },
            { t: "기사 대기 포함", d: "시간 단위로 기사와 차량을 전세." },
            { t: "의전·비즈니스 최적", d: "출장·행사·골프 일정에 적합." },
            { t: "현지 안내", d: "한국어 기사님의 현지 팁까지." },
          ]
        : [
            { t: "Free multi-stop", d: "Go wherever you like throughout the day." },
            { t: "Waiting included", d: "Car and chauffeur reserved by the hour." },
            { t: "Business & VIP ready", d: "Ideal for trips, events and golf days." },
            { t: "Local guidance", d: "Local tips from your Korean driver." },
          ],
      steps: commonSteps,
      faq: L
        ? [
            { q: "최소 이용 시간이 있나요?", a: "보통 3~4시간부터 이용 가능하며, 도시와 일정에 따라 안내드립니다." },
            { q: "관광 안내도 되나요?", a: "한국어 기사님이 주요 명소와 동선을 함께 안내해 드립니다. 가이드가 필요하면 상담해 주세요." },
          ]
        : [
            { q: "Is there a minimum booking?", a: "Typically from 3–4 hours, depending on the city and itinerary." },
            { q: "Can the driver show us around?", a: "Your Korean-speaking driver can suggest key spots and routes. Ask us if you need a full guide." },
          ],
    },
  };
  return map[serviceType] ?? map.AIRPORT_PICKUP;
}

export default function ServiceLanding({
  locale,
  serviceType,
  title,
  subtitle,
  points,
}: {
  locale: Locale;
  serviceType: string;
  title: string;
  subtitle: string;
  points: { t: string; d: string }[];
}) {
  const L = locale === "ko";
  const d = detailFor(serviceType, L);

  const otherServices = [
    { href: "/booking/airport-pickup", label: L ? "공항 픽업" : "Airport pickup", key: "AIRPORT_PICKUP" },
    { href: "/booking/airport-dropoff", label: L ? "공항 샌딩" : "Airport drop-off", key: "AIRPORT_DROPOFF" },
    { href: "/booking/intercity", label: L ? "도시 간 이동" : "Intercity", key: "INTERCITY" },
    { href: "/booking/hourly", label: L ? "시간제 전세" : "Hourly hire", key: "HOURLY" },
  ].filter((s) => s.key !== serviceType);

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
        <div className="absolute inset-0" style={photoBg(d.heroImg, "linear-gradient(105deg, rgba(30,27,22,0.95) 0%, rgba(41,37,30,0.82) 45%, rgba(41,37,30,0.55) 100%)")} />
        <div className="container-cd relative py-12 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="eyebrow text-[var(--color-gold)]">CERTO DRIVE</p>
            <h1 className="font-display text-2xl md:text-[2rem] font-semibold mt-3 leading-tight">{title}</h1>
            <p className="mt-4 text-white/80 text-lg max-w-lg">{subtitle}</p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {points.map((p) => (
                <div key={p.t} className="border-l-2 border-[var(--color-gold)] pl-3">
                  <div className="font-semibold">{p.t}</div>
                  <div className="text-sm text-white/60">{p.d}</div>
                </div>
              ))}
            </div>
          </div>
          <div id="book" className="scroll-mt-24">
            <BookingWidget locale={locale} serviceType={serviceType} />
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="section">
        <div className="container-cd grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden aspect-[4/3] hidden lg:block" style={photoBg(IMG.meet, "linear-gradient(180deg, rgba(30,27,22,0.05) 0%, rgba(30,27,22,0.35) 100%)")} />
          <div>
            <p className="eyebrow">{L ? "포함 사항" : "What's included"}</p>
            <h2 className="font-display text-3xl font-bold mt-2">{L ? "요금 안에 이 모든 것이" : "All of this, in one fixed fare"}</h2>
            <div className="mt-8 grid gap-5">
              {d.included.map((x) => (
                <div key={x.t} className="flex gap-4">
                  <span className="shrink-0 h-10 w-10 rounded-full bg-[var(--color-navy)] text-[var(--color-gold)] grid place-items-center">
                    <Icon name="shield" size={20} />
                  </span>
                  <div>
                    <div className="font-semibold">{x.t}</div>
                    <div className="text-sm text-[var(--color-slate)] mt-0.5 leading-relaxed">{x.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section bg-[var(--color-mist)]">
        <div className="container-cd">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">{L ? "이용 방법" : "How it works"}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{L ? "예약부터 도착까지 4단계" : "Four steps, booking to arrival"}</h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {d.steps.map((s, i) => (
              <div key={s.t}>
                <div className="font-display text-5xl font-bold text-[var(--color-gold)]/90">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="mt-3 font-semibold text-lg">{s.t}</h3>
                <p className="mt-2 text-sm text-[var(--color-slate)] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicles */}
      <section className="section">
        <div className="container-cd">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">{L ? "차량" : "Fleet"}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{L ? "인원과 짐에 맞는 차량" : "A vehicle for every party"}</h2>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VEHICLE_CATEGORIES.slice(0, 4).map((v) => {
              const m = VEHICLE_META[v];
              return (
                <div key={v} className="card overflow-hidden hover:card-shadow transition-shadow">
                  <div className="aspect-[16/10] bg-gradient-to-br from-[#4a453d] to-[var(--color-ink)] flex items-center justify-center px-4">
                    <CarArt type={carType(v)} className="w-full max-w-[200px]" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold">{v}</h3>
                    <p className="text-sm text-[var(--color-slate)] mt-1">{m.blurb[locale]}</p>
                    <div className="mt-3 text-xs text-[var(--color-slate)] flex gap-4 border-t border-[var(--color-line)] pt-3">
                      <span>{m.pax} {L ? "인승" : "pax"}</span>
                      <span>{m.luggage} {L ? "수하물" : "bags"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-[var(--color-mist)]">
        <div className="container-cd max-w-3xl">
          <div className="text-center">
            <p className="eyebrow">FAQ</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{L ? "자주 묻는 질문" : "Frequently asked"}</h2>
          </div>
          <div className="mt-10 divide-y divide-[var(--color-line)] card px-6">
            {d.faq.map((f) => (
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

      {/* Other services + CTA */}
      <section className="section">
        <div className="container-cd">
          <div className="hero-gradient rounded-3xl text-white p-10 md:p-14 text-center">
            <h2 className="font-display text-3xl font-bold">{L ? "지금 예약하고 편안하게 출발하세요" : "Book now and travel with ease"}</h2>
            <p className="mt-3 text-white/75">{L ? "검증된 한인·한국어 기사가 기다립니다." : "A verified Korean-speaking chauffeur is ready."}</p>
            <Link href="#book" className="btn btn-gold mt-7 inline-flex">{L ? "예약하기" : "Book now"}</Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm text-[var(--color-slate)]">{L ? "다른 서비스:" : "Other services:"}</span>
            {otherServices.map((s) => (
              <Link key={s.href} href={s.href} className="btn btn-outline text-sm">{s.label}</Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
