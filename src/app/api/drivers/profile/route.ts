import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "DRIVER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await prisma.driverProfile.findUnique({ where: { userId: session.userId } });
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const action: string = body?.action;

  switch (action) {
    case "UPDATE_PROFILE": {
      const p = body.profile ?? {};
      await prisma.driverProfile.update({
        where: { id: profile.id },
        data: {
          businessName: p.businessName ?? profile.businessName,
          contactName: p.contactName ?? profile.contactName,
          city: p.city ?? profile.city,
          country: p.country ?? profile.country,
          airports: Array.isArray(p.airports) ? JSON.stringify(p.airports) : profile.airports,
          serviceRegions: Array.isArray(p.serviceRegions) ? JSON.stringify(p.serviceRegions) : profile.serviceRegions,
          koreanLevel: p.koreanLevel ?? profile.koreanLevel,
          englishLevel: p.englishLevel ?? profile.englishLevel,
          bankAccount: p.bankAccount ?? profile.bankAccount,
          settlementCurrency: p.settlementCurrency ?? profile.settlementCurrency,
          baseSupplyPrice: p.baseSupplyPrice != null ? Number(p.baseSupplyPrice) : profile.baseSupplyPrice,
          availabilityNote: p.availabilityNote ?? profile.availabilityNote,
          acceptingBookings: typeof p.acceptingBookings === "boolean" ? p.acceptingBookings : profile.acceptingBookings,
          // Document re-uploads (only overwrite when a new URL is provided)
          transportLicenseUrl: p.transportLicenseUrl ?? profile.transportLicenseUrl,
          driverLicenseUrl: p.driverLicenseUrl ?? profile.driverLicenseUrl,
          insuranceUrl: p.insuranceUrl ?? profile.insuranceUrl,
          vehicleRegUrl: p.vehicleRegUrl ?? profile.vehicleRegUrl,
        },
      });
      return NextResponse.json({ ok: true });
    }

    case "TOGGLE_ACCEPTING": {
      await prisma.driverProfile.update({ where: { id: profile.id }, data: { acceptingBookings: !profile.acceptingBookings } });
      return NextResponse.json({ ok: true, acceptingBookings: !profile.acceptingBookings });
    }

    case "ADD_VEHICLE": {
      const v = body.vehicle ?? {};
      await prisma.vehicle.create({
        data: {
          driverProfileId: profile.id,
          category: v.category ?? "Business Sedan",
          makeModel: v.makeModel ?? null,
          year: v.year ? Number(v.year) : null,
          maxPassengers: v.maxPassengers ? Number(v.maxPassengers) : 3,
          maxLuggage: v.maxLuggage ? Number(v.maxLuggage) : 2,
          photosUrl: v.photoUrl ? JSON.stringify([v.photoUrl]) : "[]",
          registrationUrl: v.registrationUrl ?? null,
        },
      });
      return NextResponse.json({ ok: true });
    }

    case "DELETE_VEHICLE": {
      const veh = await prisma.vehicle.findUnique({ where: { id: body.vehicleId } });
      if (!veh || veh.driverProfileId !== profile.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
      await prisma.vehicle.delete({ where: { id: body.vehicleId } });
      return NextResponse.json({ ok: true });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
