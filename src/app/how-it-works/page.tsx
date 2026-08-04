import PageShell from "@/components/PageShell";
import { getLocale } from "@/lib/locale";

export default async function HowItWorks() {
  const locale = await getLocale();
  const L = locale === "ko";

  const steps = L
    ? [
        { n: "01", t: "이동 정보 입력", d: "홈페이지 예약창에 픽업·목적지·일시·차량 정보를 입력합니다. 등록된 노선은 즉시 가격이 표시되고, 미등록 지역은 견적 요청으로 접수됩니다." },
        { n: "02", t: "견적 및 기사 확인", d: "미등록 지역은 해당 지역 파트너 기사에게 자동으로 요청이 전송되고, 기사가 공급 가격과 가능 여부를 제출합니다. 관리자가 최종 고객 가격을 확정합니다." },
        { n: "03", t: "온라인 선결제", d: "확정된 정찰제 요금을 해외 카드 또는 PayPal로 안전하게 선결제합니다. 숨겨진 비용이 없습니다." },
        { n: "04", t: "기사 배정 및 바우처", d: "관리자가 검증된 기사를 배정하고, 고객과 기사에게 각각 예약 바우처를 발송합니다." },
        { n: "05", t: "공항 미팅 및 운행", d: "기사님이 입국장에서 이름 피켓으로 안내합니다. 항공편 지연도 확인해 대기합니다." },
        { n: "06", t: "운행 완료 및 후기", d: "안전하게 도착하면 운행이 완료되고, 후기를 남길 수 있습니다. 문제가 생기면 Certo Drive가 직접 대응합니다." },
      ]
    : [
        { n: "01", t: "Enter trip details", d: "Enter pickup, destination, date and vehicle in the booking widget. Registered routes show an instant price; other areas are received as a quote." },
        { n: "02", t: "Quote & driver check", d: "For unregistered areas we automatically notify partner drivers, who submit their supply price and availability. An admin confirms the final customer price." },
        { n: "03", t: "Prepay online", d: "Pay the fixed, all-in price securely by international card or PayPal. No hidden fees." },
        { n: "04", t: "Driver assigned & voucher", d: "An admin assigns a verified driver and issues booking vouchers to both customer and driver." },
        { n: "05", t: "Airport meet & ride", d: "Your chauffeur greets you at arrivals with a name board and tracks your flight for delays." },
        { n: "06", t: "Completion & review", d: "The trip completes on safe arrival and you can leave a review. If anything goes wrong, Certo Drive steps in directly." },
      ];

  return (
    <PageShell
      title={L ? "이용 방법" : "How it works"}
      subtitle={L ? "예약부터 공항 미팅까지, Certo Drive의 관리형 예약 절차를 안내합니다." : "From booking to airport meet & greet — how our managed booking process works."}
    >
      <div className="max-w-3xl mx-auto grid gap-8">
        {steps.map((s) => (
          <div key={s.n} className="flex gap-5">
            <div className="font-display text-3xl font-bold text-[var(--color-gold)] shrink-0 w-14">{s.n}</div>
            <div>
              <h3 className="font-semibold text-lg">{s.t}</h3>
              <p className="text-[var(--color-slate)] mt-1 leading-relaxed">{s.d}</p>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
