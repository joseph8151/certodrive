import PageShell, { Prose } from "@/components/PageShell";
import { getLocale } from "@/lib/locale";

export default async function Privacy() {
  const locale = await getLocale();
  const L = locale === "ko";
  const sections = L
    ? [
        { h: "수집 항목", body: "예약 이행에 필요한 이름, 이메일, 전화번호, 메신저 연락처, 이동 정보(픽업·목적지·항공편)를 수집합니다. 기사 파트너의 경우 면허·보험·차량 서류 및 정산 정보를 수집합니다." },
        { h: "이용 목적", body: "수집된 정보는 예약 처리, 기사 배정, 결제 및 정산, 고객지원, 서비스 개선 목적으로만 사용됩니다." },
        { h: "보관 및 암호화", body: "개인정보는 암호화되어 안전하게 저장되며, 접근은 권한이 부여된 관리자로 제한됩니다. 모든 관리자 작업은 감사 로그로 기록됩니다." },
        { h: "제3자 제공", body: "예약 이행을 위해 배정된 기사에게 필요한 최소한의 정보만 제공됩니다. 그 외 목적의 제3자 제공은 하지 않습니다." },
        { h: "고객 권리", body: "고객은 언제든지 본인 정보의 조회·수정·삭제를 요청할 수 있습니다. support@certodrive.com 으로 문의해 주세요." },
      ]
    : [
        { h: "What we collect", body: "For booking fulfilment we collect name, email, phone, messenger contact and trip details (pickup, destination, flight). For driver partners we collect license, insurance and vehicle documents and settlement details." },
        { h: "How we use it", body: "Data is used solely for booking processing, driver assignment, payment and settlement, customer support and service improvement." },
        { h: "Storage & encryption", body: "Personal data is encrypted and stored securely, with access limited to authorized admins. All admin actions are recorded in an audit log." },
        { h: "Third parties", body: "Only the minimum information needed is shared with the assigned driver to fulfil the booking. We do not share data with third parties for other purposes." },
        { h: "Your rights", body: "You may request access, correction or deletion of your data at any time at support@certodrive.com." },
      ];
  return (
    <PageShell title={L ? "개인정보 처리방침" : "Privacy policy"}>
      <Prose sections={sections} />
    </PageShell>
  );
}
