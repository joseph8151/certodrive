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

  const seoulDriver = await makeDriver({
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
  const parisDriver = await makeDriver({
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
  const tokyoDriver = await makeDriver({
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

  // --- Completed & reviewed bookings (social proof + analytics data) ---
  const sampleTrips = [
    { driver: seoulDriver, country: "대한민국", city: "서울", pickup: "ICN 인천공항", dest: "서울 시내", cat: "Business Sedan", cust: 145.65, supply: 85, cur: "USD", name: "박지연", rating: 5, comment: "입국장에서 피켓 들고 기다려주셔서 바로 찾았어요. 한국어로 편하게 소통하고 아이 카시트까지 준비해주셨습니다." },
    { driver: parisDriver, country: "프랑스", city: "파리", pickup: "CDG 샤를드골공항", dest: "파리 시내", cat: "Premium Sedan", cust: 210, supply: 145, cur: "EUR", name: "이현우", rating: 5, comment: "파리 도착하자마자 한인 기사님이 맞아주셔서 정말 안심됐어요. 하루 종일 전세로 관광까지 완벽했습니다." },
    { driver: tokyoDriver, country: "일본", city: "도쿄", pickup: "NRT 나리타공항", dest: "도쿄 시내", cat: "Business Sedan", cust: 180, supply: 120, cur: "USD", name: "최민서", rating: 4, comment: "가족 여행이라 짐이 많았는데 넉넉한 차량으로 편하게 이동했습니다. 시간 정확하고 친절하셨어요." },
  ];
  for (const [i, tr] of sampleTrips.entries()) {
    const ref = `CD-SEED0${i + 1}`;
    const existing = await prisma.booking.findUnique({ where: { reference: ref } });
    if (existing) continue;
    const booking = await prisma.booking.create({
      data: {
        reference: ref,
        customerName: tr.name,
        customerEmail: `sample${i + 1}@certodrive.com`,
        customerPhone: "+82 10-0000-0000",
        serviceType: "AIRPORT_PICKUP",
        pickupCountry: tr.country,
        pickupCity: tr.city,
        pickupLocation: tr.pickup,
        destination: tr.dest,
        serviceDate: "2026-07-15",
        serviceTime: "10:00",
        vehicleCategory: tr.cat,
        passengers: 2,
        adults: 2,
        luggage: 2,
        koreanDriverRequired: true,
        airportPicket: true,
        currency: tr.cur,
        supplyPrice: tr.supply,
        customerPrice: tr.cust,
        marginAmount: tr.cust - tr.supply,
        status: "COMPLETED",
        isInstantPriced: true,
        assignedDriverId: tr.driver.id,
        payment: { create: { amount: tr.cust, currency: tr.cur, method: "CARD", status: "COMPLETED", paidAt: new Date() } },
      },
    });
    await prisma.review.create({
      data: { bookingId: booking.id, driverProfileId: tr.driver.id, rating: tr.rating, comment: tr.comment, authorName: tr.name },
    });
    await prisma.settlement.create({
      data: { bookingId: booking.id, driverProfileId: tr.driver.id, amount: tr.supply, currency: tr.driver.settlementCurrency, status: "PAID", paidAt: new Date() },
    });
  }
  // Refresh driver ratings from seeded reviews.
  for (const d of [seoulDriver, parisDriver, tokyoDriver]) {
    const agg = await prisma.review.aggregate({ where: { driverProfileId: d.id }, _avg: { rating: true }, _count: true });
    await prisma.driverProfile.update({ where: { id: d.id }, data: { rating: agg._avg.rating ?? 0, ratingCount: agg._count } });
  }

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
