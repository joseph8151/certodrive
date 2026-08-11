import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DriverRegistrationForm from "@/components/DriverRegistrationForm";
import Icon from "@/components/Icon";
import { getLocale } from "@/lib/locale";
import { IMG } from "@/lib/images";

export default async function PartnersPage() {
  const locale = await getLocale();
  const L = locale === "ko";

  const Check = () => (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0" aria-hidden>
      <path d="M4 10.5l3.5 3.5L16 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const photoBg = (url: string, overlay: string) => ({
    backgroundColor: "var(--color-graphite)", backgroundImage: `${overlay}, url(${url})`, backgroundSize: "cover", backgroundPosition: "center",
  });

  // Straight-talk answers to the questions drivers actually ask first.
  const facts = L
    ? [
        { t: "가입비 없음", d: "파트너 등록에 가입비가 없습니다." },
        { t: "수락 전 금액 확인", d: "운행을 수락하기 전에 기사 지급액을 확인합니다." },
        { t: "거절 가능", d: "원하지 않는 일정·운행은 거절할 수 있습니다." },
        { t: "플랫폼이 관리", d: "고객 예약·결제·정산은 체르토가 관리합니다." },
      ]
    : [
        { t: "No signup fee", d: "There's no fee to register as a partner." },
        { t: "See pay first", d: "You see your driver earnings before you accept a ride." },
        { t: "Decline freely", d: "You can decline rides and dates you don't want." },
        { t: "Platform-managed", d: "Certo handles customer booking, payment and settlement." },
      ];

  // Registration wizard steps (mirrors the multi-step form fields).
  const regSteps = L
    ? [
        { n: "01", t: "파트너 신청", d: "이름·활동 국가·도시·휴대폰·이메일·사용 언어·운행 가능 지역을 입력합니다." },
        { n: "02", t: "기사 정보", d: "운전 경력, 운송 관련 경력, 공항 픽업 경험, 한국어 가능 수준을 입력합니다." },
        { n: "03", t: "차량 등록", d: "브랜드·모델·연식·차량번호·정원·적재 가능 캐리어 수·색상, 차량 사진(앞·뒤·옆·내부·트렁크)을 등록합니다." },
        { n: "04", t: "서류 제출", d: "운전면허·운송 면허/허가·차량등록증·보험 등 활동 지역에 맞는 서류를 업로드합니다." },
        { n: "05", t: "체르토 검토", d: "신원·운전 자격·차량·보험·운송 자격·한국어 소통·서비스 경험을 관리자가 검토합니다." },
        { n: "06", t: "파트너 승인", d: "심사를 통과하면 Certo Verified Driver 상태가 되고 대시보드를 사용할 수 있습니다." },
      ]
    : [
        { n: "01", t: "Apply", d: "Enter your name, country, city, phone, email, languages and service regions." },
        { n: "02", t: "Driver profile", d: "Driving experience, transport background, airport-pickup experience and Korean level." },
        { n: "03", t: "Vehicle", d: "Make, model, year, plate, capacity, luggage, color, and photos (front, rear, side, interior, trunk)." },
        { n: "04", t: "Documents", d: "Upload the documents required for your region: license, transport permit, registration, insurance." },
        { n: "05", t: "Certo review", d: "We review identity, driving eligibility, vehicle, insurance, transport eligibility, Korean and experience." },
        { n: "06", t: "Approved", d: "Pass review to become a Certo Verified Driver with access to your dashboard." },
      ];

  // How dispatch actually works once approved.
  const opFlow = L
    ? [
        { t: "운행 요청 수신", d: "지역·일정·차량 조건에 맞는 예약이 요청으로 전달됩니다. 픽업·목적지·일시·인원·짐·예상 운행시간·기사 지급액이 표시됩니다." },
        { t: "수락 또는 거절", d: "요청을 확인하고 수락(Accept) 또는 거절(Decline)합니다. 모든 운행을 반드시 받을 필요는 없습니다." },
        { t: "예약 확정", d: "기사가 수락하고 체르토가 최종 확인하면 고객에게 기사 정보가 전달됩니다." },
        { t: "운행 전 확인", d: "항공편·픽업 시간·고객 연락처·미팅 위치·특별 요청을 미리 확인합니다." },
        { t: "고객 픽업", d: "픽업 이동 → 도착 → 탑승 → 운행 시작으로 상태를 업데이트합니다." },
        { t: "운행 완료 · 정산", d: "운행 완료를 누르면 완료 처리되고, 기사 지급액·수수료·정산 상태가 대시보드에 기록됩니다." },
      ]
    : [
        { t: "Receive a request", d: "Bookings matching your region, date and vehicle arrive as requests, showing pickup, destination, time, passengers, bags, estimated drive time and your earnings." },
        { t: "Accept or decline", d: "Review and Accept or Decline. You're not required to take every ride." },
        { t: "Booking confirmed", d: "Once you accept and Certo confirms, your details go to the customer." },
        { t: "Pre-trip check", d: "Review flight, pickup time, customer contact, meeting point and special requests." },
        { t: "Pick up", d: "Update status: heading to pickup → arrived → onboard → trip started." },
        { t: "Complete & settle", d: "Mark the trip complete; earnings, fee and settlement status are recorded in your dashboard." },
      ];

  const earnings = L
    ? [
        "운행을 수락하기 전에 기사 지급액을 확인할 수 있습니다.",
        "원하지 않는 일정은 거절할 수 있습니다.",
        "공항 픽업·장거리·시간제 예약을 받을 수 있습니다.",
        "한국인 여행객과의 언어 문제를 줄일 수 있습니다.",
        "고객 예약과 결제는 체르토가 관리합니다.",
        "정산 내역은 파트너 대시보드에서 확인합니다.",
      ]
    : [
        "See your driver earnings before you accept a ride.",
        "Decline schedules you don't want.",
        "Receive airport, long-distance and hourly bookings.",
        "Fewer language barriers with Korean travelers.",
        "Certo manages customer booking and payment.",
        "Track settlement in your partner dashboard.",
      ];

  const settlement = L
    ? [
        { t: "고객 결제는 누가 받나요?", d: "고객 결제는 체르토가 받아 관리합니다. 기사는 현장에서 요금을 받지 않습니다." },
        { t: "기사 지급액은 언제 확정?", d: "운행을 수락하기 전에 표시되며, 운행 완료 시 정산으로 기록됩니다." },
        { t: "수수료 · 정산 주기", d: "서비스 수수료와 정산 주기는 관리자 정책에 따라 적용되며 대시보드에 표시됩니다." },
        { t: "취소 · 노쇼", d: "취소·노쇼 시 기사 보상 여부는 정책에 따라 처리되며, 노쇼는 증빙 업로드로 보호됩니다." },
        { t: "톨게이트 · 주차 · 추가 대기", d: "톨게이트·주차·추가 대기 처리 기준은 예약 조건과 정책에 따라 안내됩니다." },
      ]
    : [
        { t: "Who collects payment?", d: "Certo collects and manages customer payment. Drivers don't take fares on the day." },
        { t: "When are earnings fixed?", d: "Shown before you accept and recorded as settlement when the trip completes." },
        { t: "Fee & payout cycle", d: "The service fee and payout cycle follow admin policy and are shown in your dashboard." },
        { t: "Cancellations & no-shows", d: "Driver compensation for cancellations/no-shows follows policy; no-shows are protected via evidence upload." },
        { t: "Tolls, parking, waiting", d: "How tolls, parking and extra waiting are handled follows the booking terms and policy." },
      ];

  const whoCanJoin = L
    ? [
        "합법적으로 여객 운송이 가능한 기사",
        "해당 국가·지역의 운송 규정을 준수하는 기사",
        "유효한 보험을 보유한 기사",
        "안전하고 청결한 차량을 운행하는 기사",
        "한국어 또는 한국인 고객과 소통이 가능한 기사",
        "공항 픽업 서비스를 제공할 수 있는 기사",
        "예약 일정을 책임감 있게 관리하는 기사",
      ]
    : [
        "Drivers legally able to carry paying passengers",
        "Compliant with local transport regulations",
        "Holding valid insurance",
        "Operating a safe, clean vehicle",
        "Able to communicate with Korean customers",
        "Able to provide airport pickups",
        "Reliable with booking schedules",
      ];

  const docs = L
    ? [
        { t: "운전면허증", d: "이름·만료일·면허번호가 선명하게 보이는 이미지" },
        { t: "운송 면허 / 허가증", d: "택시·렌터카·전세 등 지역 규정에 따른 영업 자격" },
        { t: "차량등록증", d: "차량 소유·등록 정보" },
        { t: "자동차 · 영업 보험", d: "유상운송이 가능한 보험 증서" },
      ]
    : [
        { t: "Driver license", d: "Clear image showing name, expiry and license number" },
        { t: "Transport permit", d: "Commercial eligibility per local rules (taxi/rental/charter)" },
        { t: "Vehicle registration", d: "Vehicle ownership and registration details" },
        { t: "Vehicle & commercial insurance", d: "Policy that permits paid passenger transport" },
      ];

  const faq = L
    ? [
        { q: "파트너 등록비가 있나요?", a: "없습니다. 파트너 등록과 계정 사용에 가입비를 받지 않습니다." },
        { q: "수수료는 얼마인가요?", a: "고객 요금에서 서비스 수수료를 제외한 금액이 기사 지급액으로 정산됩니다. 구체적 수수료율과 정산 주기는 관리자 정책에 따라 대시보드에 표시됩니다." },
        { q: "운행 가격은 누가 정하나요?", a: "노선별 정찰가는 체르토가 관리하며, 지역에 따라 기사가 공급가를 제안하는 방식도 지원합니다. 어느 경우든 수락 전에 기사 지급액을 확인합니다." },
        { q: "운행 요청을 거절할 수 있나요?", a: "네. 원하지 않는 요청은 거절할 수 있으며, 모든 운행을 반드시 수락해야 하는 구조가 아닙니다." },
        { q: "원하는 날짜에만 일할 수 있나요?", a: "가능합니다. 운행 가능 일정에 맞는 요청만 수락하시면 됩니다." },
        { q: "차량을 여러 대 등록할 수 있나요?", a: "차량 정보는 프로필에 등록하며, 추가 차량·법인 운송업체 등록은 지원팀을 통해 진행할 수 있습니다." },
        { q: "문서 심사는 얼마나 걸리나요?", a: "제출 서류가 확인되면 관리자가 검토합니다. 서류가 명확할수록 승인이 빨라집니다." },
        { q: "고객에게 공개되는 정보는 무엇인가요?", a: "기사 이름·사진·평점·차량 정보·사용 언어 등 프로필 정보가 예약 확정 시 고객에게 전달됩니다." },
        { q: "고객 연락처는 언제 확인하나요?", a: "예약이 확정되어 배정되면 픽업 조율을 위해 고객 연락처와 채팅을 사용할 수 있습니다." },
        { q: "노쇼·취소 시 어떻게 되나요?", a: "노쇼는 증빙 업로드로 보호되며, 취소·노쇼에 대한 보상 여부는 정책에 따라 처리됩니다." },
        { q: "운행 후 고객과 직접 거래해도 되나요?", a: "아니요. 예약·결제·정산은 플랫폼을 통해 이뤄져야 하며, 플랫폼 외 직거래는 정책상 제한됩니다." },
        { q: "문제가 생기면 누구에게 연락하나요?", a: "기사 지원 채널(고객지원 페이지·이메일)로 연락하시면 체르토가 지원합니다." },
      ]
    : [
        { q: "Is there a signup fee?", a: "No. There's no fee to register or use your partner account." },
        { q: "What's the commission?", a: "You're settled the fare minus a service fee. The exact rate and payout cycle follow admin policy and appear in your dashboard." },
        { q: "Who sets the fare?", a: "Certo manages fixed route pricing, and in some regions you can propose a supply price. Either way you see your earnings before accepting." },
        { q: "Can I decline rides?", a: "Yes — decline requests you don't want. You're not required to accept every ride." },
        { q: "Can I work only on chosen dates?", a: "Yes. Accept only the requests that fit your availability." },
        { q: "Can I register multiple vehicles?", a: "Register your vehicle in your profile; additional vehicles and fleet/company accounts can be arranged via support." },
        { q: "How long does document review take?", a: "An admin reviews once your documents are submitted — clearer documents mean faster approval." },
        { q: "What's shared with customers?", a: "Your name, photo, rating, vehicle and languages are shared with the customer on confirmation." },
        { q: "When do I see the customer's contact?", a: "Once the booking is confirmed and assigned, you can use the customer's contact and chat to coordinate pickup." },
        { q: "What about no-shows and cancellations?", a: "No-shows are protected via evidence upload; compensation for cancellations/no-shows follows policy." },
        { q: "Can I deal with the customer directly after a trip?", a: "No. Booking, payment and settlement must go through the platform; off-platform dealing is restricted by policy." },
        { q: "Who do I contact for problems?", a: "Reach the driver support channel (support page/email) and Certo will help." },
      ];

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="relative text-white overflow-hidden" style={{ backgroundColor: "var(--color-graphite)" }}>
        <div className="absolute inset-0" style={photoBg(IMG.meet, "linear-gradient(103deg, rgba(17,17,17,0.95) 0%, rgba(17,17,17,0.82) 46%, rgba(17,17,17,0.5) 100%)")} />
        <div className="container-cd relative py-16 md:py-24 max-w-2xl">
          <div className="inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60">
            <span className="w-4 h-px bg-white/50" />{L ? "기사 파트너" : "Drive with Certo"}
          </div>
          <h1 className="font-display text-[1.9rem] sm:text-[2.4rem] md:text-[3rem] mt-5 leading-[1.1]">
            {L ? "한국인 여행객의 이동을 함께할 파트너를 찾습니다" : "Partner with Certo to move Korean travelers"}
          </h1>
          <p className="mt-6 text-white/70 text-lg leading-relaxed">
            {L
              ? "체르토 드라이브는 해외 각 도시의 한국인·한국어 가능 전문 드라이버와 협력합니다. 예약이 발생하면 지역의 승인된 파트너 기사에게 운행 요청을 전달하고, 배차·정산은 플랫폼이 관리합니다."
              : "Certo works with Korean and Korean-speaking professional drivers across world cities. When a booking comes in, we send the request to approved local partners — and the platform manages dispatch and settlement."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#apply" className="btn btn-gold">{L ? "파트너 지원하기" : "Apply to drive"}</a>
            <a href="#how" className="btn btn-outline text-white border-white/40 hover:bg-white hover:text-[var(--color-graphite)]">{L ? "운영 방식 보기" : "How it works"}</a>
          </div>
        </div>
      </section>

      {/* Straight facts strip */}
      <section className="border-b border-[var(--color-line)]">
        <div className="container-cd grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--color-line)]">
          {facts.map((f) => (
            <div key={f.t} className="bg-[var(--color-bg)] p-6">
              <div className="flex items-center gap-2 font-semibold"><span className="text-[var(--color-ink)]"><Check /></span>{f.t}</div>
              <p className="mt-2 text-sm text-[var(--color-slate)] leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Registration steps */}
      <section className="section">
        <div className="container-cd">
          <div className="max-w-xl">
            <p className="eyebrow">{L ? "등록 절차" : "Registration"}</p>
            <h2 className="font-display text-[2.1rem] md:text-[2.7rem] mt-5">{L ? "가입은 6단계입니다" : "Six steps to get on the road"}</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
            {regSteps.map((s) => (
              <div key={s.n} className="border-t border-[var(--color-line-strong)] pt-5">
                <div className="font-display text-3xl">{s.n}</div>
                <h3 className="mt-3 font-semibold text-lg">{s.t}</h3>
                <p className="mt-2 text-[15px] text-[var(--color-slate)] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How dispatch works + sample ride card */}
      <section id="how" className="section bg-[var(--color-mist)] scroll-mt-20">
        <div className="container-cd grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-start">
          <div>
            <p className="eyebrow">{L ? "운영 방식" : "How it works"}</p>
            <h2 className="font-display text-[2.1rem] md:text-[2.7rem] mt-5">{L ? "가입 후, 이렇게 운행합니다" : "How you drive once approved"}</h2>
            <div className="mt-10 grid gap-6">
              {opFlow.map((s, i) => (
                <div key={s.t} className="flex gap-4">
                  <div className="font-display text-lg w-8 shrink-0 text-[var(--color-ink)]">{String(i + 1).padStart(2, "0")}</div>
                  <div className="border-t border-[var(--color-line-strong)] pt-1 flex-1">
                    <h3 className="font-semibold">{s.t}</h3>
                    <p className="mt-1.5 text-[15px] text-[var(--color-slate)] leading-relaxed">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sample NEW RIDE request card */}
          <div className="lg:sticky lg:top-24">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <span className="chip bg-[var(--color-ink)] text-[var(--color-accent)] border-[var(--color-ink)]">{L ? "새 운행 요청" : "New ride"}</span>
                <span className="text-xs text-[var(--color-slate)]">{L ? "예시" : "Sample"}</span>
              </div>
              <div className="mt-5 flex items-start gap-4">
                <div className="flex flex-col items-center pt-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent-strong)]" />
                  <span className="w-px flex-1 my-1 border-l border-dashed border-[var(--color-line-strong)] min-h-[38px]" />
                  <span className="h-2.5 w-2.5 rounded-full ring-2 ring-[var(--color-slate-400)]" />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] text-[var(--color-slate)] uppercase tracking-wider">CDG Airport</div>
                  <div className="font-semibold">Charles de Gaulle</div>
                  <div className="my-2.5 text-[12px] text-[var(--color-slate)]">Aug 28 · 14:30 · ≈ 45–60 min</div>
                  <div className="text-[11px] text-[var(--color-slate)] uppercase tracking-wider">Paris 8e</div>
                  <div className="font-semibold">Central Paris</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[[L ? "승객" : "Pax", "2"], [L ? "짐" : "Bags", "3"], [L ? "차량" : "Class", "E-Class"]].map(([a, b]) => (
                  <div key={a} className="rounded-lg bg-[var(--color-mist)] py-2">
                    <div className="text-[11px] text-[var(--color-slate)]">{a}</div>
                    <div className="text-[13px] font-semibold">{b}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[var(--color-line)] pt-4">
                <span className="text-sm text-[var(--color-slate)]">{L ? "기사 지급액" : "Driver earnings"}</span>
                <span className="font-display text-xl">€ —</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="btn btn-outline text-sm" disabled>{L ? "거절" : "Decline"}</button>
                <button className="btn btn-primary text-sm" disabled>{L ? "운행 수락" : "Accept ride"}</button>
              </div>
              <p className="mt-3 text-[11px] text-[var(--color-slate)] text-center">{L ? "수락 전에 정확한 지급액이 표시됩니다." : "The exact amount is shown before you accept."}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings — honest structure */}
      <section className="section">
        <div className="container-cd grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="eyebrow">{L ? "수익 구조" : "Earnings"}</p>
            <h2 className="font-display text-[2.1rem] md:text-[2.7rem] mt-5">{L ? "막연한 약속이 아니라, 구조로 설명합니다" : "Structure, not slogans"}</h2>
            <p className="mt-5 text-[var(--color-slate)] leading-relaxed max-w-md">
              {L ? "“높은 수익”을 약속하지 않습니다. 대신 실제로 제공되는 것만 명확히 안내합니다." : "We don't promise “high earnings.” We tell you exactly what the platform provides."}
            </p>
          </div>
          <ul className="grid gap-3">
            {earnings.map((e) => (
              <li key={e} className="flex items-start gap-3 rounded-xl border border-[var(--color-line)] bg-white px-4 py-3.5">
                <span className="grid place-items-center w-5 h-5 rounded-full bg-[var(--color-ink)] text-[var(--color-accent)] mt-0.5"><Check /></span>
                <span className="text-[15px]">{e}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Settlement */}
      <section className="section bg-[var(--color-graphite)] text-white">
        <div className="container-cd">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60">
              <span className="w-4 h-px bg-white/50" />{L ? "정산" : "Settlement"}
            </div>
            <h2 className="font-display text-[2.1rem] md:text-[2.7rem] mt-4">{L ? "정산은 이렇게 관리됩니다" : "How settlement is managed"}</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
            {settlement.map((s) => (
              <div key={s.t} className="border-t border-white/12 pt-5">
                <h3 className="font-semibold">{s.t}</h3>
                <p className="mt-2 text-[15px] text-white/65 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-white/45 max-w-2xl">
            {L ? "수수료율·정산 주기 등 확정되지 않은 세부 정책은 관리자 설정에 따라 대시보드에 표시됩니다." : "Details such as fee rate and payout cycle follow admin settings and appear in your dashboard."}
          </p>
        </div>
      </section>

      {/* Who can join + documents */}
      <section className="section">
        <div className="container-cd grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <p className="eyebrow">{L ? "등록 조건" : "Who can join"}</p>
            <h2 className="font-display text-[2.1rem] md:text-3xl mt-5">{L ? "이런 분과 함께합니다" : "Who can partner"}</h2>
            <ul className="mt-8 grid gap-3">
              {whoCanJoin.map((r) => (
                <li key={r} className="flex items-start gap-3">
                  <span className="text-[var(--color-ink)] mt-0.5"><Check /></span>
                  <span className="text-[15px] text-[var(--color-slate)] leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-[var(--color-slate)]">
              {L ? "국가·지역마다 법규가 다르므로, 요구되는 서류는 활동 지역에 따라 달라질 수 있습니다." : "Requirements vary by country and region, so the exact documents depend on where you operate."}
            </p>
          </div>
          <div>
            <p className="eyebrow">{L ? "필요 서류" : "Documents"}</p>
            <h2 className="font-display text-[2.1rem] md:text-3xl mt-5">{L ? "업로드할 서류" : "What to upload"}</h2>
            <div className="mt-8 grid gap-3">
              {docs.map((d) => (
                <div key={d.t} className="rounded-xl border border-[var(--color-line)] bg-white p-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">{d.t}</div>
                    <p className="mt-1 text-sm text-[var(--color-slate)] leading-relaxed">{d.d}</p>
                  </div>
                  <span className="chip shrink-0">{L ? "PDF · JPG · PNG" : "PDF · JPG · PNG"}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13px] text-[var(--color-slate)]">
              {L ? "각 서류는 검토 후 확인 · 반려 · 만료 상태로 표시되며, 반려 시 사유와 함께 재업로드할 수 있습니다." : "Each document shows a Verified / Rejected / Expired status after review, with a reason and re-upload if rejected."}
            </p>
          </div>
        </div>
      </section>

      {/* Driver FAQ */}
      <section className="section bg-[var(--color-mist)]">
        <div className="container-cd grid lg:grid-cols-[0.7fr_1.3fr] gap-10 lg:gap-16">
          <div className="lg:sticky lg:top-24 self-start">
            <p className="eyebrow">FAQ</p>
            <h2 className="font-display text-[2.1rem] md:text-[2.7rem] mt-5">{L ? "기사 자주 묻는 질문" : "Driver FAQ"}</h2>
            <p className="mt-4 text-[var(--color-slate)]">{L ? "더 궁금한 점은 지원팀에 문의하세요." : "Anything else — reach the support team."}</p>
            <a href="mailto:support@certodrive.com" className="btn btn-outline mt-6 text-sm">support@certodrive.com</a>
          </div>
          <div className="divide-y divide-[var(--color-line)] border-t border-[var(--color-line)]">
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

      {/* Application form */}
      <section id="apply" className="section pt-0 scroll-mt-20">
        <div className="container-cd max-w-3xl">
          <div className="mb-8">
            <p className="eyebrow">{L ? "지원서" : "Application"}</p>
            <h2 className="font-display text-[2.1rem] md:text-[2.7rem] mt-5">{L ? "지금 파트너로 지원하세요" : "Apply to partner with us"}</h2>
            <p className="mt-4 text-[var(--color-slate)]">{L ? "기본 정보를 입력하면 관리자가 검토 후 안내드립니다." : "Enter your details and an admin will review and follow up."}</p>
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
