import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getLocale } from "@/lib/locale";
import { formatMoney } from "@/lib/utils";
import PrintButton from "@/components/PrintButton";

export default async function VoucherPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const locale = await getLocale();
  const L = locale === "ko";

  const voucher = await prisma.voucher.findUnique({
    where: { code },
    include: { booking: { include: { assignedDriver: { include: { vehicles: true } } } } },
  });
  if (!voucher) notFound();
  const b = voucher.booking;
  const isDriver = voucher.type === "DRIVER";
  const driver = b.assignedDriver;

  const rows: [string, string][] = [
    [L ? "예약 번호" : "Reference", b.reference],
    [L ? "서비스" : "Service", b.serviceType.replace(/_/g, " ")],
    [L ? "픽업" : "Pickup", `${b.pickupLocation}, ${b.pickupCity}`],
    [L ? "목적지" : "Destination", b.destination],
    [L ? "일시" : "Date & time", `${b.serviceDate} ${b.serviceTime}`],
    [L ? "차량" : "Vehicle", b.vehicleCategory],
    [L ? "승객" : "Passengers", `${b.passengers} (${b.adults}+${b.children})`],
    [L ? "수하물" : "Luggage", String(b.luggage)],
  ];
  if (b.flightNumber) rows.push([L ? "항공편" : "Flight", b.flightNumber]);

  return (
    <div className="min-h-screen bg-[var(--color-mist)] py-8 print:bg-white print:py-0">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <a href="/" className="font-display text-lg font-bold text-[var(--color-navy)]">Certo<span className="text-[var(--color-gold)]"> Drive</span></a>
          <PrintButton locale={locale} />
        </div>

        <div className="bg-white rounded-2xl border border-[var(--color-line)] overflow-hidden print:border-0">
          <div className="hero-gradient text-white p-8">
            <div className="flex justify-between items-start">
              <div>
                <div className="eyebrow text-[var(--color-gold)]">{isDriver ? (L ? "기사용 바우처" : "DRIVER VOUCHER") : (L ? "예약 바우처" : "BOOKING VOUCHER")}</div>
                <div className="font-display text-3xl font-bold mt-2">Certo Drive</div>
              </div>
              <div className="text-right">
                <div className="text-white/60 text-xs">{L ? "바우처 코드" : "Voucher code"}</div>
                <div className="font-mono text-lg font-bold">{voucher.code}</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid sm:grid-cols-2 gap-x-8">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5 border-b border-[var(--color-line)] text-sm">
                  <span className="text-[var(--color-slate)]">{k}</span>
                  <span className="font-medium text-right">{v}</span>
                </div>
              ))}
            </div>

            {b.airportPicket && (
              <div className="mt-5 rounded-lg bg-[#fdf3e0] text-[#9a6a12] px-4 py-3 text-sm">
                🪧 {L ? `입국장에서 "${b.customerName}" 이름 피켓으로 안내합니다.` : `Your driver will hold a name board reading "${b.customerName}" at arrivals.`}
              </div>
            )}

            {/* Driver / customer party info */}
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-[var(--color-mist)] p-4">
                <div className="text-xs text-[var(--color-slate)] mb-1">{L ? "고객" : "Customer"}</div>
                <div className="font-semibold">{b.customerName}</div>
                {(isDriver) && <div className="text-sm text-[var(--color-slate)]">{b.customerPhone}{b.messenger ? ` · ${b.messenger}` : ""}</div>}
              </div>
              <div className="rounded-lg bg-[var(--color-mist)] p-4">
                <div className="text-xs text-[var(--color-slate)] mb-1">{L ? "기사" : "Chauffeur"}</div>
                {driver ? (
                  <>
                    <div className="font-semibold">{driver.contactName}</div>
                    <div className="text-sm text-[var(--color-slate)]">{driver.businessName}{driver.vehicles[0] ? ` · ${driver.vehicles[0].makeModel ?? driver.vehicles[0].category}` : ""}</div>
                  </>
                ) : (
                  <div className="text-sm text-[var(--color-slate)]">{L ? "배정 예정" : "To be assigned"}</div>
                )}
              </div>
            </div>

            {!isDriver && b.customerPrice != null && (
              <div className="mt-6 flex justify-between items-center rounded-lg bg-[var(--color-ink)] text-white px-5 py-4">
                <span className="font-medium">{L ? "결제 완료 금액" : "Amount paid"}</span>
                <span className="font-display text-xl font-bold">{formatMoney(b.customerPrice, b.currency)}</span>
              </div>
            )}

            {b.specialRequest && (
              <div className="mt-5 text-sm">
                <div className="text-xs text-[var(--color-slate)] mb-1">{L ? "특별 요청" : "Special request"}</div>
                <p>{b.specialRequest}</p>
              </div>
            )}

            <div className="mt-8 pt-5 border-t border-[var(--color-line)] text-xs text-[var(--color-slate)] text-center">
              {L ? "24시간 한국어 고객지원 · support@certodrive.com · 문제 발생 시 Certo Drive가 직접 대응합니다."
                 : "24/7 Korean support · support@certodrive.com · Certo Drive handles any issue directly."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
