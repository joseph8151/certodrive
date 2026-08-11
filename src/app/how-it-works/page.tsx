import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/Icon";
import { getLocale } from "@/lib/locale";
import { IMG } from "@/lib/images";

export const metadata: Metadata = {
  title: "이용 방법 · 서비스 안내",
  description: "Certo Drive가 공항 픽업부터 하루 종일 전세까지 어떻게 제공되는지 — 예약, 기사 확정, 공항 미팅, 결제, 바우처, 검증 절차까지 상세 안내.",
};

export default async function HowItWorks() {
  const locale = await getLocale();
  const L = locale === "ko";

  const steps = L
    ? [
        { icon: "route", t: "이동 정보 입력", d: "픽업·목적지·일시·차량을 입력합니다. 등록된 노선은 즉시 가격이 표시되고, 그 외 지역은 견적 요청으로 접수됩니다." },
        { icon: "tag", t: "견적 및 기사 확인", d: "해당 지역 파트너 기사에게 자동으로 요청이 전송되고, 기사가 가능 여부와 공급가를 제출합니다. 관리자가 최종 정찰제 가격을 확정합니다." },
        { icon: "shield", t: "온라인 선결제", d: "확정된 정찰제 요금을 해외 카드 또는 PayPal로 안전하게 선결제합니다. 숨겨진 비용이 없습니다." },
        { icon: "badge", t: "기사 배정 및 바우처", d: "검증된 기사를 배정하고, 고객과 기사에게 각각 예약 바우처(기사·차량 정보 포함)를 발송합니다." },
        { icon: "board", t: "공항 미팅", d: "기사님이 입국장에서 이름 피켓을 들고 기다립니다. 항공편 지연도 자동 확인해 대기합니다." },
        { icon: "badge", t: "운행 완료 및 후기", d: "안전하게 도착하면 운행이 완료되고 후기를 남길 수 있습니다. 문제가 생기면 체르토 드라이브가 직접 대응합니다." },
      ]
    : [
        { icon: "route", t: "Enter your trip", d: "Enter pickup, destination, date and vehicle. Registered routes show an instant price; other areas are received as a quote." },
        { icon: "tag", t: "Quote & driver check", d: "Partner drivers in the area are notified automatically and submit availability and their supply price; an admin confirms the final fixed price." },
        { icon: "shield", t: "Prepay online", d: "Pay the confirmed fixed price securely by international card or PayPal. No hidden fees." },
        { icon: "badge", t: "Driver assigned & voucher", d: "A verified driver is assigned and booking vouchers (with driver & vehicle details) go to both customer and driver." },
        { icon: "board", t: "Airport meet & greet", d: "Your chauffeur waits at arrivals with a name board, tracking your flight for delays at no extra cost." },
        { icon: "badge", t: "Completion & review", d: "The trip completes on safe arrival and you can leave a review. If anything goes wrong, Certo Drive steps in directly." },
      ];

  const included = L
    ? ["공항 미팅·이름 피켓 서비스", "항공편 지연 자동 확인 및 대기", "톨게이트·기본 주차 요금", "숨겨진 비용 없는 정찰제", "24시간 한국어 고객지원", "문제 발생 시 중간 대응"]
    : ["Airport meet & greet with name board", "Automatic flight-delay tracking & waiting", "Tolls & standard parking", "Fixed all-in price, no hidden fees", "24/7 Korean customer support", "Direct support if anything goes wrong"];

  const verified = L
    ? [
        { t: "면허·보험 검증", d: "운송사업 면허, 기사 면허, 보험증서, 차량등록증을 제출받아 관리자가 검증합니다." },
        { t: "한국어 응대", d: "한국어 가능 수준을 확인하고, 필요 시 한국어 가능 기사를 지정합니다." },
        { t: "평점·취소율 관리", d: "이용 후기와 취소율을 기록해 신뢰도 높은 기사만 배정합니다." },
      ]
    : [
        { t: "License & insurance", d: "Transport license, driver license, insurance and vehicle registration are submitted and verified by an admin." },
        { t: "Korean-speaking", d: "We verify each driver's Korean level and assign a Korean-speaking chauffeur when required." },
        { t: "Ratings & reliability", d: "We track reviews and cancellation rates so only dependable drivers are assigned." },
      ];

  const audiences = L
    ? [
        { icon: "badge", t: "가족여행", d: "카시트·넉넉한 수하물 공간, 아이와 함께 안심 이동." },
        { icon: "tag", t: "출장·비즈니스", d: "정시 픽업, 조용한 이동, 영수증·정찰제로 경비 처리 편리." },
        { icon: "clock", t: "관광·골프", d: "하루 종일 기사·차량 전세로 여러 곳을 자유롭게." },
        { icon: "shield", t: "VIP·기업 의전", d: "정장 기사, 프라이버시, 프리미엄 차량으로 귀빈 응대." },
      ]
    : [
        { icon: "badge", t: "Family travel", d: "Child seats, ample luggage space, peace of mind with kids." },
        { icon: "tag", t: "Business trips", d: "On-time pickups, a quiet ride, easy expensing with fixed pricing." },
        { icon: "clock", t: "Sightseeing & golf", d: "Full-day driver + vehicle hire to roam freely." },
        { icon: "shield", t: "VIP & corporate", d: "Suited chauffeurs, privacy and premium vehicles for guests." },
      ];

  const faq = L
    ? [
        { q: "공항에서 어떻게 만나나요?", a: "입국장(도착홀)에서 기사님이 고객님 성함이 적힌 피켓을 들고 기다립니다. 배정 시 기사 이름·연락처·차량 정보를 미리 안내드립니다." },
        { q: "항공편이 지연되면요?", a: "항공편 번호로 도착 시간을 자동 확인해 기사님이 맞춰 대기합니다. 지연으로 인한 추가 요금은 없습니다." },
        { q: "요금은 어떻게 정해지나요?", a: "등록된 노선은 즉시 정찰제 가격이 표시되고, 그 외 지역은 파트너 기사 공급가에 서비스 수수료·옵션을 더해 최종 가격을 확정한 뒤 결제합니다." },
        { q: "예약을 변경·취소할 수 있나요?", a: "예약 조회 페이지에서 변경을 요청할 수 있고, 취소·환불은 규정에 따라 처리됩니다." },
      ]
    : [
        { q: "How do we meet at the airport?", a: "Your chauffeur waits at arrivals holding a name board with your name. Driver name, contact and vehicle details are shared in advance." },
        { q: "What if my flight is delayed?", a: "We track your flight by number and your driver adjusts the pickup time — no extra charge for delays." },
        { q: "How is the price set?", a: "Registered routes show an instant fixed price; other areas are priced from the partner's supply price plus service fee and options, confirmed before payment." },
        { q: "Can I change or cancel?", a: "You can request changes from the Manage booking page; cancellations and refunds follow our policy." },
      ];

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="relative text-white overflow-hidden" style={{ backgroundColor: "var(--color-navy)" }}>
        <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(105deg, rgba(30,27,22,0.93), rgba(41,37,30,0.6)), url(${IMG.airport})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="container-cd relative py-16 md:py-24">
          <p className="eyebrow text-[var(--color-gold)]">{L ? "이용 방법" : "How it works"}</p>
          <h1 className="font-display text-2xl md:text-[2rem] font-bold mt-3 max-w-3xl">
            {L ? "예약부터 공항 미팅까지, 이렇게 제공됩니다" : "How the service works, end to end"}
          </h1>
          <p className="mt-4 text-white/75 max-w-2xl">
            {L ? "체르토 드라이브는 현장 배차가 아니라, 검증된 기사를 사전에 확정하는 관리형 예약 서비스입니다." : "Certo Drive is a managed, pre-booked service — a verified chauffeur is confirmed ahead of time, not dispatched on the street."}
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="section">
        <div className="container-cd">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="card p-7">
                <div className="flex items-center gap-3">
                  <span className="font-display text-2xl font-bold text-[var(--color-gold)]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="h-10 w-10 rounded-full bg-[var(--color-navy)] text-[var(--color-gold)] flex items-center justify-center"><Icon name={s.icon} size={20} /></span>
                </div>
                <h3 className="mt-4 font-semibold text-lg">{s.t}</h3>
                <p className="mt-2 text-sm text-[var(--color-slate)] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Airport meet band */}
      <section className="relative text-white" style={{ backgroundColor: "var(--color-navy)" }}>
        <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(90deg, rgba(30,27,22,0.9), rgba(41,37,30,0.55)), url(${IMG.meet})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="container-cd relative py-20 md:py-24">
          <div className="max-w-xl">
            <p className="eyebrow text-[var(--color-gold)]">{L ? "공항 미팅" : "Meet & greet"}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-3">{L ? "입국장에서 이름 피켓으로 안내합니다" : "Welcomed at arrivals with your name"}</h2>
            <p className="mt-4 text-white/75 leading-relaxed">
              {L ? "짐 찾고 나오면 기사님이 성함이 적힌 피켓을 들고 기다립니다. 낯선 공항에서 헤맬 필요 없이, 바로 차량까지 안내받으세요." : "As you exit baggage claim, your chauffeur is waiting with a name board — no wandering a strange airport; you're guided straight to the car."}
            </p>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="section">
        <div className="container-cd grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="eyebrow">{L ? "요금에 포함" : "What's included"}</p>
            <h2 className="font-display text-3xl font-bold mt-2">{L ? "정찰제 하나로, 이 모든 것" : "One fixed price covers it all"}</h2>
            <p className="text-sm text-[var(--color-slate)] mt-3 leading-relaxed">
              {L ? "최종 가격에는 아래 항목이 포함됩니다. 현장에서 추가로 흥정하거나 놀랄 일이 없습니다." : "Your final price includes the following — no haggling or surprises on the day."}
            </p>
          </div>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            {included.map((x) => (
              <li key={x} className="flex items-start gap-3">
                <span className="text-[var(--color-gold-dark)] mt-0.5 shrink-0"><Icon name="badge" size={20} /></span>
                <span className="text-sm">{x}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Verified drivers */}
      <section className="section bg-[var(--color-mist)]">
        <div className="container-cd">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">{L ? "검증된 기사" : "Verified drivers"}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{L ? "아무나 배정되지 않습니다" : "Not just anyone gets assigned"}</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {verified.map((v) => (
              <div key={v.t} className="card p-7">
                <span className="h-11 w-11 rounded-full border border-[var(--color-gold)]/40 text-[var(--color-gold-dark)] flex items-center justify-center"><Icon name="shield" size={20} /></span>
                <h3 className="mt-4 font-semibold text-lg">{v.t}</h3>
                <p className="mt-2 text-sm text-[var(--color-slate)] leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className="section">
        <div className="container-cd">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">{L ? "이런 분께" : "Made for"}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{L ? "여행 목적에 딱 맞게" : "Whatever your trip"}</h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {audiences.map((a) => (
              <div key={a.t} className="card p-6">
                <span className="text-[var(--color-gold-dark)]"><Icon name={a.icon} size={24} /></span>
                <h3 className="mt-3 font-semibold">{a.t}</h3>
                <p className="mt-1.5 text-sm text-[var(--color-slate)] leading-relaxed">{a.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer protection */}
      <section className="section">
        <div className="container-cd">
          <div className="max-w-xl">
            <p className="eyebrow">{L ? "고객 보호" : "Your protection"}</p>
            <h2 className="font-display text-2xl md:text-[2rem] mt-5 leading-[1.1]">{L ? "안심하고 맡기세요" : "Travel with peace of mind"}</h2>
          </div>
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
            {(L
              ? [
                  { icon: "shield", t: "검증된 기사만", d: "운전면허·보험·신원, 그리고 국내는 운송면허까지 확인된 기사만 배정됩니다. 자가용 무면허 운행은 원천 차단합니다." },
                  { icon: "tag", t: "정찰제 · 선결제", d: "예약 시 요금이 확정되고 안전하게 선결제됩니다. 현장 흥정이나 숨은 비용이 없어요." },
                  { icon: "chat", t: "24시간 한국어 지원", d: "예약 전 문의부터 이동 중 문제까지, 언제든 한국어로 도와드립니다. 문제가 생기면 체르토가 직접 대응합니다." },
                  { icon: "plane", t: "항공편 지연 보호", d: "입국 항공편을 자동 확인해 기사님이 대기합니다. 지연으로 인한 추가 요금이 없습니다." },
                  { icon: "badge", t: "바우처 · 기록", d: "예약·기사·차량 정보가 바우처와 기록으로 남아, 분쟁 시 근거가 됩니다." },
                  { icon: "route", t: "안전한 앱 내 소통", d: "기사와의 대화는 앱 안에서. 외부 결제·직거래 시도는 자동 감지되어 보호받지 못합니다." },
                ]
              : [
                  { icon: "shield", t: "Verified drivers only", d: "License, insurance, identity — and a transport licence in Korea. No unlicensed private-car driving." },
                  { icon: "tag", t: "Fixed, prepaid fares", d: "The price is locked at booking and prepaid securely — no haggling, no hidden costs." },
                  { icon: "chat", t: "24/7 Korean support", d: "From pre-booking to mid-trip issues, we help in Korean and step in directly if needed." },
                  { icon: "plane", t: "Flight-delay protection", d: "We track your flight so the driver waits — no extra charge for delays." },
                  { icon: "badge", t: "Vouchers & records", d: "Booking, driver and vehicle details are kept on record for any dispute." },
                  { icon: "route", t: "Safe in-app messaging", d: "Chat stays in the app; off-platform payment attempts are detected and unprotected." },
                ]
            ).map((x) => (
              <div key={x.t} className="border-t border-[var(--color-line)] pt-6">
                <Icon name={x.icon} size={24} className="text-[var(--color-gold-dark)]" />
                <h3 className="mt-5 font-display text-xl">{x.t}</h3>
                <p className="mt-2.5 text-[15px] text-[var(--color-slate)] leading-relaxed">{x.d}</p>
              </div>
            ))}
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
          <div className="mt-10 grid gap-3">
            {faq.map((item, i) => (
              <details key={i} className="card p-5 group">
                <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                  {item.q}<span className="text-[var(--color-gold-dark)] group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <p className="text-sm text-[var(--color-slate)] mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-cd">
          <div className="hero-gradient rounded-3xl text-white p-10 md:p-16 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold">{L ? "이제, 공항에서부터 편안하게" : "Start your trip the moment you land"}</h2>
            <p className="mt-3 text-white/75">{L ? "검증된 한인·한국어 기사와 함께하세요." : "Travel with a verified Korean-speaking chauffeur."}</p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link href="/#book" className="btn btn-gold">{L ? "예약하기" : "Book now"}</Link>
              <Link href="/reviews" className="btn btn-outline text-white border-white/40 hover:bg-white hover:text-[var(--color-ink)]">{L ? "후기 보기" : "Read reviews"}</Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
