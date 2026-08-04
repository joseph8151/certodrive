import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import RateForm from "@/components/RateForm";
import AdminQuickAction from "@/components/AdminQuickAction";

export default async function AdminRates() {
  const locale = await getLocale();
  const L = locale === "ko";
  const rates = await prisma.exchangeRate.findMany({ orderBy: [{ base: "asc" }, { target: "asc" }] });

  return (
    <div className="grid gap-6">
      <h1 className="font-display text-2xl font-bold">{L ? "환율 관리" : "Exchange rates"}</h1>
      <p className="text-sm text-[var(--color-slate)] -mt-3">
        {L ? "다중 통화 노선의 참고 환산에 사용됩니다. 결제는 각 노선 통화로 처리됩니다." : "Used for reference conversion across multi-currency routes. Payment is processed in each route's currency."}
      </p>

      <section className="card p-6">
        <h2 className="font-semibold text-lg mb-4">{L ? "환율 추가/수정" : "Add / update a rate"}</h2>
        <RateForm locale={locale} />
      </section>

      <div className="card overflow-hidden">
        <table className="tbl">
          <thead>
            <tr>
              <th>{L ? "기준" : "Base"}</th>
              <th>{L ? "대상" : "Target"}</th>
              <th>{L ? "환율" : "Rate"}</th>
              <th>{L ? "갱신" : "Updated"}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rates.length === 0 && <tr><td colSpan={5} className="text-center text-[var(--color-slate)] py-6">{L ? "환율이 없습니다." : "No rates."}</td></tr>}
            {rates.map((r) => (
              <tr key={r.id}>
                <td className="font-medium">{r.base}</td>
                <td>{r.target}</td>
                <td>1 {r.base} = {r.rate} {r.target}</td>
                <td className="text-[var(--color-slate)]">{new Date(r.updatedAt).toLocaleDateString()}</td>
                <td className="text-right"><AdminQuickAction body={{ action: "DELETE_RATE", rateId: r.id }} label={L ? "삭제" : "Delete"} variant="ghost" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
