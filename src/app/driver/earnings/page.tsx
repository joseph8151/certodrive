import { getSession } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/utils";

export default async function DriverEarnings() {
  const session = (await getSession())!;
  const locale = await getLocale();
  const L = locale === "ko";

  const profile = await prisma.driverProfile.findUnique({ where: { userId: session.userId } });
  if (!profile) return <div className="card p-6">{L ? "프로필을 찾을 수 없습니다." : "Profile not found."}</div>;

  const settlements = await prisma.settlement.findMany({
    where: { driverProfileId: profile.id },
    include: { booking: true },
    orderBy: { createdAt: "desc" },
  });
  const cur = profile.settlementCurrency;

  const paid = settlements.filter((s) => s.status === "PAID");
  const pending = settlements.filter((s) => s.status === "PENDING");
  const totalPaid = paid.reduce((a, s) => a + s.amount, 0);
  const totalPending = pending.reduce((a, s) => a + s.amount, 0);
  const avgPerTrip = settlements.length ? (totalPaid + totalPending) / settlements.length : 0;

  // Group by month (YYYY-MM of createdAt).
  const byMonth = new Map<string, { total: number; count: number }>();
  for (const s of settlements) {
    const key = new Date(s.createdAt).toISOString().slice(0, 7);
    const m = byMonth.get(key) ?? { total: 0, count: 0 };
    m.total += s.amount; m.count += 1; byMonth.set(key, m);
  }
  const months = [...byMonth.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 12);
  const maxMonth = Math.max(1, ...months.map(([, m]) => m.total));

  const stats = [
    { label: L ? "정산 완료 누적" : "Total paid", value: formatMoney(totalPaid, cur), accent: true },
    { label: L ? "정산 예정" : "Pending", value: formatMoney(totalPending, cur) },
    { label: L ? "총 운행" : "Total trips", value: String(settlements.length) },
    { label: L ? "평균 정산/건" : "Avg / trip", value: formatMoney(avgPerTrip, cur) },
  ];

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold">{L ? "정산 통계" : "Earnings"}</h1>
        <p className="text-sm text-[var(--color-slate)] mt-1">{L ? `정산 통화: ${cur}` : `Settlement currency: ${cur}`}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="text-xs text-[var(--color-slate)]">{s.label}</div>
            <div className={`font-display text-2xl font-bold mt-1 ${s.accent ? "text-[var(--color-gold-dark)]" : ""}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="font-semibold text-lg mb-3">{L ? "월별 정산" : "Monthly earnings"}</h2>
        {months.length === 0 ? (
          <p className="text-sm text-[var(--color-slate)]">{L ? "데이터가 없습니다." : "No data yet."}</p>
        ) : (
          <div className="card p-5 grid gap-3">
            {months.map(([month, m]) => (
              <div key={month} className="flex items-center gap-3">
                <span className="text-sm text-[var(--color-slate)] w-20 shrink-0">{month}</span>
                <div className="flex-1 h-6 bg-[var(--color-mist)] rounded overflow-hidden">
                  <div className="h-full bg-[var(--color-red)] rounded" style={{ width: `${(m.total / maxMonth) * 100}%` }} />
                </div>
                <span className="text-sm font-medium w-28 text-right shrink-0">{formatMoney(m.total, cur)}</span>
                <span className="text-xs text-[var(--color-slate)] w-12 text-right shrink-0">{m.count}{L ? "건" : ""}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-lg mb-3">{L ? "최근 정산 내역" : "Recent settlements"}</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>{L ? "예약" : "Booking"}</th>
                  <th>{L ? "노선" : "Route"}</th>
                  <th>{L ? "금액" : "Amount"}</th>
                  <th>{L ? "상태" : "Status"}</th>
                  <th>{L ? "일자" : "Date"}</th>
                </tr>
              </thead>
              <tbody>
                {settlements.length === 0 && <tr><td colSpan={5} className="text-center text-[var(--color-slate)] py-6">{L ? "정산 내역이 없습니다." : "No settlements yet."}</td></tr>}
                {settlements.slice(0, 20).map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium">{s.booking.reference}</td>
                    <td className="max-w-[200px] truncate text-[var(--color-slate)]">{s.booking.pickupLocation} → {s.booking.destination}</td>
                    <td className="font-medium whitespace-nowrap">{formatMoney(s.amount, s.currency)}</td>
                    <td><span className={`pill ${s.status === "PAID" ? "pill-green" : "pill-amber"}`}>{s.status === "PAID" ? (L ? "완료" : "Paid") : (L ? "예정" : "Pending")}</span></td>
                    <td className="text-[var(--color-slate)] whitespace-nowrap">{s.paidAt ? new Date(s.paidAt).toLocaleDateString() : new Date(s.createdAt).toLocaleDateString()}</td>
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
