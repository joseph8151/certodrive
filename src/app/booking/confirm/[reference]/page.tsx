import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BookingSummary from "@/components/BookingSummary";
import PriceBreakdown from "@/components/PriceBreakdown";
import PayButton from "@/components/PayButton";
import ReviewForm from "@/components/ReviewForm";
import StatusPill from "@/components/StatusPill";
import { prisma } from "@/lib/db";
import { getLocale } from "@/lib/locale";
import { safeJson, formatMoney } from "@/lib/utils";

export default async function ConfirmPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const locale = await getLocale();
  const booking = await prisma.booking.findUnique({
    where: { reference },
    include: { payment: true, vouchers: true, review: true },
  });
  if (!booking) notFound();

  const items = safeJson<{ key: string; labelKo: string; labelEn: string; amount: number }[]>(booking.priceBreakdown, []);
  const paid = ["PAYMENT_COMPLETED", "DRIVER_ASSIGNMENT_PENDING", "DRIVER_ASSIGNED", "DRIVER_CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(booking.status);
  const awaitingPayment = booking.status === "AWAITING_CUSTOMER_PAYMENT";
  const quoteRequested = booking.status === "QUOTE_REQUESTED";
  const customerVoucher = booking.vouchers.find((v) => v.type === "CUSTOMER");

  return (
    <>
      <SiteHeader />
      <main className="container-cd py-10 md:py-14">
        <div className="max-w-4xl mx-auto">
          {/* Banner */}
          <div className="text-center mb-8">
            {booking.isInstantPriced && awaitingPayment && (
              <>
                <div className="text-3xl">💳</div>
                <h1 className="font-display text-3xl font-bold mt-2">
                  {locale === "ko" ? "가격이 준비되었습니다" : "Your price is ready"}
                </h1>
                <p className="text-[var(--color-slate)] mt-2">
                  {locale === "ko" ? "아래 요금으로 결제하면 예약이 확정됩니다." : "Pay the fixed price below to confirm your booking."}
                </p>
              </>
            )}
            {quoteRequested && (
              <>
                <div className="text-3xl">📨</div>
                <h1 className="font-display text-3xl font-bold mt-2">
                  {locale === "ko" ? "견적 요청이 접수되었습니다" : "Quote request received"}
                </h1>
                <p className="text-[var(--color-slate)] mt-2 max-w-xl mx-auto">
                  {locale === "ko"
                    ? "해당 지역 파트너 기사에게 요청을 전송했습니다. 최종 가격이 준비되면 이메일로 안내드리며, 예약 조회에서 결제하실 수 있습니다."
                    : "We've sent your request to partner drivers in the area. We'll email you the final price, and you can pay from Manage booking."}
                </p>
              </>
            )}
            {paid && (
              <>
                <div className="text-3xl">✅</div>
                <h1 className="font-display text-3xl font-bold mt-2">
                  {locale === "ko" ? "예약이 확정되었습니다" : "Booking confirmed"}
                </h1>
                <p className="text-[var(--color-slate)] mt-2">
                  {locale === "ko" ? "결제가 완료되었습니다. 기사 배정 후 바우처를 안내드립니다." : "Payment complete. We'll assign a driver and issue your voucher."}
                </p>
              </>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <BookingSummary booking={booking} locale={locale} />

            <div className="grid gap-6 content-start">
              {booking.customerPrice != null && items.length > 0 && (
                <PriceBreakdown items={items} total={booking.customerPrice} currency={booking.currency} locale={locale} />
              )}

              {awaitingPayment && <PayButton reference={booking.reference} locale={locale} />}

              {quoteRequested && (
                <div className="card p-6">
                  <div className="flex items-center gap-2">
                    <StatusPill status={booking.status} locale={locale} />
                  </div>
                  <p className="text-sm text-[var(--color-slate)] mt-3">
                    {locale === "ko"
                      ? "이 번호로 예약 상태를 조회할 수 있습니다:"
                      : "Track your booking with this reference:"}
                  </p>
                  <div className="font-display text-xl font-bold mt-1">{booking.reference}</div>
                  <Link href={`/lookup?ref=${booking.reference}`} className="btn btn-outline w-full mt-4">
                    {locale === "ko" ? "예약 조회" : "Manage booking"}
                  </Link>
                </div>
              )}

              {paid && (
                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-slate)]">{locale === "ko" ? "결제 금액" : "Amount paid"}</span>
                    <span className="font-semibold">{formatMoney(booking.customerPrice, booking.currency)}</span>
                  </div>
                  {customerVoucher ? (
                    <Link href={`/voucher/${customerVoucher.code}`} className="btn btn-primary w-full mt-4">
                      {locale === "ko" ? "예약 바우처 보기" : "View voucher"}
                    </Link>
                  ) : (
                    <p className="text-sm text-[var(--color-slate)] mt-4">
                      {locale === "ko" ? "바우처가 곧 발송됩니다." : "Your voucher will be issued shortly."}
                    </p>
                  )}
                  <Link href={`/lookup?ref=${booking.reference}`} className="btn btn-ghost w-full mt-2">
                    {locale === "ko" ? "예약 조회" : "Manage booking"}
                  </Link>
                </div>
              )}

              {booking.status === "COMPLETED" && !booking.review && (
                <ReviewForm reference={booking.reference} locale={locale} />
              )}
              {booking.review && (
                <div className="card p-6">
                  <div className="text-sm text-[var(--color-slate)]">{locale === "ko" ? "내 후기" : "Your review"}</div>
                  <div className="text-2xl text-[var(--color-gold)] mt-1">{"★".repeat(booking.review.rating)}<span className="text-[var(--color-line)]">{"★".repeat(5 - booking.review.rating)}</span></div>
                  {booking.review.comment && <p className="text-sm mt-2">{booking.review.comment}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
