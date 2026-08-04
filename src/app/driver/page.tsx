import { getSession } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import StatusPill from "@/components/StatusPill";
import DriverQuoteCard from "@/components/DriverQuoteCard";
import DriverTripCard from "@/components/DriverTripCard";

export default async function DriverDashboard() {
  const session = (await getSession())!;
  const locale = await getLocale();
  const L = locale === "ko";

  const profile = await prisma.driverProfile.findUnique({ where: { userId: session.userId } });
  if (!profile) {
    return <div className="card p-6">{L ? "기사 프로필을 찾을 수 없습니다." : "Driver profile not found."}</div>;
  }

  const [newRequests, offered, upcoming, completed, settlements] = await Promise.all([
    prisma.driverQuote.findMany({
      where: { driverProfileId: profile.id, status: "REQUESTED" },
      include: { booking: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.driverQuote.findMany({
      where: { driverProfileId: profile.id, status: "OFFERED" },
      include: { booking: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.findMany({
      where: { assignedDriverId: profile.id, status: { in: ["DRIVER_ASSIGNED", "DRIVER_CONFIRMED", "IN_PROGRESS"] } },
      orderBy: { serviceDate: "asc" },
    }),
    prisma.booking.findMany({
      where: { assignedDriverId: profile.id, status: { in: ["COMPLETED", "NO_SHOW"] } },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.settlement.findMany({
      where: { driverProfileId: profile.id },
      include: { booking: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const pendingSettlement = settlements.filter((s) => s.status === "PENDING").reduce((a, s) => a + s.amount, 0);
  const paidSettlement = settlements.filter((s) => s.status === "PAID").reduce((a, s) => a + s.amount, 0);

  const stats = [
    { label: L ? "신규 요청" : "New requests", value: newRequests.length },
    { label: L ? "운행 예정" : "Upcoming", value: upcoming.length },
    { label: L ? "정산 예정" : "Pending settlement", value: formatMoney(pendingSettlement, profile.settlementCurrency) },
    { label: L ? "평점" : "Rating", value: profile.rating ? `★ ${profile.rating.toFixed(1)}` : "—" },
  ];

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold">{L ? `안녕하세요, ${profile.contactName}님` : `Welcome, ${profile.contactName}`}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-[var(--color-slate)]">{profile.businessName} · {profile.city}, {profile.country}</span>
          <span className={`pill ${profile.approvalStatus === "APPROVED" ? "pill-green" : "pill-amber"}`}>
            {profile.approvalStatus === "APPROVED" ? (L ? "승인됨" : "Approved") : (L ? "승인 대기" : "Pending approval")}
          </span>
        </div>
      </div>

      {profile.approvalStatus !== "APPROVED" && (
        <div className="rounded-lg bg-[#fdf3e0] text-[#9a6a12] px-4 py-3 text-sm">
          {L ? "관리자 승인 후 예약 요청을 받을 수 있습니다." : "You'll start receiving booking requests once an admin approves your account."}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="text-xs text-[var(--color-slate)]">{s.label}</div>
            <div className="font-display text-2xl font-bold mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="font-semibold text-lg mb-3">{L ? "신규 예약 요청" : "New booking requests"}</h2>
        {newRequests.length === 0 ? (
          <p className="text-sm text-[var(--color-slate)]">{L ? "새 요청이 없습니다." : "No new requests."}</p>
        ) : (
          <div className="grid gap-3">
            {newRequests.map((q) => (
              <DriverQuoteCard key={q.id} quote={q} booking={q.booking} locale={locale} currency={profile.settlementCurrency} />
            ))}
          </div>
        )}
      </section>

      {offered.length > 0 && (
        <section>
          <h2 className="font-semibold text-lg mb-3">{L ? "제안한 견적 (검토 중)" : "Submitted offers (under review)"}</h2>
          <div className="grid gap-3">
            {offered.map((q) => (
              <div key={q.id} className="card p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{q.booking.reference} · {q.booking.pickupLocation} → {q.booking.destination}</div>
                  <div className="text-sm text-[var(--color-slate)]">{q.booking.serviceDate} {q.booking.serviceTime}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatMoney(q.supplyPrice, q.currency)}</div>
                  <span className="pill pill-amber">{L ? "검토 중" : "Under review"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-semibold text-lg mb-3">{L ? "운행 예정" : "Upcoming trips"}</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-[var(--color-slate)]">{L ? "예정된 운행이 없습니다." : "No upcoming trips."}</p>
        ) : (
          <div className="grid gap-3">
            {upcoming.map((b) => (
              <DriverTripCard key={b.id} booking={b} locale={locale} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-lg mb-3">{L ? "정산 내역" : "Settlements"}</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>{L ? "예약" : "Booking"}</th>
                  <th>{L ? "금액" : "Amount"}</th>
                  <th>{L ? "상태" : "Status"}</th>
                  <th>{L ? "일자" : "Date"}</th>
                </tr>
              </thead>
              <tbody>
                {settlements.length === 0 && (
                  <tr><td colSpan={4} className="text-center text-[var(--color-slate)] py-6">{L ? "정산 내역이 없습니다." : "No settlements yet."}</td></tr>
                )}
                {settlements.map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium">{s.booking.reference}</td>
                    <td>{formatMoney(s.amount, s.currency)}</td>
                    <td><span className={`pill ${s.status === "PAID" ? "pill-green" : "pill-amber"}`}>{s.status === "PAID" ? (L ? "정산 완료" : "Paid") : (L ? "정산 예정" : "Pending")}</span></td>
                    <td className="text-[var(--color-slate)]">{s.paidAt ? new Date(s.paidAt).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {settlements.length > 0 && (
            <div className="px-4 py-3 bg-[var(--color-mist)] text-sm flex justify-end gap-6">
              <span>{L ? "정산 예정" : "Pending"}: <b>{formatMoney(pendingSettlement, profile.settlementCurrency)}</b></span>
              <span>{L ? "정산 완료" : "Paid"}: <b>{formatMoney(paidSettlement, profile.settlementCurrency)}</b></span>
            </div>
          )}
        </div>
      </section>

      {completed.length > 0 && (
        <section>
          <h2 className="font-semibold text-lg mb-3">{L ? "완료된 운행" : "Completed trips"}</h2>
          <div className="grid gap-2">
            {completed.map((b) => (
              <div key={b.id} className="card p-3 flex items-center justify-between text-sm">
                <span>{b.reference} · {b.pickupLocation} → {b.destination} · {b.serviceDate}</span>
                <StatusPill status={b.status} locale={locale} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
