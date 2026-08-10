import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DriverRegistrationForm from "@/components/DriverRegistrationForm";
import Icon from "@/components/Icon";
import { getLocale } from "@/lib/locale";
import { IMG } from "@/lib/images";

export default async function PartnersPage() {
  const locale = await getLocale();
  const L = locale === "ko";

  const benefits = L
    ? [
        { icon: "route", t: "안정적인 예약 흐름", d: "전 세계 한인 여행객과 기업 고객의 사전 예약을 연결합니다. 길에서 손님을 기다릴 필요 없이, 확정된 예약만 배정받습니다." },
        { icon: "tag", t: "직접 정하는 공급가", d: "노선별로 원하는 공급 가격을 직접 제안하세요. 최소 예약 수수료가 보장되어 헛걸음이 없습니다." },
        { icon: "shield", t: "노쇼·분쟁 보호", d: "고객 선결제 기반이라 노쇼 위험이 낮고, 증빙 업로드로 보호받습니다. 문제가 생기면 체르토가 중간에서 대응합니다." },
        { icon: "clock", t: "간편한 정산", d: "운행 완료 후 관리자가 정산을 처리합니다. 정산 내역은 기사 대시보드에서 언제든 확인할 수 있습니다." },
        { icon: "chat", t: "고객과 직접 소통", d: "배정된 예약은 앱 내 채팅으로 픽업 위치·시간을 직접 조율합니다. 언어 걱정 없이 한국어로." },
        { icon: "globe", t: "전 세계 어디서나", d: "서울·파리·도쿄·뉴욕 등 어느 도시에서든 같은 기준으로 운영합니다. 해외 거주 한인 기사에게 최적입니다." },
      ]
    : [
        { icon: "route", t: "Steady booking flow", d: "Connect with pre-booked Korean travelers and corporate clients — only confirmed bookings, no waiting on the street." },
        { icon: "tag", t: "Set your own supply price", d: "Propose your supply price per route, with a guaranteed minimum booking fee." },
        { icon: "shield", t: "No-show & dispute protection", d: "Prepaid bookings reduce no-shows, backed by evidence uploads and Certo's support." },
        { icon: "clock", t: "Simple settlement", d: "Admin settles after each completed trip; track it anytime in your dashboard." },
        { icon: "chat", t: "Talk to the customer", d: "Coordinate pickup and timing via in-app chat — in Korean." },
        { icon: "globe", t: "Anywhere in the world", d: "Same standard in Seoul, Paris, Tokyo, New York — ideal for Korean drivers abroad." },
      ];

  const steps = L
    ? [
        { t: "지원서 작성", d: "이메일·연락처·지역·차량 정보를 입력합니다. 몇 분이면 끝납니다." },
        { t: "서류 검토", d: "운전면허·보험·(국내는)운송면허 등 서류를 확인합니다." },
        { t: "승인", d: "검토 후 승인되면 이메일로 안내드리고 계정이 활성화됩니다." },
        { t: "예약 수신·배정", d: "지역·차량에 맞는 예약이 배정됩니다. 결제 완료 건만 배정돼요." },
        { t: "운행", d: "고객을 픽업해 안전하게 모십니다. 채팅으로 실시간 조율." },
        { t: "정산", d: "운행 완료 후 정산이 기록되고, 주기적으로 지급됩니다." },
      ]
    : [
        { t: "Apply", d: "Enter email, contact, region and vehicle — takes a few minutes." },
        { t: "Document review", d: "We verify driver licence, insurance and (in Korea) transport licence." },
        { t: "Approval", d: "Once approved, you're notified by email and your account activates." },
        { t: "Receive bookings", d: "Paid bookings matched to your region and vehicle are assigned to you." },
        { t: "Drive", d: "Pick up the customer and coordinate live via chat." },
        { t: "Get settled", d: "Settlement is recorded after each trip and paid on a regular cycle." },
      ];

  const requirements = L
    ? [
        "유효한 운전면허 (해당 국가 기준)",
        "유상운송이 가능한 차량 보험",
        "국내(한국) 운행 시: 운송면허(택시·렌터카·전세버스 등) 및 등록번호",
        "한국어 소통 가능 (한인 또는 한국어 가능 기사 우대)",
        "깨끗하고 관리된 차량",
      ]
    : [
        "Valid driver's licence (for the country of operation)",
        "Insurance that permits paid passenger transport",
        "For Korea: a transport licence (taxi / rental / charter) and number",
        "Korean communication (Korean or Korean-speaking preferred)",
        "A clean, well-maintained vehicle",
      ];

  const faq = L
    ? [
        { q: "수수료는 어떻게 되나요?", a: "고객 요금에서 서비스 수수료를 제외한 금액이 기사 공급가로 정산됩니다. 노선별로 최소 예약 수수료가 보장됩니다. 구체적인 조건은 승인 후 대시보드에서 확인할 수 있습니다." },
        { q: "정산은 언제 받나요?", a: "운행 완료 시 정산이 기록되고, 관리자가 주기적으로 지급합니다. 대시보드에서 정산 예정·완료 금액을 실시간으로 확인할 수 있어요." },
        { q: "해외에 사는데 등록할 수 있나요?", a: "네. 체르토 드라이브는 해외 한인 기사를 위한 플랫폼입니다. 거주 국가·도시와 서비스 가능 지역을 입력하면 됩니다." },
        { q: "국내(한국)에서 하려면 무엇이 필요한가요?", a: "국내 유상운송은 「여객자동차 운수사업법」에 따라 운송면허가 필요합니다. 택시·렌터카(자동차대여)·전세버스 등 면허 종류와 등록번호, 면허증·보험증서 첨부가 필수입니다." },
        { q: "예약은 어떻게 배정되나요?", a: "고객이 결제를 마친 예약을, 지역·차량 조건에 맞는 기사에게 관리자가 배정합니다. 자동 매칭이 아니라 검증된 배정입니다." },
      ]
    : [
        { q: "How does commission work?", a: "You're settled the supply price (customer fare minus service fee), with a guaranteed minimum booking fee per route. Details appear in your dashboard after approval." },
        { q: "When do I get paid?", a: "Settlement is recorded on trip completion and paid on a regular cycle — track pending and paid amounts in your dashboard." },
        { q: "Can I join from abroad?", a: "Yes — Certo Drive is built for Korean drivers abroad. Just enter your country, city and service regions." },
        { q: "What do I need for Korea?", a: "Domestic paid transport requires a transport licence under Korean law — licence type, number, and licence/insurance documents are required." },
        { q: "How are bookings assigned?", a: "An admin assigns paid bookings to drivers matching the region and vehicle — verified, not blind auto-matching." },
      ];

  const photoBg = (url: string, overlay: string) => ({
    backgroundColor: "var(--color-navy)", backgroundImage: `${overlay}, url(${url})`, backgroundSize: "cover", backgroundPosition: "center",
  });

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="relative text-white overflow-hidden" style={{ backgroundColor: "var(--color-navy)" }}>
        <div className="absolute inset-0" style={photoBg(IMG.meet, "linear-gradient(105deg, rgba(28,25,20,0.94) 0%, rgba(30,27,22,0.8) 45%, rgba(30,27,22,0.5) 100%)")} />
        <div className="container-cd relative py-20 md:py-28 max-w-2xl">
          <p className="eyebrow text-[var(--color-gold)]">{L ? "기사 파트너 모집" : "Drive with Certo"}</p>
          <h1 className="font-display text-4xl md:text-5xl mt-4 leading-tight">
            {L ? "검증된 한인·한국어 기사 네트워크에 합류하세요" : "Join our verified Korean-speaking chauffeur network"}
          </h1>
          <p className="mt-5 text-white/80 text-lg leading-relaxed">
            {L
              ? "전 세계 도시에서 프리미엄 사전 예약 고객을 만나보세요. 확정된 예약, 보장된 최소 수수료, 투명한 정산 — 길에서 기다리지 않는 품격 있는 운행."
              : "Serve premium, pre-booked travelers in cities worldwide — confirmed bookings, guaranteed minimum fees, transparent settlement."}
          </p>
          <div className="mt-8 flex gap-3">
            <a href="#apply" className="btn btn-gold">{L ? "파트너 지원하기" : "Apply now"}</a>
            <a href="#how" className="btn btn-outline text-white border-white/40 hover:bg-white hover:text-[var(--color-navy)]">{L ? "절차 보기" : "How it works"}</a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section">
        <div className="container-cd">
          <div className="max-w-xl">
            <p className="eyebrow">{L ? "파트너 혜택" : "Partner benefits"}</p>
            <h2 className="font-display text-4xl md:text-5xl mt-5 leading-[1.1]">{L ? "기사에게 유리한 구조" : "Built in the driver's favor"}</h2>
          </div>
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
            {benefits.map((b) => (
              <div key={b.t} className="border-t border-[var(--color-line)] pt-6">
                <Icon name={b.icon} size={24} className="text-[var(--color-gold-dark)]" />
                <h3 className="mt-5 font-display text-xl">{b.t}</h3>
                <p className="mt-2.5 text-[15px] text-[var(--color-slate)] leading-relaxed">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="section bg-[var(--color-mist)] scroll-mt-20">
        <div className="container-cd">
          <div className="max-w-xl">
            <p className="eyebrow">{L ? "온보딩 절차" : "Onboarding"}</p>
            <h2 className="font-display text-4xl md:text-5xl mt-5 leading-[1.1]">{L ? "지원부터 정산까지" : "From apply to payout"}</h2>
          </div>
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-14">
            {steps.map((s, i) => (
              <div key={s.t} className="border-t border-[var(--color-line)] pt-6">
                <div className="font-display text-4xl text-[var(--color-gold-dark)]/70">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="mt-4 font-display text-xl">{s.t}</h3>
                <p className="mt-2.5 text-[15px] text-[var(--color-slate)] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="section">
        <div className="container-cd grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden aspect-[4/3] hidden lg:block" style={photoBg(IMG.vipBand, "linear-gradient(180deg, rgba(30,27,22,0.05), rgba(30,27,22,0.35))")} />
          <div>
            <p className="eyebrow">{L ? "자격·서류" : "Requirements"}</p>
            <h2 className="font-display text-3xl md:text-4xl mt-4 leading-tight">{L ? "이런 분을 찾습니다" : "What you'll need"}</h2>
            <ul className="mt-8 grid gap-4">
              {requirements.map((r) => (
                <li key={r} className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 text-[var(--color-gold-dark)]"><Icon name="badge" size={20} /></span>
                  <span className="text-[15px] text-[var(--color-slate)] leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-[var(--color-mist)]">
        <div className="container-cd max-w-3xl">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="font-display text-4xl md:text-5xl mt-5 leading-[1.1]">{L ? "기사 자주 묻는 질문" : "Driver FAQ"}</h2>
          </div>
          <div className="mt-12 divide-y divide-[var(--color-line)] card px-6">
            {faq.map((f) => (
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

      {/* Application form */}
      <section id="apply" className="section scroll-mt-20">
        <div className="container-cd max-w-3xl">
          <div className="text-center mb-10">
            <p className="eyebrow">{L ? "지원서" : "Application"}</p>
            <h2 className="font-display text-4xl md:text-5xl mt-5 leading-[1.1]">{L ? "지금 파트너로 지원하세요" : "Apply to partner with us"}</h2>
          </div>
          <div className="card p-6 md:p-8">
            <DriverRegistrationForm locale={locale} />
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
