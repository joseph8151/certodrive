import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/utils";

const PAID_STATUSES = [
  "PAYMENT_COMPLETED",
  "DRIVER_ASSIGNMENT_PENDING",
  "DRIVER_ASSIGNED",
  "DRIVER_CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
];

export default async function AdminAnalytics() {
  const locale = await getLocale();
  const L = locale === "ko";

  const [paid, totalCount, rates, drivers, statusGroups] = await Promise.all([
    prisma.booking.findMany({
      where: { status: { in: PAID_STATUSES } },
      select: { pickupCountry: true, pickupLocation: true, destination: true, customerPrice: true, marginAmount: true, currency: true, assignedDriverId: true },
    }),
    prisma.booking.count(),
    prisma.exchangeRate.findMany({ where: { base: "USD" } }),
    prisma.driverProfile.findMany({ select: { id: true, contactName: true, businessName: true, rating: true, ratingCount: true } }),
    prisma.booking.groupBy({ by: ["status"], _count: true }),
  ]);

  // 1 USD = rate[target]. Convert any amount to USD.
  const rateMap = new Map(rates.map((r) => [r.target, r.rate]));
  const toUSD = (amount: number | null, currency: string) => {
    if (!amount) return 0;
    if (currency === "USD") return amount;
    const r = rateMap.get(currency);
    return r ? amount / r : amount; // fall back to nominal if no rate
  };

  const driverName = new Map(drivers.map((d) => [d.id, d.contactName]));

  let totalRevenue = 0;
  let totalMargin = 0;
  const byCountry = new Map<string, { revenue: number; count: number }>();
  const byRoute = new Map<string, { revenue: number; count: number }>();
  const byDriver = new Map<string, { revenue: number; margin: number; count: number }>();

  for (const b of paid) {
    const rev = toUSD(b.customerPrice, b.currency);
    const mar = toUSD(b.marginAmount, b.currency);
    totalRevenue += rev;
    totalMargin += mar;

    const c = byCountry.get(b.pickupCountry) ?? { revenue: 0, count: 0 };
    c.revenue += rev; c.count += 1; byCountry.set(b.pickupCountry, c);

    const routeKey = `${b.pickupLocation} → ${b.destination}`;
    const rt = byRoute.get(routeKey) ?? { revenue: 0, count: 0 };
    rt.revenue += rev; rt.count += 1; byRoute.set(routeKey, rt);

    if (b.assignedDriverId) {
      const d = byDriver.get(b.assignedDriverId) ?? { revenue: 0, margin: 0, count: 0 };
      d.revenue += rev; d.margin += mar; d.count += 1; byDriver.set(b.assignedDriverId, d);
    }
  }

  const avgMargin = paid.length ? totalMargin / paid.length : 0;
  const conversion = totalCount ? (paid.length / totalCount) * 100 : 0;
  const sortDesc = <K, V extends { revenue: number }>(m: Map<K, V>) =>
    [...m.entries()].sort((a, b) => b[1].revenue - a[1].revenue);

  const cards = [
    { label: L ? "총 매출 (USD 환산)" : "Total revenue (USD)", value: formatMoney(totalRevenue, "USD") },
    { label: L ? "총 마진" : "Total margin", value: formatMoney(totalMargin, "USD"), accent: true },
    { label: L ? "평균 마진/건" : "Avg margin / booking", value: formatMoney(avgMargin, "USD") },
    { label: L ? "결제 전환율" : "Conversion rate", value: `${conversion.toFixed(1)}%` },
  ];

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold">{L ? "매출 분석" : "Analytics"}</h1>
        <p className="text-sm text-[var(--color-slate)] mt-1">
          {L ? "결제 완료된 예약 기준. 다중 통화는 USD로 환산해 집계합니다." : "Based on paid bookings; multi-currency totals are normalized to USD."}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="text-xs text-[var(--color-slate)]">{c.label}</div>
            <div className={`font-display text-2xl font-bold mt-1 ${c.accent ? "text-[var(--color-gold-dark)]" : ""}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <AnalyticsTable
          title={L ? "국가별 매출" : "Revenue by country"}
          head={[L ? "국가" : "Country", L ? "건수" : "Bookings", L ? "매출" : "Revenue"]}
          rows={sortDesc(byCountry).map(([k, v]) => [k, String(v.count), formatMoney(v.revenue, "USD")])}
          empty={L ? "데이터 없음" : "No data"}
        />
        <AnalyticsTable
          title={L ? "노선별 매출" : "Revenue by route"}
          head={[L ? "노선" : "Route", L ? "건수" : "Bookings", L ? "매출" : "Revenue"]}
          rows={sortDesc(byRoute).slice(0, 10).map(([k, v]) => [k, String(v.count), formatMoney(v.revenue, "USD")])}
          empty={L ? "데이터 없음" : "No data"}
        />
        <AnalyticsTable
          title={L ? "기사별 매출" : "Revenue by driver"}
          head={[L ? "기사" : "Driver", L ? "건수" : "Trips", L ? "매출" : "Revenue"]}
          rows={sortDesc(byDriver).map(([k, v]) => [driverName.get(k) ?? "—", String(v.count), formatMoney(v.revenue, "USD")])}
          empty={L ? "데이터 없음" : "No data"}
        />
        <AnalyticsTable
          title={L ? "상태 분포" : "Status distribution"}
          head={[L ? "상태" : "Status", L ? "건수" : "Count", ""]}
          rows={statusGroups.sort((a, b) => b._count - a._count).map((g) => [g.status, String(g._count), ""])}
          empty={L ? "데이터 없음" : "No data"}
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-5 sm:col-span-3">
          <h3 className="font-semibold mb-3">{L ? "기사 평점" : "Driver ratings"}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {drivers.map((d) => (
              <div key={d.id} className="flex justify-between border-b border-[var(--color-line)] pb-2">
                <span>{d.contactName}</span>
                <span className="text-[var(--color-slate)]">{d.ratingCount > 0 ? `★ ${d.rating.toFixed(1)} (${d.ratingCount})` : (L ? "평가 없음" : "no ratings")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsTable({ title, head, rows, empty }: { title: string; head: string[]; rows: string[][]; empty: string }) {
  return (
    <div>
      <h2 className="font-semibold text-lg mb-3">{title}</h2>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr>{head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={head.length} className="text-center text-[var(--color-slate)] py-6">{empty}</td></tr>}
              {rows.map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j} className={j === 0 ? "font-medium max-w-[220px] truncate" : ""}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
