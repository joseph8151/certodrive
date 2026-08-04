import PageShell, { Prose } from "@/components/PageShell";
import { getLocale } from "@/lib/locale";

export default async function Cancellation() {
  const locale = await getLocale();
  const L = locale === "ko";
  const sections = L
    ? [
        { h: "무료 취소", body: "이용 예정 시각 기준 48시간 이전 취소 시 전액 환불됩니다." },
        { h: "부분 환불", body: "이용 24~48시간 전 취소 시 결제 금액의 50%가 환불됩니다." },
        { h: "환불 불가", body: "이용 24시간 이내 취소 또는 노쇼의 경우 환불이 어렵습니다. 다만 항공편 결항 등 불가피한 사유는 증빙 확인 후 개별 처리합니다." },
        { h: "항공편 지연", body: "항공편 지연은 항공편 번호로 자동 확인되며, 추가 요금 없이 기사님이 대기합니다." },
        { h: "환불 처리", body: "환불은 원 결제 수단으로 처리되며, 카드사·PayPal 정책에 따라 영업일 기준 5~10일이 소요될 수 있습니다." },
      ]
    : [
        { h: "Free cancellation", body: "Cancel 48+ hours before the scheduled time for a full refund." },
        { h: "Partial refund", body: "Cancel 24–48 hours before for a 50% refund of the amount paid." },
        { h: "Non-refundable", body: "Cancellations within 24 hours or no-shows are generally non-refundable. Unavoidable reasons such as flight cancellations are handled case by case with evidence." },
        { h: "Flight delays", body: "Flight delays are tracked automatically by flight number; your driver waits at no extra charge." },
        { h: "Refund processing", body: "Refunds are issued to the original payment method and may take 5–10 business days per card / PayPal policy." },
      ];
  return (
    <PageShell title={L ? "취소 및 환불 규정" : "Cancellation & refund policy"}>
      <Prose sections={sections} />
    </PageShell>
  );
}
