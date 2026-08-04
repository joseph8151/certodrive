import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Certo Drive...");

  const pw = await bcrypt.hash("password123", 10);

  // --- Admin ---
  const admin = await prisma.user.upsert({
    where: { email: "admin@certodrive.com" },
    update: {},
    create: {
      email: "admin@certodrive.com",
      passwordHash: pw,
      role: "ADMIN",
      name: "Certo Admin",
      locale: "ko",
    },
  });

  // --- Pricing config (singleton) ---
  await prisma.pricingConfig.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  // --- Commission policies ---
  await prisma.commissionPolicy.deleteMany();
  await prisma.commissionPolicy.createMany({
    data: [
      { scope: "GLOBAL", commissionRate: 0.22, minBookingFee: 15, priority: 0 },
      // Long-haul Western Europe: lower % but higher floor
      { scope: "COUNTRY", country: "프랑스", commissionRate: 0.14, minBookingFee: 25, priority: 1 },
      { scope: "COUNTRY", country: "France", commissionRate: 0.14, minBookingFee: 25, priority: 1 },
      { scope: "COUNTRY", country: "영국", commissionRate: 0.14, minBookingFee: 25, priority: 1 },
      { scope: "COUNTRY", country: "United Kingdom", commissionRate: 0.14, minBookingFee: 25, priority: 1 },
      // Short-haul low-cost: rely on the minimum booking fee
      { scope: "COUNTRY", country: "대한민국", commissionRate: 0.25, minBookingFee: 12, priority: 1 },
      { scope: "COUNTRY", country: "South Korea", commissionRate: 0.25, minBookingFee: 12, priority: 1 },
    ],
  });

  // --- Exchange rates ---
  for (const [target, rate] of [["KRW", 1350], ["EUR", 0.92], ["GBP", 0.79], ["JPY", 150]] as const) {
    await prisma.exchangeRate.upsert({
      where: { base_target: { base: "USD", target } },
      update: { rate },
      create: { base: "USD", target, rate },
    });
  }

  // --- Registered route prices ---
  await prisma.priceRule.deleteMany();
  const rules = [
    // Seoul ICN → city (KO labels, matches widget selectors)
    { country: "대한민국", city: "서울", pickupLocation: "ICN 인천공항", destination: "서울 시내", vehicleCategory: "Business Sedan", driverSupplyPrice: 85, currency: "USD", estimatedMinutes: 70 },
    { country: "대한민국", city: "서울", pickupLocation: "ICN 인천공항", destination: "서울 시내", vehicleCategory: "Economy Sedan", driverSupplyPrice: 65, currency: "USD", estimatedMinutes: 70 },
    { country: "대한민국", city: "서울", pickupLocation: "ICN 인천공항", destination: "서울 시내", vehicleCategory: "Premium Van", driverSupplyPrice: 130, currency: "USD", estimatedMinutes: 70 },
    // Paris CDG → city
    { country: "프랑스", city: "파리", pickupLocation: "CDG 샤를드골공항", destination: "파리 시내", vehicleCategory: "Business Sedan", driverSupplyPrice: 110, currency: "EUR", estimatedMinutes: 55 },
    { country: "프랑스", city: "파리", pickupLocation: "CDG 샤를드골공항", destination: "파리 시내", vehicleCategory: "Premium Sedan", driverSupplyPrice: 145, currency: "EUR", estimatedMinutes: 55 },
    // English-label equivalents
    { country: "South Korea", city: "Seoul", pickupLocation: "ICN Incheon", destination: "Seoul city", vehicleCategory: "Business Sedan", driverSupplyPrice: 85, currency: "USD", estimatedMinutes: 70 },
    { country: "France", city: "Paris", pickupLocation: "CDG Charles de Gaulle", destination: "Paris city", vehicleCategory: "Business Sedan", driverSupplyPrice: 110, currency: "EUR", estimatedMinutes: 55 },
  ];
  for (const r of rules) await prisma.priceRule.create({ data: r });

  // --- Driver partners ---
  async function makeDriver(opts: {
    email: string;
    name: string;
    business: string;
    country: string;
    city: string;
    airports: string[];
    regions: string[];
    korean: string;
    category: string;
    supply: number;
    currency: string;
  }) {
    const user = await prisma.user.upsert({
      where: { email: opts.email },
      update: {},
      create: { email: opts.email, passwordHash: pw, role: "DRIVER", name: opts.name },
    });
    const profile = await prisma.driverProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        partnerType: "INDIVIDUAL",
        businessName: opts.business,
        contactName: opts.name,
        country: opts.country,
        city: opts.city,
        airports: JSON.stringify(opts.airports),
        serviceRegions: JSON.stringify(opts.regions),
        koreanLevel: opts.korean,
        englishLevel: "CONVERSATIONAL",
        settlementCurrency: opts.currency,
        baseSupplyPrice: opts.supply,
        termsAgreed: true,
        approvalStatus: "APPROVED",
        rating: 4.9,
        ratingCount: 42,
        driverLicenseUrl: "uploads/sample-license.pdf",
        insuranceUrl: "uploads/sample-insurance.pdf",
      },
    });
    await prisma.vehicle.create({
      data: {
        driverProfileId: profile.id,
        category: opts.category,
        makeModel: "Mercedes-Benz E-Class",
        year: 2023,
        maxPassengers: 3,
        maxLuggage: 3,
      },
    });
    return profile;
  }

  await makeDriver({
    email: "driver.seoul@certodrive.com",
    name: "김민수",
    business: "Seoul Premium Transfers",
    country: "대한민국",
    city: "서울",
    airports: ["ICN 인천공항", "GMP 김포공항"],
    regions: ["서울", "인천", "경기"],
    korean: "NATIVE",
    category: "Business Sedan",
    supply: 80,
    currency: "KRW",
  });
  await makeDriver({
    email: "driver.paris@certodrive.com",
    name: "David Park",
    business: "Paris Korean Chauffeur",
    country: "프랑스",
    city: "파리",
    airports: ["CDG 샤를드골공항", "ORY 오를리공항"],
    regions: ["파리", "베르사유"],
    korean: "FLUENT",
    category: "Premium Sedan",
    supply: 120,
    currency: "EUR",
  });
  await makeDriver({
    email: "driver.tokyo@certodrive.com",
    name: "이지훈",
    business: "Tokyo K-Drive",
    country: "일본",
    city: "도쿄",
    airports: ["NRT 나리타공항", "HND 하네다공항"],
    regions: ["도쿄", "요코하마"],
    korean: "NATIVE",
    category: "Business Sedan",
    supply: 15000,
    currency: "JPY",
  });

  // --- Promotion ---
  await prisma.promotion.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", description: "First booking 10% off", discountType: "PERCENT", value: 10, active: true },
  });

  console.log("Seed complete.");
  console.log("  Admin:  admin@certodrive.com / password123");
  console.log("  Driver: driver.seoul@certodrive.com / password123");
  console.log(`  Admin id: ${admin.id}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
