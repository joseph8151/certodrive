import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import AdminQuickAction from "@/components/AdminQuickAction";

export default async function AdminInbox() {
  const locale = await getLocale();
  const L = locale === "ko";

  const [inquiries, corporate] = await Promise.all([
    prisma.inquiry.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 100 }),
    prisma.corporateAccount.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 100 }),
  ]);

  const openInquiries = inquiries.filter((i) => i.status === "OPEN").length;
  const pendingCorp = corporate.filter((c) => c.status === "PENDING").length;

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold">{L ? "문의함" : "Inbox"}</h1>
        <p className="text-sm text-[var(--color-slate)] mt-1">
          {L ? `미처리 문의 ${openInquiries}건 · 대기 제휴 신청 ${pendingCorp}건` : `${openInquiries} open inquiries · ${pendingCorp} pending partnerships`}
        </p>
      </div>

      <section>
        <h2 className="font-semibold text-lg mb-3">{L ? "고객 문의" : "Customer inquiries"}</h2>
        <div className="grid gap-3">
          {inquiries.length === 0 && <div className="card p-6 text-center text-[var(--color-slate)]">{L ? "문의가 없습니다." : "No inquiries."}</div>}
          {inquiries.map((i) => (
            <div key={i.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{i.subject || (L ? "(제목 없음)" : "(no subject)")}</span>
                    <span className="pill pill-slate">{i.category}</span>
                    <span className={`pill ${i.status === "OPEN" ? "pill-amber" : "pill-green"}`}>{i.status === "OPEN" ? (L ? "미처리" : "Open") : (L ? "처리됨" : "Resolved")}</span>
                  </div>
                  <div className="text-sm text-[var(--color-slate)] mt-1">{i.name} · {i.email} · {new Date(i.createdAt).toLocaleString()}</div>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{i.message}</p>
                </div>
                <div className="flex gap-2">
                  <a href={`mailto:${i.email}?subject=Re: ${encodeURIComponent(i.subject || "Certo Drive")}`} className="btn btn-outline text-sm py-1.5 px-3">{L ? "답장" : "Reply"}</a>
                  {i.status === "OPEN"
                    ? <AdminQuickAction body={{ action: "RESOLVE_INQUIRY", inquiryId: i.id, status: "RESOLVED" }} label={L ? "처리 완료" : "Resolve"} variant="primary" />
                    : <AdminQuickAction body={{ action: "RESOLVE_INQUIRY", inquiryId: i.id, status: "OPEN" }} label={L ? "다시 열기" : "Reopen"} variant="ghost" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-lg mb-3">{L ? "기업·여행사 제휴 신청" : "Corporate & agency applications"}</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>{L ? "회사" : "Company"}</th>
                  <th>{L ? "담당자" : "Contact"}</th>
                  <th>{L ? "유형" : "Type"}</th>
                  <th>{L ? "상태" : "Status"}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {corporate.length === 0 && <tr><td colSpan={5} className="text-center text-[var(--color-slate)] py-6">{L ? "제휴 신청이 없습니다." : "No applications."}</td></tr>}
                {corporate.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium">{c.companyName}{c.country ? <span className="text-[var(--color-slate)] font-normal"> · {c.country}</span> : null}</td>
                    <td className="whitespace-nowrap">{c.contactName}<div className="text-xs text-[var(--color-slate)]">{c.email}</div></td>
                    <td className="text-xs">{c.partnerType === "TRAVEL_AGENCY" ? (L ? "여행사" : "Agency") : (L ? "기업" : "Corporate")}</td>
                    <td><span className={`pill ${c.status === "ACTIVE" ? "pill-green" : c.status === "PENDING" ? "pill-amber" : "pill-red"}`}>{c.status}</span></td>
                    <td className="text-right whitespace-nowrap">
                      <span className="inline-flex gap-2">
                        {c.status !== "ACTIVE" && <AdminQuickAction body={{ action: "SET_CORPORATE_STATUS", corporateId: c.id, status: "ACTIVE" }} label={L ? "승인" : "Approve"} variant="primary" />}
                        {c.status !== "REJECTED" && <AdminQuickAction body={{ action: "SET_CORPORATE_STATUS", corporateId: c.id, status: "REJECTED" }} label={L ? "반려" : "Reject"} variant="ghost" />}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
