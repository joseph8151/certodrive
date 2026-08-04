import PageShell from "@/components/PageShell";
import SimpleForm from "@/components/SimpleForm";
import { getLocale } from "@/lib/locale";

export default async function Corporate() {
  const locale = await getLocale();
  const L = locale === "ko";
  const benefits = L
    ? ["통합 예약 및 월별 정산", "여행사·기업 전용 요금", "다수 예약 일괄 관리", "전담 매니저 및 우선 지원", "임직원·고객 의전 차량"]
    : ["Consolidated booking & monthly settlement", "Corporate & agency rates", "Bulk booking management", "Dedicated manager & priority support", "Executive & client chauffeur service"];

  return (
    <PageShell
      title={L ? "기업·여행사 제휴" : "Corporate & travel-agency partnerships"}
      subtitle={L ? "임직원 출장, 고객 의전, 여행 상품 연계를 위한 통합 예약 솔루션." : "A unified booking solution for business travel, client transfers and tour packages."}
    >
      <div className="grid lg:grid-cols-5 gap-10 max-w-4xl mx-auto">
        <div className="lg:col-span-2">
          <h2 className="font-semibold text-lg mb-4">{L ? "제휴 혜택" : "Partner benefits"}</h2>
          <ul className="grid gap-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm"><span className="text-[var(--color-gold)] mt-0.5">◆</span>{b}</li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-3 card p-6">
          <h2 className="font-semibold text-lg mb-4">{L ? "제휴 문의" : "Partnership inquiry"}</h2>
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
        </div>
      </div>
    </PageShell>
  );
}
