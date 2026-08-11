import Link from "next/link";
import PageShell from "@/components/PageShell";
import SimpleForm from "@/components/SimpleForm";
import { getLocale } from "@/lib/locale";

export default async function Support() {
  const locale = await getLocale();
  const L = locale === "ko";

  const riderTopics = L
    ? [
        { t: "예약 확인", d: "예약번호로 상태를 확인합니다.", href: "/lookup" },
        { t: "예약 변경", d: "날짜·시간·인원 변경 요청.", href: "/lookup" },
        { t: "취소·환불", d: "취소 규정과 환불 절차.", href: "/cancellation" },
        { t: "기사 연락", d: "배정된 기사와 채팅·연락.", href: "/lookup" },
        { t: "공항 픽업", d: "미팅 포인트와 피켓 안내.", href: "/how-it-works" },
        { t: "결제", d: "결제 수단과 영수증 문의.", href: "#contact" },
        { t: "분실물", d: "차량 내 분실물 신고.", href: "#contact" },
        { t: "불만·신고", d: "운행 관련 불만 접수.", href: "#contact" },
      ]
    : [
        { t: "Check a booking", d: "Look up status by reference.", href: "/lookup" },
        { t: "Change a booking", d: "Request date/time/passenger changes.", href: "/lookup" },
        { t: "Cancel & refund", d: "Cancellation policy and refunds.", href: "/cancellation" },
        { t: "Contact driver", d: "Chat with your assigned driver.", href: "/lookup" },
        { t: "Airport pickup", d: "Meeting point and name board.", href: "/how-it-works" },
        { t: "Payment", d: "Payment methods and receipts.", href: "#contact" },
        { t: "Lost items", d: "Report items left in the car.", href: "#contact" },
        { t: "Complaints", d: "Report an issue with a trip.", href: "#contact" },
      ];

  const driverTopics = L
    ? [
        { t: "운행", d: "운행 요청 수락·상태 업데이트.", href: "/login" },
        { t: "고객 연락", d: "배정 후 고객 연락·채팅.", href: "/login" },
        { t: "항공편 지연", d: "지연 시 대기·연락 방법.", href: "/partners" },
        { t: "정산", d: "지급액·수수료·정산 주기.", href: "/partners" },
        { t: "문서", d: "서류 제출·갱신·반려 처리.", href: "/login" },
        { t: "차량", d: "차량 정보·사진 수정.", href: "/login" },
        { t: "계정", d: "로그인·프로필 관리.", href: "/login" },
        { t: "긴급 상황", d: "운행 중 긴급 지원.", href: "#contact" },
      ]
    : [
        { t: "Driving", d: "Accept rides and update status.", href: "/login" },
        { t: "Contact rider", d: "Reach the customer after assignment.", href: "/login" },
        { t: "Flight delays", d: "Waiting and contact on delays.", href: "/partners" },
        { t: "Settlement", d: "Earnings, fees and payout cycle.", href: "/partners" },
        { t: "Documents", d: "Submit, renew, handle rejections.", href: "/login" },
        { t: "Vehicle", d: "Update vehicle info and photos.", href: "/login" },
        { t: "Account", d: "Login and profile management.", href: "/login" },
        { t: "Emergencies", d: "Urgent support during a trip.", href: "#contact" },
      ];

  const Section = ({ label, title, topics }: { label: string; title: string; topics: { t: string; d: string; href: string }[] }) => (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="chip">{label}</span>
        <h2 className="font-display text-xl">{title}</h2>
      </div>
      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        {topics.map((x) => (
          <Link key={x.t} href={x.href} className="rounded-xl border border-[var(--color-line)] bg-white p-4 hover:border-[var(--color-ink)] transition-colors">
            <div className="font-medium flex items-center justify-between">{x.t}<span className="text-[var(--color-slate-400)]">→</span></div>
            <p className="mt-1 text-[13px] text-[var(--color-slate)] leading-relaxed">{x.d}</p>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <PageShell
      title={L ? "고객지원" : "Support"}
      subtitle={L ? "24시간 한국어 지원. 이용 고객과 기사 파트너 문의를 나눠 안내합니다." : "24/7 Korean support — separate help for riders and driver partners."}
    >
      {/* Contact channels */}
      <div className="grid sm:grid-cols-3 gap-3 max-w-4xl mx-auto mb-14">
        {[
          { k: L ? "이메일" : "Email", v: "support@certodrive.com" },
          { k: "KakaoTalk / WhatsApp", v: "@certodrive" },
          { k: L ? "운영 시간" : "Hours", v: L ? "24시간 연중무휴" : "24/7, all year" },
        ].map((c) => (
          <div key={c.k} className="rounded-xl border border-[var(--color-line)] bg-white p-5">
            <div className="text-xs text-[var(--color-slate)]">{c.k}</div>
            <div className="font-semibold mt-0.5">{c.v}</div>
          </div>
        ))}
      </div>

      {/* Riders / Drivers split */}
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 max-w-5xl mx-auto">
        <Section label={L ? "이용 고객" : "For riders"} title={L ? "예약·이동 도움말" : "Booking & travel help"} topics={riderTopics} />
        <Section label={L ? "기사 파트너" : "For drivers"} title={L ? "운행·정산 도움말" : "Driving & payout help"} topics={driverTopics} />
      </div>

      {/* Contact form */}
      <div id="contact" className="scroll-mt-24 max-w-2xl mx-auto mt-16 card p-6 md:p-8">
        <h2 className="font-display text-xl mb-1">{L ? "문의하기" : "Contact us"}</h2>
        <p className="text-sm text-[var(--color-slate)] mb-5">{L ? "아래 양식을 남기시면 한국어로 빠르게 답변드립니다." : "Leave a message and we'll reply promptly in Korean."}</p>
        <SimpleForm
          endpoint="/api/inquiries"
          locale={locale}
          submitLabel={L ? "문의 보내기" : "Send inquiry"}
          successMessage={L ? "문의가 접수되었습니다. 빠르게 답변드리겠습니다." : "Your inquiry has been received. We'll reply shortly."}
          fields={[
            { name: "name", label: L ? "이름" : "Name", required: true },
            { name: "email", label: L ? "이메일" : "Email", type: "email", required: true },
            { name: "category", label: L ? "문의 유형" : "Category", type: "select", options: [
              { value: "RIDER_BOOKING", label: L ? "이용 고객 · 예약" : "Rider · Booking" },
              { value: "RIDER_PAYMENT", label: L ? "이용 고객 · 결제" : "Rider · Payment" },
              { value: "RIDER_CHANGE", label: L ? "이용 고객 · 변경·취소" : "Rider · Change/Cancel" },
              { value: "DRIVER_TRIP", label: L ? "기사 · 운행" : "Driver · Trip" },
              { value: "DRIVER_SETTLEMENT", label: L ? "기사 · 정산" : "Driver · Settlement" },
              { value: "DRIVER_DOCS", label: L ? "기사 · 문서·계정" : "Driver · Docs/Account" },
              { value: "GENERAL", label: L ? "일반" : "General" },
            ] },
            { name: "subject", label: L ? "제목" : "Subject" },
            { name: "message", label: L ? "내용" : "Message", type: "textarea", required: true },
          ]}
        />
      </div>
    </PageShell>
  );
}
