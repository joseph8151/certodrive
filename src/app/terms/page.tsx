import PageShell, { Prose } from "@/components/PageShell";
import { getLocale } from "@/lib/locale";

export default async function Terms() {
  const locale = await getLocale();
  const L = locale === "ko";
  const sections = L
    ? [
        { h: "1. 서비스 개요", body: "Certo Drive는 전 세계 주요 도시에서 검증된 한인 및 한국어 가능 기사 또는 현지 기사를 사전 예약으로 연결하는 관리형 차량 예약 플랫폼입니다. 실시간 택시 호출 서비스가 아닙니다." },
        { h: "2. 예약 및 결제", body: "고객은 예약창에 이동 정보를 입력하고, 확정된 정찰제 요금을 선결제합니다. 결제는 Certo Drive가 수취하며, 운행 완료 후 기사 정산이 처리됩니다." },
        { h: "3. 기사 파트너", body: "기사 파트너는 면허·보험·차량 서류를 제출하고 관리자 승인 후 예약 요청을 받습니다. 파트너는 제출한 공급 가격과 가능 여부에 따라 배정됩니다." },
        { h: "4. 책임 범위", body: "Certo Drive는 예약 중개 및 관리 서비스를 제공하며, 운행 중 발생하는 문제에 대해 고객과 기사 사이에서 직접 대응합니다. 세부 책임 범위는 예약 확정 시 안내됩니다." },
        { h: "5. 개인정보", body: "고객 및 기사의 개인정보는 암호화되어 안전하게 관리되며, 예약 이행 목적으로만 사용됩니다. 자세한 내용은 개인정보 처리방침을 참고하세요." },
      ]
    : [
        { h: "1. Service overview", body: "Certo Drive is a managed booking platform connecting travelers with pre-booked, verified Korean-speaking or local chauffeurs in major cities worldwide. It is not a real-time taxi-hailing service." },
        { h: "2. Booking & payment", body: "Customers enter trip details and prepay the confirmed fixed price. Payment is collected by Certo Drive; driver settlement is processed after trip completion." },
        { h: "3. Driver partners", body: "Partners submit license, insurance and vehicle documents and receive requests after admin approval. Assignment is based on the supply price and availability they submit." },
        { h: "4. Scope of liability", body: "Certo Drive provides booking intermediation and management, and responds directly between customer and driver for issues during a trip. Detailed terms are provided at booking confirmation." },
        { h: "5. Privacy", body: "Customer and driver personal data is encrypted and used solely to fulfil bookings. See our Privacy Policy for details." },
      ];
  return (
    <PageShell title={L ? "이용약관" : "Terms of Service"}>
      <Prose sections={sections} />
    </PageShell>
  );
}
