import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/Icon";
import { getLocale } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Certo Verified — 기사 검증 프로그램",
    description: "Certo Verified는 신원·운전 자격·해당 지역 운송 자격·보험·차량·한국어 소통을 확인하는 체르토 드라이브의 기사 검증 프로그램입니다.",
  };
}

export default async function VerifiedPage() {
  const locale = await getLocale();
  const L = locale === "ko";

  const Check = () => (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0" aria-hidden>
      <path d="M4 10.5l3.5 3.5L16 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const criteria = L
    ? [
        { t: "신원 확인", d: "본인 확인 절차를 거친 기사만 등록됩니다." },
        { t: "운전 자격", d: "유효한 운전면허를 확인합니다." },
        { t: "운송 자격", d: "해당 국가·지역에서 요구되는 유상운송 자격을 확인합니다. (규정은 지역마다 다릅니다)" },
        { t: "보험", d: "유상운송이 가능한 유효한 보험을 확인합니다." },
        { t: "차량", d: "차량 등록·상태와 사진을 확인합니다." },
        { t: "한국어 소통", d: "한국 고객과 소통할 수 있는 한국어 수준을 확인합니다." },
        { t: "서비스 지역", d: "실제 운행 가능한 도시·공항·지역을 확인합니다." },
      ]
    : [
        { t: "Identity", d: "Only drivers who pass an identity check are registered." },
        { t: "Driver license", d: "We verify a valid driver's license." },
        { t: "Transport eligibility", d: "We confirm the paid-transport authorization required in that country/region. (Rules differ by location.)" },
        { t: "Insurance", d: "We verify valid insurance that permits paid passenger transport." },
        { t: "Vehicle", d: "We check vehicle registration, condition and photos." },
        { t: "Korean communication", d: "We verify a Korean level suitable for Korean customers." },
        { t: "Service area", d: "We confirm the cities, airports and regions actually served." },
      ];

  const lifecycle = L
    ? [
        { t: "제출", d: "기사가 서류를 업로드합니다. (PDF·JPG·PNG)" },
        { t: "검토", d: "관리자가 각 서류를 확인합니다." },
        { t: "상태 표시", d: "각 서류는 확인 · 반려 · 만료 상태로 표시됩니다." },
        { t: "갱신", d: "만료가 임박하면 재업로드로 갱신합니다. 반려 시 사유와 함께 다시 제출합니다." },
      ]
    : [
        { t: "Submit", d: "The driver uploads documents (PDF/JPG/PNG)." },
        { t: "Review", d: "An admin reviews each document." },
        { t: "Status", d: "Each document shows Verified / Rejected / Expired." },
        { t: "Renew", d: "Expiring documents are renewed by re-upload; rejected ones are resubmitted with a reason." },
    ];

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="bg-[var(--color-graphite)] text-white">
        <div className="container-cd py-16 md:py-24 max-w-2xl">
          <div className="inline-flex items-center gap-2 chip bg-[var(--color-ink)] border-white/15 text-white">
            <Icon name="shield" size={13} /> Certo Verified
          </div>
          <h1 className="font-display font-semibold text-[1.7rem] md:text-[2.4rem] mt-5 leading-[1.12]">
            {L ? "검증된 기사만, 당신의 이동을 맡습니다" : "Only verified drivers handle your ride"}
          </h1>
          <p className="mt-5 text-white/70 leading-relaxed">
            {L
              ? "Certo Verified는 체르토 드라이브의 기사 검증 프로그램입니다. 단순한 체크 표시가 아니라, 신원부터 해당 지역의 운송 자격까지 확인한 기사에게만 부여됩니다."
              : "Certo Verified is our driver verification program. It's not just a checkmark — it's granted only to drivers we've checked, from identity to the transport eligibility their region requires."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/#book" className="btn btn-gold">{L ? "요금 확인" : "Get a quote"}</Link>
            <Link href="/partners" className="btn btn-outline text-white border-white/40 hover:bg-white hover:text-[var(--color-graphite)]">{L ? "기사로 지원" : "Become a driver"}</Link>
          </div>
        </div>
      </section>

      {/* What we verify */}
      <section className="section">
        <div className="container-cd">
          <div className="max-w-xl">
            <p className="eyebrow">{L ? "검증 기준" : "What we verify"}</p>
            <h2 className="font-display text-[1.55rem] md:text-[1.95rem] mt-5">{L ? "무엇을 확인하나요" : "What Certo checks"}</h2>
            <p className="mt-4 text-[var(--color-slate)]">{L ? "국가마다 유상운송 규정이 다르므로, 운송 자격은 해당 국가·지역 기준으로 확인합니다. 한국 기준을 전 세계에 동일하게 적용하지 않습니다." : "Because paid-transport rules differ by country, transport eligibility is checked against local requirements — we don't apply one country's rules everywhere."}</p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
            {criteria.map((c) => (
              <div key={c.t} className="border-t border-[var(--color-line)] pt-5">
                <div className="grid place-items-center w-6 h-6 rounded-full bg-[var(--color-ink)] text-[var(--color-accent)]"><Check /></div>
                <h3 className="mt-4 font-semibold">{c.t}</h3>
                <p className="mt-1.5 text-[15px] text-[var(--color-slate)] leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="section pt-0">
        <div className="container-cd grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="eyebrow">{L ? "이유" : "Why"}</p>
            <h2 className="font-display text-[1.55rem] md:text-[1.95rem] mt-5">{L ? "왜 검증하나요" : "Why we verify"}</h2>
            <p className="mt-4 text-[var(--color-slate)] leading-relaxed">
              {L ? "낯선 도시에서 처음 만나는 기사에게 이동을 맡기는 일은 신뢰가 전부입니다. 검증은 그 신뢰의 최소 조건이며, 문제가 생겼을 때 체르토가 책임지고 지원하기 위한 기반입니다." : "Trusting a stranger with your ride in an unfamiliar city comes down to trust. Verification is the baseline for that trust — and the foundation for Certo to step in when something goes wrong."}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-slate)]">{L ? "예시 프로필" : "Sample profile"}</span>
              <span className="chip bg-[var(--color-ink)] text-white border-[var(--color-ink)]"><Icon name="shield" size={12} /> Certo Verified</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {(L ? [["신원", "확인"], ["면허", "확인"], ["운송 자격", "확인"], ["보험", "확인"], ["차량", "확인"], ["한국어", "확인"]] : [["Identity", "OK"], ["License", "OK"], ["Transport", "OK"], ["Insurance", "OK"], ["Vehicle", "OK"], ["Korean", "OK"]]).map(([a, b]) => (
                <div key={a} className="rounded-lg bg-[var(--color-mist)] py-2">
                  <div className="text-[11px] text-[var(--color-slate)]">{a}</div>
                  <div className="text-[13px] font-semibold text-[#1f6b3f]">{b}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Document lifecycle */}
      <section className="section pt-0">
        <div className="container-cd">
          <div className="max-w-xl">
            <p className="eyebrow">{L ? "서류 관리" : "Documents"}</p>
            <h2 className="font-display text-[1.55rem] md:text-[1.95rem] mt-5">{L ? "서류는 이렇게 관리됩니다" : "How documents are managed"}</h2>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">
            {lifecycle.map((s, i) => (
              <div key={s.t} className="border-t border-[var(--color-line-strong)] pt-5">
                <div className="font-display text-2xl">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="mt-3 font-semibold">{s.t}</h3>
                <p className="mt-1.5 text-[15px] text-[var(--color-slate)] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {(L ? ["확인", "반려", "만료"] : ["Verified", "Rejected", "Expired"]).map((s, i) => (
              <span key={s} className={`pill ${i === 0 ? "pill-green" : i === 1 ? "pill-red" : "pill-amber"}`}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
