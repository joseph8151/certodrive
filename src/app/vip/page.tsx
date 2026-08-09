import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/Icon";
import CarArt from "@/components/CarArt";
import { getLocale } from "@/lib/locale";
import { IMG } from "@/lib/images";

export default async function VIP() {
  const locale = await getLocale();
  const L = locale === "ko";

  const features = L
    ? [
        { icon: "car", t: "VIP 의전 차량", d: "메르세데스 S클래스, BMW 7시리즈, 마이바흐급 세단과 스프린터 프리미엄 밴까지. 목적과 인원에 맞춰 최고급 차량을 배정합니다." },
        { icon: "badge", t: "전담 의전 기사", d: "정장 차림에 의전 프로토콜을 숙지한 베테랑 기사가 배정됩니다. 완벽한 한국어와 비즈니스 영어로 응대하며, 동선과 시간을 철저히 관리합니다." },
        { icon: "arrival", t: "공항 VIP 영접", d: "입국장 전용 미팅은 물론, 일부 공항에서는 패스트트랙·의전실 연계까지 지원합니다. 수하물은 기사가 직접 챙겨 차량까지 안내합니다." },
        { icon: "shield", t: "완벽한 프라이버시", d: "탑승객의 일정과 정보는 철저히 비밀에 부쳐집니다. 기밀 유지 서약을 마친 기사만 의전에 투입됩니다." },
        { icon: "clock", t: "전 일정 대기·수행", d: "미팅, 만찬, 행사 사이의 모든 이동과 대기를 한 명의 기사가 하루 종일 전담합니다. 갑작스러운 일정 변경에도 유연하게 대응합니다." },
        { icon: "chat", t: "전용 컨시어지 매니저", d: "예약부터 운행 종료까지 전담 매니저가 1:1로 관리합니다. 레스토랑 예약, 통역 연계 등 부가 요청도 상담해 드립니다." },
      ]
    : [
        { icon: "car", t: "VIP chauffeur fleet", d: "Mercedes S-Class, BMW 7 Series, Maybach-class sedans and premium Sprinter vans — matched to your purpose and party." },
        { icon: "badge", t: "Dedicated chauffeurs", d: "Suited, protocol-trained veterans fluent in Korean and business English, managing every route and minute." },
        { icon: "arrival", t: "Airport VIP welcome", d: "Private arrivals meet, with fast-track and lounge coordination at select airports; the chauffeur handles your luggage to the car." },
        { icon: "shield", t: "Total privacy", d: "Itineraries and information stay strictly confidential — only NDA-signed chauffeurs handle VIP details." },
        { icon: "clock", t: "Full-day attendance", d: "One chauffeur covers every transfer and wait between meetings, dinners and events, flexing to last-minute changes." },
        { icon: "chat", t: "Personal concierge", d: "A dedicated manager handles everything 1:1, from booking to wrap — and can arrange dining, interpreters and more." },
      ];

  const audiences = L
    ? [
        { t: "기업 임원·이사회", d: "해외 출장, 바이어 미팅, 이사회 방문 시 격에 맞는 의전." },
        { t: "귀빈·연예·스포츠", d: "노출을 꺼리는 VIP를 위한 프라이빗하고 안전한 이동." },
        { t: "웨딩·기념일", d: "인생의 특별한 날을 위한 최고급 차량과 세심한 서비스." },
        { t: "콘퍼런스·행사", d: "다수 귀빈의 공항–호텔–행사장 단체 의전을 통합 관리." },
      ]
    : [
        { t: "Executives & boards", d: "Fitting protocol for overseas trips, buyer meetings and board visits." },
        { t: "VIPs, talent & athletes", d: "Private, secure travel for guests who value discretion." },
        { t: "Weddings & milestones", d: "Top-tier vehicles and attentive service for life's big days." },
        { t: "Conferences & events", d: "Coordinated group protocol across airport, hotel and venue." },
      ];

  const photoBg = (url: string, overlay: string) => ({
    backgroundColor: "var(--color-navy)", backgroundImage: `${overlay}, url(${url})`, backgroundSize: "cover", backgroundPosition: "center",
  });

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="relative text-white overflow-hidden" style={{ backgroundColor: "var(--color-navy)" }}>
        <div className="absolute inset-0" style={photoBg(IMG.vipBand, "linear-gradient(105deg, rgba(28,25,20,0.95) 0%, rgba(30,27,22,0.82) 45%, rgba(30,27,22,0.55) 100%)")} />
        <div className="container-cd relative py-16 md:py-24 max-w-2xl">
          <p className="eyebrow text-[var(--color-gold)]">VIP & PROTOCOL</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-4 leading-tight">
            {L ? "귀빈을 위한 최고 수준의 의전 이동" : "The highest standard of VIP chauffeur"}
          </h1>
          <p className="mt-5 text-white/80 text-lg">
            {L
              ? "임원, 바이어, 귀빈을 위한 프리미엄 의전 서비스. 최고급 차량과 프로토콜을 숙지한 전담 기사가 공항 영접부터 하루 전 일정까지 완벽하게 수행합니다."
              : "Premium protocol travel for executives, buyers and honored guests — top-tier vehicles and dedicated chauffeurs, from airport welcome to a full day's itinerary."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/#book" className="btn btn-gold">{L ? "VIP 예약 문의" : "Request VIP booking"}</Link>
            <Link href="/corporate" className="btn btn-outline text-white border-white/40 hover:bg-white hover:text-[var(--color-navy)]">{L ? "기업 제휴" : "Corporate"}</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container-cd">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">{L ? "의전 서비스" : "The service"}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{L ? "품격을 완성하는 디테일" : "Details that define prestige"}</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.t} className="card lift p-7">
                <div className="h-12 w-12 rounded-full bg-[var(--color-navy)] text-[var(--color-gold)] flex items-center justify-center">
                  <Icon name={f.icon} size={22} />
                </div>
                <h3 className="mt-4 font-semibold text-lg">{f.t}</h3>
                <p className="mt-2 text-sm text-[var(--color-slate)] leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet band */}
      <section className="relative text-white" style={{ backgroundColor: "var(--color-navy)" }}>
        <div className="absolute inset-0" style={photoBg(IMG.editorial, "linear-gradient(90deg, rgba(28,25,20,0.94) 0%, rgba(30,27,22,0.72) 60%, rgba(30,27,22,0.5) 100%)")} />
        <div className="container-cd relative py-16 md:py-20">
          <div className="max-w-xl">
            <p className="eyebrow text-[var(--color-gold)]">{L ? "차량" : "The fleet"}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-3">{L ? "격에 맞는 최고급 차량" : "Vehicles worthy of the occasion"}</h2>
            <p className="mt-4 text-white/75 leading-relaxed">
              {L ? "플래그십 세단부터 프리미엄 밴, 단체 의전용 미니버스까지. 모든 차량은 최신 연식과 무결점 컨디션을 유지하며, 생수·충전기·기내용 편의를 기본 제공합니다."
                 : "From flagship sedans to premium vans and group minibuses. Every vehicle is late-model and immaculate, with water, chargers and in-car comforts as standard."}
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-5 max-w-3xl">
            {(["sedan", "van", "minibus"] as const).map((tp) => (
              <div key={tp} className="glass rounded-2xl p-5 flex items-center justify-center">
                <CarArt type={tp} className="w-full max-w-[180px]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className="section bg-[var(--color-mist)]">
        <div className="container-cd">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">{L ? "이런 분들께" : "Who it's for"}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{L ? "가장 중요한 순간에" : "For your most important moments"}</h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {audiences.map((a) => (
              <div key={a.t} className="card lift p-6">
                <h3 className="font-semibold">{a.t}</h3>
                <p className="mt-2 text-sm text-[var(--color-slate)] leading-relaxed">{a.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-cd">
          <div className="hero-gradient rounded-3xl text-white p-10 md:p-16 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold">{L ? "귀빈 의전, 지금 상담하세요" : "Plan your VIP protocol today"}</h2>
            <p className="mt-3 text-white/75 max-w-xl mx-auto">{L ? "전담 매니저가 일정과 요구사항을 확인해 맞춤 견적을 안내드립니다." : "A dedicated manager reviews your itinerary and returns a tailored quote."}</p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link href="/#book" className="btn btn-gold">{L ? "VIP 예약 문의" : "Request VIP booking"}</Link>
              <Link href="/support" className="btn btn-outline text-white border-white/40 hover:bg-white hover:text-[var(--color-navy)]">{L ? "문의하기" : "Contact us"}</Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
