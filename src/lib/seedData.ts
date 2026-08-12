import bcrypt from "bcryptjs";
import { prisma } from "./db";

// Idempotent seed used by the CLI (prisma/seed.ts) and the one-click
// /api/setup endpoint. Creates the admin, core pricing config, a few
// registered routes, demo drivers, promotions and sample reviews.
export async function seedDatabase() {
  const pw = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@certodrive.com" },
    update: {},
    create: { email: "admin@certodrive.com", passwordHash: pw, role: "ADMIN", name: "Certo Admin", locale: "ko" },
  });

  await prisma.pricingConfig.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } });

  await prisma.commissionPolicy.deleteMany();
  await prisma.commissionPolicy.createMany({
    data: [
      { scope: "GLOBAL", commissionRate: 0.22, minBookingFee: 15, priority: 0 },
      { scope: "COUNTRY", country: "프랑스", commissionRate: 0.14, minBookingFee: 25, priority: 1 },
      { scope: "COUNTRY", country: "France", commissionRate: 0.14, minBookingFee: 25, priority: 1 },
      { scope: "COUNTRY", country: "대한민국", commissionRate: 0.25, minBookingFee: 12, priority: 1 },
      { scope: "COUNTRY", country: "South Korea", commissionRate: 0.25, minBookingFee: 12, priority: 1 },
    ],
  });

  for (const [target, rate] of [["KRW", 1350], ["EUR", 0.92], ["GBP", 0.79], ["JPY", 150]] as const) {
    await prisma.exchangeRate.upsert({ where: { base_target: { base: "USD", target } }, update: { rate }, create: { base: "USD", target, rate } });
  }

  await prisma.priceRule.deleteMany();
  const rules = [
    { country: "대한민국", city: "서울", pickupLocation: "ICN 인천공항", destination: "서울 시내", vehicleCategory: "Business Sedan", driverSupplyPrice: 85, currency: "USD", estimatedMinutes: 70 },
    { country: "대한민국", city: "서울", pickupLocation: "ICN 인천공항", destination: "서울 시내", vehicleCategory: "Economy Sedan", driverSupplyPrice: 65, currency: "USD", estimatedMinutes: 70 },
    { country: "대한민국", city: "서울", pickupLocation: "ICN 인천공항", destination: "서울 시내", vehicleCategory: "Premium Van", driverSupplyPrice: 130, currency: "USD", estimatedMinutes: 70 },
    { country: "프랑스", city: "파리", pickupLocation: "CDG 샤를드골공항", destination: "파리 시내", vehicleCategory: "Business Sedan", driverSupplyPrice: 110, currency: "EUR", estimatedMinutes: 55 },
    { country: "프랑스", city: "파리", pickupLocation: "CDG 샤를드골공항", destination: "파리 시내", vehicleCategory: "Premium Sedan", driverSupplyPrice: 145, currency: "EUR", estimatedMinutes: 55 },
    { country: "South Korea", city: "Seoul", pickupLocation: "ICN Incheon", destination: "Seoul city", vehicleCategory: "Business Sedan", driverSupplyPrice: 85, currency: "USD", estimatedMinutes: 70 },
    { country: "France", city: "Paris", pickupLocation: "CDG Charles de Gaulle", destination: "Paris city", vehicleCategory: "Business Sedan", driverSupplyPrice: 110, currency: "EUR", estimatedMinutes: 55 },
  ];
  for (const r of rules) await prisma.priceRule.create({ data: r });

  async function makeDriver(o: { email: string; name: string; business: string; country: string; city: string; airports: string[]; regions: string[]; korean: string; category: string; supply: number; currency: string; licenseType?: string; licenseNo?: string }) {
    const user = await prisma.user.upsert({ where: { email: o.email }, update: {}, create: { email: o.email, passwordHash: pw, role: "DRIVER", name: o.name } });
    const profile = await prisma.driverProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id, partnerType: "INDIVIDUAL", businessName: o.business, contactName: o.name, country: o.country, city: o.city,
        airports: JSON.stringify(o.airports), serviceRegions: JSON.stringify(o.regions), koreanLevel: o.korean, englishLevel: "CONVERSATIONAL",
        licenseType: o.licenseType ?? null, transportLicenseNo: o.licenseNo ?? null,
        settlementCurrency: o.currency, baseSupplyPrice: o.supply, termsAgreed: true, approvalStatus: "APPROVED", rating: 0, ratingCount: 0,
      },
    });
    const hasVehicle = await prisma.vehicle.findFirst({ where: { driverProfileId: profile.id } });
    if (!hasVehicle) await prisma.vehicle.create({ data: { driverProfileId: profile.id, category: o.category, makeModel: "Mercedes-Benz E-Class", year: 2023, maxPassengers: 3, maxLuggage: 3 } });
    return profile;
  }

  const seoul = await makeDriver({ email: "driver.seoul@certodrive.com", name: "김민수", business: "Seoul Premium Transfers", country: "대한민국", city: "서울", airports: ["ICN 인천공항", "GMP 김포공항"], regions: ["서울", "인천", "경기"], korean: "NATIVE", category: "Business Sedan", supply: 80, currency: "KRW", licenseType: "RENTAL_CAR", licenseNo: "서울-대여-01234" });
  const paris = await makeDriver({ email: "driver.paris@certodrive.com", name: "David Park", business: "Paris Korean Chauffeur", country: "프랑스", city: "파리", airports: ["CDG 샤를드골공항", "ORY 오를리공항"], regions: ["파리", "베르사유"], korean: "FLUENT", category: "Premium Sedan", supply: 120, currency: "EUR" });
  const tokyo = await makeDriver({ email: "driver.tokyo@certodrive.com", name: "이지훈", business: "Tokyo K-Drive", country: "일본", city: "도쿄", airports: ["NRT 나리타공항", "HND 하네다공항"], regions: ["도쿄", "요코하마"], korean: "NATIVE", category: "Business Sedan", supply: 15000, currency: "JPY" });

  await prisma.promotion.upsert({ where: { code: "WELCOME10" }, update: {}, create: { code: "WELCOME10", description: "First booking 10% off", discountType: "PERCENT", value: 10, active: true } });

  // No fake reviews, ratings, trips or settlements are ever seeded. Purge any
  // sample data created by earlier seed versions so demo content never appears
  // as real customer activity. Reviews are only ever created by real bookings.
  const seedRefs = ["CD-SEED01", "CD-SEED02", "CD-SEED03"];
  const seededBookings = await prisma.booking.findMany({ where: { reference: { in: seedRefs } }, select: { id: true } });
  const seededIds = seededBookings.map((b) => b.id);
  if (seededIds.length) {
    await prisma.review.deleteMany({ where: { bookingId: { in: seededIds } } });
    await prisma.settlement.deleteMany({ where: { bookingId: { in: seededIds } } });
    await prisma.payment.deleteMany({ where: { bookingId: { in: seededIds } } });
    await prisma.booking.deleteMany({ where: { id: { in: seededIds } } });
  }
  for (const d of [seoul, paris, tokyo]) {
    await prisma.driverProfile.update({ where: { id: d.id }, data: { rating: 0, ratingCount: 0 } });
  }

  return { adminId: admin.id, admin: "admin@certodrive.com", password: "password123" };
}
