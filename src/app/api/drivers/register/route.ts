import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { driverRegistrationSchema } from "@/lib/validation";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = driverRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const d = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: d.email.toLowerCase() } });
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const docs = (body?.documents ?? {}) as Record<string, string>;

  const user = await prisma.user.create({
    data: {
      email: d.email.toLowerCase(),
      passwordHash: await hashPassword(d.password),
      role: "DRIVER",
      name: d.contactName,
      driverProfile: {
        create: {
          partnerType: d.partnerType,
          businessName: d.businessName,
          contactName: d.contactName,
          country: d.country,
          city: d.city,
          airports: JSON.stringify(d.airports),
          serviceRegions: JSON.stringify(d.serviceRegions),
          koreanLevel: d.koreanLevel,
          englishLevel: d.englishLevel,
          bankAccount: d.bankAccount ?? null,
          settlementCurrency: d.settlementCurrency,
          baseSupplyPrice: d.baseSupplyPrice ?? null,
          termsAgreed: d.termsAgreed,
          approvalStatus: "PENDING",
          transportLicenseUrl: docs.transportLicense ?? null,
          driverLicenseUrl: docs.driverLicense ?? null,
          insuranceUrl: docs.insurance ?? null,
          vehicleRegUrl: docs.vehicleReg ?? null,
          vehiclePhotosUrl: JSON.stringify(docs.vehiclePhotos ? [docs.vehiclePhotos] : []),
          vehicles: {
            create: {
              category: d.vehicleCategory,
              maxPassengers: d.maxPassengers,
              maxLuggage: d.maxLuggage,
            },
          },
        },
      },
    },
  });

  await createSession({ userId: user.id, role: "DRIVER", name: user.name, email: user.email });
  return NextResponse.json({ ok: true, redirect: "/driver" });
}
