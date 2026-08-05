import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import { formatMoney, safeJson } from "@/lib/utils";
import AdminQuickAction from "@/components/AdminQuickAction";
import AdminDriverForm from "@/components/AdminDriverForm";

export default async function AdminDrivers() {
  const locale = await getLocale();
  const L = locale === "ko";

  const drivers = await prisma.driverProfile.findMany({
    include: { user: true, vehicles: true, _count: { select: { bookings: true } } },
    orderBy: [{ approvalStatus: "asc" }, { createdAt: "desc" }],
  });

  const toneFor = (s: string) => (s === "APPROVED" ? "green" : s === "PENDING" ? "amber" : "red");

  return (
    <div className="grid gap-6">
      <h1 className="font-display text-2xl font-bold">{L ? "기사 파트너" : "Driver partners"}</h1>

      <AdminDriverForm locale={locale} />

      <div className="grid gap-4">
        {drivers.map((d) => {
          const docs = [
            d.driverLicenseUrl && "면허",
            d.insuranceUrl && "보험",
            d.transportLicenseUrl && "운송면허",
            d.vehicleRegUrl && "차량등록",
          ].filter(Boolean);
          const airports = safeJson<string[]>(d.airports, []);
          return (
            <div key={d.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{d.contactName}</span>
                    <span className="text-sm text-[var(--color-slate)]">· {d.businessName}</span>
                    <span className={`pill pill-${toneFor(d.approvalStatus)}`}>{d.approvalStatus}</span>
                  </div>
                  <div className="text-sm text-[var(--color-slate)] mt-1 break-words">
                    {d.city}, {d.country} · {d.partnerType} · {d.user.email}
                  </div>
                  {(d.licenseType || d.transportLicenseNo) && (
                    <div className="text-xs mt-1">
                      <span className="pill pill-blue">{L ? "면허" : "Licence"}: {d.licenseType ?? "—"}{d.transportLicenseNo ? ` · ${d.transportLicenseNo}` : ""}</span>
                    </div>
                  )}
                  <div className="text-sm text-[var(--color-slate)] mt-1">
                    {L ? "한국어" : "Korean"} {d.koreanLevel} · {L ? "영어" : "English"} {d.englishLevel} · ★{d.rating.toFixed(1)} ({d.ratingCount})
                    {airports.length > 0 && ` · ${airports.join(", ")}`}
                  </div>
                  <div className="text-xs text-[var(--color-slate)] mt-1">
                    {L ? "차량" : "Vehicles"}: {d.vehicles.map((v) => v.category).join(", ") || "—"} ·
                    {L ? " 서류" : " Docs"}: {docs.length > 0 ? docs.join(", ") : (L ? "미제출" : "none")} ·
                    {L ? " 정산" : " Settle"}: {d.baseSupplyPrice ? formatMoney(d.baseSupplyPrice, d.settlementCurrency) : "—"} ·
                    {L ? " 예약" : " Trips"}: {d._count.bookings}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {d.approvalStatus !== "APPROVED" && (
                    <AdminQuickAction body={{ action: "DRIVER_APPROVAL", driverProfileId: d.id, status: "APPROVED" }} label={L ? "승인" : "Approve"} variant="primary" />
                  )}
                  {d.approvalStatus !== "REJECTED" && (
                    <AdminQuickAction body={{ action: "DRIVER_APPROVAL", driverProfileId: d.id, status: "REJECTED" }} label={L ? "반려" : "Reject"} variant="ghost" />
                  )}
                  {d.approvalStatus === "APPROVED" && (
                    <AdminQuickAction body={{ action: "DRIVER_APPROVAL", driverProfileId: d.id, status: "SUSPENDED" }} label={L ? "정지" : "Suspend"} variant="outline" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
