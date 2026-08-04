import Link from "next/link";
import PageShell from "@/components/PageShell";
import { getLocale } from "@/lib/locale";

export default async function VIP() {
  const locale = await getLocale();
  const L = locale === "ko";
  const features = L
    ? [
        { t: "VIP 의전 차량", d: "메르세데스 S클래스, BMW 7시리즈 등 최고급 세단 및 프리미엄 밴." },
        { t: "전담 의전 기사", d: "정장 착용, 프로토콜 숙지, 완벽한 한국어·영어 응대." },
        { t: "공항 VIP 서비스", d: "전용 미팅, 수하물 지원, 신속한 안내." },
        { t: "기업 행사·의전", d: "임원 방문, 바이어 의전, 콘퍼런스 단체 이동." },
        { t: "완벽한 프라이버시", d: "정보 보안과 비밀 유지를 최우선으로 합니다." },
        { t: "전용 매니저", d: "예약부터 운행까지 전담 매니저가 관리합니다." },
      ]
    : [
        { t: "VIP chauffeur fleet", d: "Top-tier sedans and premium vans — Mercedes S-Class, BMW 7 Series and more." },
        { t: "Dedicated chauffeurs", d: "Suited, protocol-trained, fluent in Korean and English." },
        { t: "Airport VIP service", d: "Private meet, luggage assistance and expedited guidance." },
        { t: "Corporate & protocol", d: "Executive visits, buyer hospitality, conference group transport." },
        { t: "Total privacy", d: "Information security and discretion come first." },
        { t: "Dedicated manager", d: "A single manager handles everything from booking to the ride." },
      ];
  return (
    <PageShell
      title={L ? "VIP 및 기업 의전" : "VIP & corporate chauffeur"}
      subtitle={L ? "임원, 바이어, 귀빈을 위한 최고 수준의 의전 차량 서비스." : "The highest standard of chauffeur service for executives, buyers and VIP guests."}
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
        {features.map((f) => (
          <div key={f.t} className="card p-6">
            <div className="text-[var(--color-gold)] text-lg">◆</div>
            <h3 className="font-semibold mt-2">{f.t}</h3>
            <p className="text-sm text-[var(--color-slate)] mt-1 leading-relaxed">{f.d}</p>
          </div>
        ))}
      </div>
      <div className="text-center mt-10">
        <Link href="/#book" className="btn btn-gold">{L ? "VIP 예약 문의" : "Request a VIP booking"}</Link>
      </div>
    </PageShell>
  );
}
