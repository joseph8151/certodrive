import { getSession } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import { safeJson } from "@/lib/utils";
import DriverProfileEditor from "@/components/DriverProfileEditor";

export default async function DriverProfilePage() {
  const session = (await getSession())!;
  const locale = await getLocale();
  const L = locale === "ko";

  const profile = await prisma.driverProfile.findUnique({
    where: { userId: session.userId },
    include: { vehicles: { orderBy: { createdAt: "asc" } } },
  });
  if (!profile) return <div className="card p-6">{L ? "프로필을 찾을 수 없습니다." : "Profile not found."}</div>;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">{L ? "프로필 및 차량 관리" : "Profile & vehicles"}</h1>
        <p className="text-sm text-[var(--color-slate)] mt-1">{L ? "서비스 지역, 차량, 서류, 예약 가능 상태를 관리하세요." : "Manage your service areas, vehicles, documents and availability."}</p>
      </div>
      <DriverProfileEditor
        locale={locale}
        profile={{
          businessName: profile.businessName, contactName: profile.contactName, city: profile.city, country: profile.country,
          airports: safeJson<string[]>(profile.airports, []), serviceRegions: safeJson<string[]>(profile.serviceRegions, []),
          koreanLevel: profile.koreanLevel, englishLevel: profile.englishLevel,
          bankAccount: profile.bankAccount, settlementCurrency: profile.settlementCurrency, baseSupplyPrice: profile.baseSupplyPrice,
          availabilityNote: profile.availabilityNote, acceptingBookings: profile.acceptingBookings,
          transportLicenseUrl: profile.transportLicenseUrl, driverLicenseUrl: profile.driverLicenseUrl,
          insuranceUrl: profile.insuranceUrl, vehicleRegUrl: profile.vehicleRegUrl,
        }}
        vehicles={profile.vehicles.map((v) => ({ id: v.id, category: v.category, makeModel: v.makeModel, maxPassengers: v.maxPassengers, maxLuggage: v.maxLuggage }))}
      />
    </div>
  );
}
