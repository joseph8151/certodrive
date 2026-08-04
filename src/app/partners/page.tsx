import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DriverRegistrationForm from "@/components/DriverRegistrationForm";
import { getLocale } from "@/lib/locale";

export default async function PartnersPage() {
  const locale = await getLocale();
  const L = locale === "ko";

  const benefits = L
    ? [
        { t: "안정적인 예약 흐름", d: "전 세계 한인 여행객과 기업 고객의 사전 예약을 연결합니다." },
        { t: "정찰제 공급가", d: "직접 공급 가격을 제안하고, 최소 예약 수수료가 보장됩니다." },
        { t: "노쇼 보호", d: "선결제 기반이라 노쇼 위험이 낮고, 증빙 업로드로 보호받습니다." },
        { t: "간편한 정산", d: "운행 완료 후 관리자가 정산을 처리합니다." },
      ]
    : [
        { t: "Steady booking flow", d: "Connect with pre-booked Korean travelers and corporate clients worldwide." },
        { t: "Set your supply price", d: "Propose your own supply price with a guaranteed minimum booking fee." },
        { t: "No-show protection", d: "Prepaid bookings reduce no-show risk, backed by evidence uploads." },
        { t: "Simple settlement", d: "Settlement is processed by admin after each completed trip." },
      ];

  return (
    <>
      <SiteHeader />
      <section className="hero-gradient text-white">
        <div className="container-cd py-16 text-center">
          <p className="eyebrow text-[var(--color-gold)]">{L ? "기사 파트너 모집" : "Drive with Certo"}</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-3 max-w-3xl mx-auto">
            {L ? "검증된 한인·한국어 기사 네트워크에 합류하세요" : "Join our verified Korean-speaking chauffeur network"}
          </h1>
          <p className="mt-4 text-white/75 max-w-2xl mx-auto">
            {L ? "전 세계 도시에서 프리미엄 사전 예약 고객을 만나보세요." : "Serve premium, pre-booked travelers in cities around the world."}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-cd grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold">{L ? "파트너 혜택" : "Partner benefits"}</h2>
            <div className="mt-6 grid gap-5">
              {benefits.map((b) => (
                <div key={b.t}>
                  <div className="flex items-center gap-2 font-semibold"><span className="text-[var(--color-gold)]">◆</span>{b.t}</div>
                  <p className="text-sm text-[var(--color-slate)] mt-1 pl-5">{b.d}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="card p-6 md:p-8">
              <h2 className="font-display text-2xl font-bold mb-6">{L ? "파트너 지원서" : "Partner application"}</h2>
              <DriverRegistrationForm locale={locale} />
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
