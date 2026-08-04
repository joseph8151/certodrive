import PageShell from "@/components/PageShell";
import SimpleForm from "@/components/SimpleForm";
import { getLocale } from "@/lib/locale";

export default async function Support() {
  const locale = await getLocale();
  const L = locale === "ko";
  return (
    <PageShell
      title={L ? "고객센터" : "Customer support"}
      subtitle={L ? "24시간 한국어 지원. 예약, 결제, 변경 문의를 남겨주세요." : "24/7 Korean support. Ask us about bookings, payments and changes."}
    >
      <div className="grid lg:grid-cols-5 gap-10 max-w-4xl mx-auto">
        <div className="lg:col-span-2 grid gap-4">
          <div className="card p-5">
            <div className="text-xs text-[var(--color-slate)]">{L ? "이메일" : "Email"}</div>
            <div className="font-semibold">support@certodrive.com</div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-[var(--color-slate)]">KakaoTalk / WhatsApp</div>
            <div className="font-semibold">@certodrive</div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-[var(--color-slate)]">{L ? "운영 시간" : "Hours"}</div>
            <div className="font-semibold">{L ? "24시간 연중무휴" : "24/7, all year"}</div>
          </div>
        </div>
        <div className="lg:col-span-3 card p-6">
          <h2 className="font-semibold text-lg mb-4">{L ? "문의하기" : "Contact us"}</h2>
          <SimpleForm
            endpoint="/api/inquiries"
            locale={locale}
            submitLabel={L ? "문의 보내기" : "Send inquiry"}
            successMessage={L ? "문의가 접수되었습니다. 빠르게 답변드리겠습니다." : "Your inquiry has been received. We'll reply shortly."}
            fields={[
              { name: "name", label: L ? "이름" : "Name", required: true },
              { name: "email", label: L ? "이메일" : "Email", type: "email", required: true },
              { name: "category", label: L ? "문의 유형" : "Category", type: "select", options: [
                { value: "BOOKING", label: L ? "예약" : "Booking" },
                { value: "PAYMENT", label: L ? "결제" : "Payment" },
                { value: "CHANGE", label: L ? "변경·취소" : "Change/Cancel" },
                { value: "GENERAL", label: L ? "일반" : "General" },
              ] },
              { name: "subject", label: L ? "제목" : "Subject" },
              { name: "message", label: L ? "내용" : "Message", type: "textarea", required: true },
            ]}
          />
        </div>
      </div>
    </PageShell>
  );
}
