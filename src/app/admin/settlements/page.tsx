import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import AdminQuickAction from "@/components/AdminQuickAction";

export default async function AdminSettlements() {
  const locale = await getLocale();
  const L = locale === "ko";

  const settlements = await prisma.settlement.findMany({
    include: { booking: true, driverProfile: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const pending = settlements.filter((s) => s.status === "PENDING");
  const paid = settlements.filter((s) => s.status === "PAID");
  const pendingTotal = pending.reduce((a, s) => a + s.amount, 0);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold">{L ? "기사 정산" : "Driver settlements"}</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-[var(--color-slate)]">{L ? "정산 예정 합계" : "Pending total"}: <b className="text-[var(--color-ink)]">{formatMoney(pendingTotal, "USD")}</b></div>
          <a href="/api/admin/settlements/export" className="btn btn-outline text-sm py-1.5 px-3">{L ? "CSV 내보내기" : "Export CSV"}</a>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{L ? "예약" : "Booking"}</th>
                <th>{L ? "기사" : "Driver"}</th>
                <th>{L ? "노선" : "Route"}</th>
                <th>{L ? "금액" : "Amount"}</th>
                <th>{L ? "상태" : "Status"}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {settlements.length === 0 && <tr><td colSpan={6} className="text-center text-[var(--color-slate)] py-8">{L ? "정산 내역이 없습니다. 운행 완료 시 자동 생성됩니다." : "No settlements yet — created when trips complete."}</td></tr>}
              {settlements.map((s) => (
                <tr key={s.id}>
                  <td><Link href={`/admin/bookings/${s.bookingId}`} className="font-medium text-[var(--color-navy)]">{s.booking.reference}</Link></td>
                  <td className="whitespace-nowrap">{s.driverProfile.contactName}</td>
                  <td className="max-w-[200px] truncate">{s.booking.pickupLocation} → {s.booking.destination}</td>
                  <td className="whitespace-nowrap font-medium">{formatMoney(s.amount, s.currency)}</td>
                  <td><span className={`pill ${s.status === "PAID" ? "pill-green" : "pill-amber"}`}>{s.status === "PAID" ? (L ? "정산 완료" : "Paid") : (L ? "정산 예정" : "Pending")}</span></td>
                  <td className="text-right">
                    {s.status === "PENDING" && <AdminQuickAction body={{ action: "SETTLE", settlementId: s.id }} label={L ? "정산 완료 처리" : "Mark paid"} variant="primary" />}
                    {s.status === "PAID" && s.paidAt && <span className="text-xs text-[var(--color-slate)]">{new Date(s.paidAt).toLocaleDateString()}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-5"><div className="text-xs text-[var(--color-slate)]">{L ? "정산 예정 건수" : "Pending count"}</div><div className="font-display text-2xl font-bold">{pending.length}</div></div>
        <div className="card p-5"><div className="text-xs text-[var(--color-slate)]">{L ? "정산 완료 건수" : "Paid count"}</div><div className="font-display text-2xl font-bold">{paid.length}</div></div>
      </div>
    </div>
  );
}
