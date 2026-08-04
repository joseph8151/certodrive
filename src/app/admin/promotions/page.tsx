import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import PromoForm from "@/components/PromoForm";
import AdminQuickAction from "@/components/AdminQuickAction";

export default async function AdminPromotions() {
  const locale = await getLocale();
  const L = locale === "ko";
  const promos = await prisma.promotion.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="grid gap-6">
      <h1 className="font-display text-2xl font-bold">{L ? "프로모션 코드" : "Promotion codes"}</h1>

      <section className="card p-6">
        <h2 className="font-semibold text-lg mb-4">{L ? "프로모션 추가" : "Add a promotion"}</h2>
        <PromoForm locale={locale} />
      </section>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{L ? "코드" : "Code"}</th>
                <th>{L ? "할인" : "Discount"}</th>
                <th>{L ? "사용" : "Uses"}</th>
                <th>{L ? "만료" : "Expires"}</th>
                <th>{L ? "상태" : "Status"}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {promos.length === 0 && <tr><td colSpan={6} className="text-center text-[var(--color-slate)] py-6">{L ? "프로모션이 없습니다." : "No promotions."}</td></tr>}
              {promos.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium">{p.code}{p.description ? <span className="text-[var(--color-slate)] font-normal"> · {p.description}</span> : null}</td>
                  <td>{p.discountType === "PERCENT" ? `${p.value}%` : `${p.value}`}</td>
                  <td>{p.usedCount}{p.maxUses != null ? ` / ${p.maxUses}` : ""}</td>
                  <td className="text-[var(--color-slate)]">{p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : "—"}</td>
                  <td><span className={`pill ${p.active ? "pill-green" : "pill-slate"}`}>{p.active ? (L ? "활성" : "Active") : (L ? "비활성" : "Off")}</span></td>
                  <td className="text-right whitespace-nowrap">
                    <span className="inline-flex gap-2">
                      <AdminQuickAction body={{ action: "TOGGLE_PROMO", promoId: p.id }} label={p.active ? (L ? "비활성화" : "Disable") : (L ? "활성화" : "Enable")} variant="outline" />
                      <AdminQuickAction body={{ action: "DELETE_PROMO", promoId: p.id }} label={L ? "삭제" : "Delete"} variant="ghost" confirmText={L ? "삭제할까요?" : "Delete?"} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
