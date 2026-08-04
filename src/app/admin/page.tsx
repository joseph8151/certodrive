import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import StatusPill from "@/components/StatusPill";

export default async function AdminDashboard() {
  const locale = await getLocale();
  const L = locale === "ko";
  const today = new Date().toISOString().slice(0, 10);

  const [
    todayCount,
    quoteRequests,
    awaitingPayment,
    assignPending,
    inProgress,
    completedPaid,
    recent,
    driversPending,
  ] = await Promise.all([
    prisma.booking.count({ where: { serviceDate: today } }),
    prisma.booking.count({ where: { status: { in: ["QUOTE_REQUESTED", "QUOTE_RECEIVED"] } } }),
    prisma.booking.count({ where: { status: "AWAITING_CUSTOMER_PAYMENT" } }),
    prisma.booking.count({ where: { status: "DRIVER_ASSIGNMENT_PENDING" } }),
    prisma.booking.count({ where: { status: "IN_PROGRESS" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED" } }),
    prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { assignedDriver: true } }),
    prisma.driverProfile.count({ where: { approvalStatus: "PENDING" } }),
  ]);

  const totalMargin = await prisma.booking.aggregate({
    _sum: { marginAmount: true },
    where: { status: { in: ["PAYMENT_COMPLETED", "DRIVER_ASSIGNED", "DRIVER_CONFIRMED", "IN_PROGRESS", "COMPLETED"] } },
  });

  const cards = [
    { label: L ? "오늘 예약" : "Today's bookings", value: todayCount, href: "/admin/bookings" },
    { label: L ? "견적 요청" : "Quote requests", value: quoteRequests, href: "/admin/bookings?status=QUOTE_REQUESTED", tone: "amber" },
    { label: L ? "결제 대기" : "Awaiting payment", value: awaitingPayment, href: "/admin/bookings?status=AWAITING_CUSTOMER_PAYMENT", tone: "amber" },
    { label: L ? "배차 대기" : "Dispatch queue", value: assignPending, href: "/admin/bookings?status=DRIVER_ASSIGNMENT_PENDING", tone: "blue" },
    { label: L ? "운행 중" : "In progress", value: inProgress, href: "/admin/bookings?status=IN_PROGRESS", tone: "green" },
    { label: L ? "기사 승인 대기" : "Drivers pending", value: driversPending, href: "/admin/drivers", tone: "amber" },
  ];

  return (
    <div className="grid gap-8">
      <h1 className="font-display text-2xl font-bold">{L ? "관리자 대시보드" : "Admin dashboard"}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card p-5 hover:card-shadow transition-shadow">
            <div className="text-xs text-[var(--color-slate)]">{c.label}</div>
            <div className="font-display text-3xl font-bold mt-1">{c.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-xs text-[var(--color-slate)]">{L ? "총 결제액 (완료)" : "Total collected"}</div>
          <div className="font-display text-2xl font-bold mt-1">{formatMoney(completedPaid._sum.amount ?? 0, "USD")}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-[var(--color-slate)]">{L ? "누적 마진" : "Total margin"}</div>
          <div className="font-display text-2xl font-bold mt-1 text-[var(--color-gold-dark)]">{formatMoney(totalMargin._sum.marginAmount ?? 0, "USD")}</div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">{L ? "최근 예약" : "Recent bookings"}</h2>
          <Link href="/admin/bookings" className="text-sm text-[var(--color-navy)] font-medium">{L ? "전체 보기" : "View all"}</Link>
        </div>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>{L ? "예약" : "Ref"}</th>
                  <th>{L ? "노선" : "Route"}</th>
                  <th>{L ? "일시" : "When"}</th>
                  <th>{L ? "가격" : "Price"}</th>
                  <th>{L ? "기사" : "Driver"}</th>
                  <th>{L ? "상태" : "Status"}</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id}>
                    <td><Link href={`/admin/bookings/${b.id}`} className="font-medium text-[var(--color-navy)]">{b.reference}</Link></td>
                    <td className="max-w-[220px] truncate">{b.pickupLocation} → {b.destination}</td>
                    <td className="text-[var(--color-slate)] whitespace-nowrap">{b.serviceDate} {b.serviceTime}</td>
                    <td className="whitespace-nowrap">{formatMoney(b.customerPrice, b.currency)}</td>
                    <td className="text-[var(--color-slate)]">{b.assignedDriver?.contactName ?? "—"}</td>
                    <td><StatusPill status={b.status} locale={locale} /></td>
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
