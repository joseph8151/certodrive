import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import { BOOKING_STATUSES, STATUS_LABELS } from "@/lib/constants";
import StatusPill from "@/components/StatusPill";

export default async function AdminBookings({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const locale = await getLocale();
  const L = locale === "ko";
  const { status, q } = await searchParams;

  const where: Record<string, unknown> = {};
  if (status && BOOKING_STATUSES.includes(status as never)) where.status = status;
  if (q) {
    where.OR = [
      { reference: { contains: q } },
      { customerName: { contains: q } },
      { customerEmail: { contains: q } },
      { pickupCity: { contains: q } },
    ];
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { assignedDriver: true },
  });

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold">{L ? "예약 관리" : "Bookings"}</h1>
        <form className="flex gap-2" action="/admin/bookings">
          <input name="q" defaultValue={q} placeholder={L ? "예약번호·이름·도시 검색" : "Search ref, name, city"} className="input w-56" />
          <button className="btn btn-primary">{L ? "검색" : "Search"}</button>
        </form>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Link href="/admin/bookings" className={`pill ${!status ? "pill-blue" : "pill-slate"}`}>{L ? "전체" : "All"}</Link>
        {BOOKING_STATUSES.map((s) => (
          <Link key={s} href={`/admin/bookings?status=${s}`} className={`pill ${status === s ? "pill-blue" : "pill-slate"}`}>
            {L ? STATUS_LABELS[s].ko : STATUS_LABELS[s].en}
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{L ? "예약" : "Ref"}</th>
                <th>{L ? "고객" : "Customer"}</th>
                <th>{L ? "노선" : "Route"}</th>
                <th>{L ? "일시" : "When"}</th>
                <th>{L ? "차량" : "Vehicle"}</th>
                <th>{L ? "공급가" : "Supply"}</th>
                <th>{L ? "고객가" : "Customer"}</th>
                <th>{L ? "마진" : "Margin"}</th>
                <th>{L ? "상태" : "Status"}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr><td colSpan={9} className="text-center text-[var(--color-slate)] py-8">{L ? "예약이 없습니다." : "No bookings."}</td></tr>
              )}
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td><Link href={`/admin/bookings/${b.id}`} className="font-medium text-[var(--color-navy)]">{b.reference}</Link></td>
                  <td className="whitespace-nowrap">{b.customerName}</td>
                  <td className="max-w-[200px] truncate">{b.pickupLocation} → {b.destination}</td>
                  <td className="text-[var(--color-slate)] whitespace-nowrap">{b.serviceDate} {b.serviceTime}</td>
                  <td className="whitespace-nowrap text-xs">{b.vehicleCategory}</td>
                  <td className="whitespace-nowrap">{formatMoney(b.supplyPrice, b.currency)}</td>
                  <td className="whitespace-nowrap font-medium">{formatMoney(b.customerPrice, b.currency)}</td>
                  <td className="whitespace-nowrap text-[var(--color-gold-dark)]">{formatMoney(b.marginAmount, b.currency)}</td>
                  <td><StatusPill status={b.status} locale={locale} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
