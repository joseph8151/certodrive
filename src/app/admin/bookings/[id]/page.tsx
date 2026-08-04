import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import { safeJson, formatMoney } from "@/lib/utils";
import BookingSummary from "@/components/BookingSummary";
import PriceBreakdown from "@/components/PriceBreakdown";
import AdminBookingActions from "@/components/AdminBookingActions";
import StatusPill from "@/components/StatusPill";

export default async function AdminBookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getLocale();
  const L = locale === "ko";

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      assignedDriver: true,
      payment: true,
      vouchers: true,
      driverQuotes: { include: { driverProfile: { include: { user: true } } }, orderBy: { supplyPrice: "asc" } },
      statusEvents: { orderBy: { createdAt: "desc" } },
      notifications: { orderBy: { createdAt: "desc" } },
      review: true,
    },
  });
  if (!booking) notFound();

  const approvedDrivers = await prisma.driverProfile.findMany({
    where: { approvalStatus: "APPROVED" },
    orderBy: { rating: "desc" },
    take: 100,
  });

  const items = safeJson<{ key: string; labelKo: string; labelEn: string; amount: number }[]>(booking.priceBreakdown, []);
  const quotes = booking.driverQuotes
    .filter((q) => q.status === "OFFERED")
    .map((q) => ({
      id: q.id, supplyPrice: q.supplyPrice, currency: q.currency, status: q.status, note: q.note,
      driver: { id: q.driverProfile.id, contactName: q.driverProfile.contactName, businessName: q.driverProfile.businessName, koreanLevel: q.driverProfile.koreanLevel, rating: q.driverProfile.rating, city: q.driverProfile.city },
    }));

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/bookings" className="text-sm text-[var(--color-slate)] hover:text-[var(--color-ink)]">← {L ? "예약 목록" : "Bookings"}</Link>
        <StatusPill status={booking.status} locale={locale} />
        {booking.isInstantPriced && <span className="pill pill-slate">{L ? "즉시 가격" : "Instant price"}</span>}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <div className="grid gap-6">
          <BookingSummary booking={booking} locale={locale} />
          {booking.customerPrice != null && items.length > 0 && (
            <PriceBreakdown items={items} total={booking.customerPrice} currency={booking.currency} locale={locale} />
          )}

          {/* Contact + margin */}
          <div className="card p-5 grid gap-2 text-sm">
            <h3 className="font-semibold mb-1">{L ? "고객 연락처" : "Customer contact"}</h3>
            <div className="flex justify-between"><span className="text-[var(--color-slate)]">Email</span><span>{booking.customerEmail}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-slate)]">{L ? "전화" : "Phone"}</span><span>{booking.customerPhone}</span></div>
            {booking.messenger && <div className="flex justify-between"><span className="text-[var(--color-slate)]">Kakao/WhatsApp</span><span>{booking.messenger}</span></div>}
            <div className="border-t border-[var(--color-line)] mt-2 pt-2 flex justify-between font-medium">
              <span>{L ? "마진" : "Margin"}</span>
              <span className="text-[var(--color-gold-dark)]">{formatMoney(booking.marginAmount, booking.currency)}</span>
            </div>
          </div>

          {/* No-show evidence */}
          {booking.noShowEvidenceUrl && (
            <div className="card p-5">
              <h3 className="font-semibold mb-2">{L ? "노쇼 증빙" : "No-show evidence"}</h3>
              <a href={booking.noShowEvidenceUrl} target="_blank" rel="noreferrer" className="btn btn-outline text-sm">{L ? "증빙 파일 보기" : "View evidence"}</a>
            </div>
          )}

          {/* Review */}
          {booking.review && (
            <div className="card p-5">
              <h3 className="font-semibold mb-2">{L ? "고객 후기" : "Customer review"}</h3>
              <div className="text-xl text-[var(--color-gold)]">{"★".repeat(booking.review.rating)}<span className="text-[var(--color-line)]">{"★".repeat(5 - booking.review.rating)}</span></div>
              {booking.review.comment && <p className="text-sm mt-2 text-[var(--color-slate)]">“{booking.review.comment}”</p>}
            </div>
          )}

          {/* Vouchers */}
          {booking.vouchers.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold mb-2">{L ? "바우처" : "Vouchers"}</h3>
              <div className="grid gap-2">
                {booking.vouchers.map((v) => (
                  <div key={v.id} className="flex items-center justify-between text-sm">
                    <span>{v.type === "CUSTOMER" ? (L ? "고객용" : "Customer") : (L ? "기사용" : "Driver")} · {v.code}</span>
                    <Link href={`/voucher/${v.code}`} className="text-[var(--color-navy)] font-medium">{L ? "보기" : "View"}</Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6">
          <AdminBookingActions
            bookingId={booking.id}
            status={booking.status}
            currency={booking.currency}
            supplyPrice={booking.supplyPrice}
            customerPrice={booking.customerPrice}
            hasVoucher={booking.vouchers.length > 0}
            flightNumber={booking.flightNumber}
            quotes={quotes}
            approvedDrivers={approvedDrivers.map((d) => ({ id: d.id, contactName: d.contactName, businessName: d.businessName, city: d.city, koreanLevel: d.koreanLevel }))}
            locale={locale}
          />

          {/* Timeline */}
          <div className="card p-5">
            <h3 className="font-semibold mb-3">{L ? "상태 이력" : "Status timeline"}</h3>
            <ol className="grid gap-2 text-sm">
              {booking.statusEvents.map((e) => (
                <li key={e.id} className="flex items-start gap-3">
                  <span className="text-[var(--color-gold)] mt-1">●</span>
                  <div>
                    <div className="font-medium">{e.to}{e.from ? ` ← ${e.from}` : ""}</div>
                    <div className="text-xs text-[var(--color-slate)]">{new Date(e.createdAt).toLocaleString()} · {e.actor}{e.note ? ` · ${e.note}` : ""}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Notifications */}
          {booking.notifications.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold mb-3">{L ? "발송된 알림" : "Sent notifications"}</h3>
              <ol className="grid gap-2 text-sm">
                {booking.notifications.slice(0, 12).map((n) => (
                  <li key={n.id} className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-xs">{n.template} <span className="pill pill-slate ml-1">{n.channel}</span></div>
                      <div className="text-xs text-[var(--color-slate)]">{n.to}</div>
                    </div>
                    <span className="text-xs text-[var(--color-slate)] whitespace-nowrap">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
