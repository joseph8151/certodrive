import PageShell from "@/components/PageShell";
import SimpleForm from "@/components/SimpleForm";
import Icon from "@/components/Icon";
import { getLocale } from "@/lib/locale";

export default async function Corporate() {
  const locale = await getLocale();
  const L = locale === "ko";

  const benefits = L
    ? [
        { icon: "tag", t: "통합 예약·월별 정산", d: "임직원 개별 예약을 한곳에서 관리하고, 매월 한 장의 청구서로 정산합니다. 부서·프로젝트별 비용 구분도 지원합니다." },
        { icon: "badge", t: "기업·여행사 전용 요금", d: "이용 규모에 따른 협약 요금을 제공합니다. 여행사는 상품에 연계할 수 있는 넷요금(net rate)으로 마진 설계가 가능합니다." },
        { icon: "board", t: "다수 예약 일괄 관리", d: "콘퍼런스·단체 방문 시 수십 건의 이동을 한 번에 등록하고, 배차 현황을 실시간으로 확인합니다." },
        { icon: "chat", t: "전담 매니저·우선 지원", d: "계정마다 전담 매니저가 배정되어 예약·변경·긴급 상황을 우선 처리합니다. 24시간 한국어 지원." },
        { icon: "shield", t: "임직원·고객 의전", d: "바이어 영접, 임원 출장, VIP 고객 이동까지 격에 맞는 의전 차량과 검증된 기사로 대응합니다." },
        { icon: "globe", t: "전 세계 동일 기준", d: "서울부터 파리·도쿄·뉴욕까지, 어느 도시에서나 같은 품질과 정산 체계로 이용할 수 있습니다." },
      ]
    : [
        { icon: "tag", t: "Unified booking & monthly billing", d: "Manage every employee booking in one place and settle with a single monthly invoice, split by team or project." },
        { icon: "badge", t: "Corporate & agency rates", d: "Negotiated pricing by volume — agencies get net rates to build their own margin into packages." },
        { icon: "board", t: "Bulk booking management", d: "Register dozens of rides at once for conferences and group visits, and track dispatch in real time." },
        { icon: "chat", t: "Dedicated manager & priority", d: "Every account gets a dedicated manager who handles bookings, changes and emergencies first — 24/7 in Korean." },
        { icon: "shield", t: "Executive & client protocol", d: "Buyer welcomes, executive trips and VIP transfers, all with fitting vehicles and vetted drivers." },
        { icon: "globe", t: "One standard worldwide", d: "From Seoul to Paris, Tokyo and New York — the same quality and billing everywhere." },
      ];

  const steps = L
    ? [
        { t: "제휴 신청", d: "아래 양식으로 회사 정보와 이용 규모를 알려주세요." },
        { t: "협약·요금 설정", d: "담당 매니저가 전용 요금과 정산 조건을 협의합니다." },
        { t: "계정 개설", d: "통합 예약 계정과 전담 채널을 개설해 드립니다." },
        { t: "운영·정산", d: "예약을 이용하고 매월 통합 정산서를 받습니다." },
      ]
    : [
        { t: "Apply", d: "Tell us your company and expected volume via the form below." },
        { t: "Agree on rates", d: "Your manager sets up dedicated pricing and billing terms." },
        { t: "Account setup", d: "We open a unified booking account and a direct channel." },
        { t: "Run & settle", d: "Book as needed and receive one consolidated invoice monthly." },
      ];

  return (
    <PageShell
      title={L ? "기업·여행사 제휴" : "Corporate & travel-agency partnerships"}
      subtitle={L ? "임직원 출장, 고객 의전, 여행 상품 연계를 위한 통합 예약 솔루션. 전용 요금과 월별 정산, 전담 매니저를 제공합니다." : "A unified booking solution for business travel, client transfers and tour packages — with dedicated rates, monthly billing and a personal manager."}
    >
      {/* Benefits */}
      <section className="mb-16">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center">{L ? "제휴 혜택" : "Partner benefits"}</h2>
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b) => (
            <div key={b.t} className="card lift p-6">
              <div className="h-11 w-11 rounded-full bg-[var(--color-navy)] text-[var(--color-gold)] flex items-center justify-center"><Icon name={b.icon} size={20} /></div>
              <h3 className="mt-4 font-semibold">{b.t}</h3>
              <p className="mt-2 text-sm text-[var(--color-slate)] leading-relaxed">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="mb-16">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center">{L ? "제휴 절차" : "How partnership works"}</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={s.t}>
              <div className="font-display text-4xl font-bold text-[var(--color-gold)]/90">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-2 font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-[var(--color-slate)] leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Inquiry form */}
      <section className="max-w-2xl mx-auto card p-7">
        <h2 className="font-semibold text-lg mb-1">{L ? "제휴 문의" : "Partnership inquiry"}</h2>
        <p className="text-sm text-[var(--color-slate)] mb-5">{L ? "아래 정보를 남겨주시면 담당 매니저가 1영업일 내에 연락드립니다." : "Leave your details and a manager will reach out within one business day."}</p>
        <SimpleForm
          endpoint="/api/corporate"
          locale={locale}
          submitLabel={L ? "제휴 신청" : "Submit inquiry"}
          successMessage={L ? "제휴 신청이 접수되었습니다. 담당자가 연락드리겠습니다." : "Received — our team will be in touch shortly."}
          fields={[
            { name: "companyName", label: L ? "회사명" : "Company", required: true },
            { name: "contactName", label: L ? "담당자명" : "Contact name", required: true },
            { name: "email", label: L ? "이메일" : "Email", type: "email", required: true },
            { name: "phone", label: L ? "전화번호" : "Phone" },
            { name: "partnerType", label: L ? "제휴 유형" : "Type", type: "select", options: [
              { value: "CORPORATE", label: L ? "기업" : "Corporate" },
              { value: "TRAVEL_AGENCY", label: L ? "여행사" : "Travel agency" },
            ] },
            { name: "country", label: L ? "국가" : "Country" },
            { name: "note", label: L ? "요청 사항" : "Notes", type: "textarea" },
          ]}
        />
      </section>
    </PageShell>
  );
}
