import { prisma } from "./db";

// ---------------------------------------------------------------------------
// Pricing engine
//
// Final customer price = supply price + platform margin + surcharges + fees,
// with the platform margin floored by the applicable minimum booking fee.
// Every input is optional so the same function serves the instant-quote path
// (PriceRule found) and the admin manual-pricing path (driver supply price).
// ---------------------------------------------------------------------------

export interface PricingInput {
  supplyPrice: number;
  currency?: string;
  country?: string;
  city?: string;
  pickupLocation?: string;
  destination?: string;
  serviceDate?: string; // ISO date
  serviceTime?: string; // HH:mm
  koreanDriverRequired?: boolean;
  childSeat?: boolean;
  airportPicket?: boolean;
  extraWaitingHours?: number;
  tollAndParking?: number;
  isHoliday?: boolean;
  discountAmount?: number;
  // Optional promotion applied to the pre-payment-fee subtotal. PERCENT is
  // resolved here (needs the subtotal); FIXED can also be passed via discountAmount.
  promo?: { discountType: "PERCENT" | "FIXED"; value: number };
}

export interface PriceLineItem {
  key: string;
  labelKo: string;
  labelEn: string;
  amount: number;
}

export interface PricingResult {
  currency: string;
  supplyPrice: number;
  customerPrice: number;
  marginAmount: number;
  commissionRate: number;
  minBookingFee: number;
  lineItems: PriceLineItem[];
}

// A short list of country-level public holidays used for the holiday surcharge.
// In production this would come from a maintained calendar / CMS table.
const HOLIDAYS = new Set<string>([
  "2026-01-01",
  "2026-12-25",
  "2026-12-31",
  "2026-02-17", // Seollal example
  "2026-09-25", // Chuseok example
]);

function round(n: number, currency: string): number {
  // Zero-decimal currencies get whole numbers.
  const zeroDecimal = ["KRW", "JPY"];
  return zeroDecimal.includes(currency) ? Math.round(n) : Math.round(n * 100) / 100;
}

async function resolveCommissionPolicy(input: PricingInput) {
  const policies = await prisma.commissionPolicy.findMany({ where: { active: true } });
  const scored = policies
    .map((p) => {
      let score = -1;
      if (p.scope === "GLOBAL") score = 0;
      if (p.scope === "COUNTRY" && p.country && p.country === input.country) score = 1;
      if (p.scope === "CITY" && p.city && p.city === input.city) score = 2;
      if (
        p.scope === "ROUTE" &&
        p.pickupLocation === input.pickupLocation &&
        p.destination === input.destination
      )
        score = 3;
      return { p, score: score + p.priority / 100 };
    })
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.p ?? null;
}

export async function computeCustomerPrice(input: PricingInput): Promise<PricingResult> {
  const config =
    (await prisma.pricingConfig.findUnique({ where: { id: "default" } })) ??
    (await prisma.pricingConfig.create({ data: { id: "default" } }));

  const policy = await resolveCommissionPolicy(input);
  const commissionRate = policy?.commissionRate ?? 0.2;
  const minBookingFee = policy?.minBookingFee ?? 15;
  const currency = input.currency ?? config.defaultCurrency;

  const lineItems: PriceLineItem[] = [];
  const supply = Math.max(0, input.supplyPrice || 0);

  lineItems.push({
    key: "supply",
    labelKo: "기본 운임",
    labelEn: "Base fare",
    amount: supply,
  });

  // Platform margin — the greater of the commission and the minimum booking fee.
  const commissionMargin = supply * commissionRate;
  const margin = Math.max(commissionMargin, minBookingFee);
  lineItems.push({
    key: "service",
    labelKo: "서비스 수수료",
    labelEn: "Service fee",
    amount: margin,
  });

  let subtotal = supply + margin;

  // Korean-speaking driver add-on
  if (input.koreanDriverRequired && config.koreanDriverFee > 0) {
    lineItems.push({
      key: "korean",
      labelKo: "한국어 기사 지정",
      labelEn: "Korean-speaking driver",
      amount: config.koreanDriverFee,
    });
    subtotal += config.koreanDriverFee;
  }

  // Night surcharge
  if (input.serviceTime) {
    const hour = parseInt(input.serviceTime.split(":")[0] ?? "12", 10);
    const isNight =
      config.nightStartHour > config.nightEndHour
        ? hour >= config.nightStartHour || hour < config.nightEndHour
        : hour >= config.nightStartHour && hour < config.nightEndHour;
    if (isNight && config.nightSurchargeRate > 0) {
      const amt = supply * config.nightSurchargeRate;
      lineItems.push({ key: "night", labelKo: "심야 할증", labelEn: "Night surcharge", amount: amt });
      subtotal += amt;
    }
  }

  // Holiday surcharge
  const holiday = input.isHoliday ?? (input.serviceDate ? HOLIDAYS.has(input.serviceDate) : false);
  if (holiday && config.holidaySurchargeRate > 0) {
    const amt = supply * config.holidaySurchargeRate;
    lineItems.push({ key: "holiday", labelKo: "휴일 할증", labelEn: "Holiday surcharge", amount: amt });
    subtotal += amt;
  }

  // Urgent booking surcharge (service starts within the urgent window)
  if (input.serviceDate && input.serviceTime) {
    const start = new Date(`${input.serviceDate}T${input.serviceTime}:00`);
    const hoursUntil = (start.getTime() - Date.now()) / 3_600_000;
    if (hoursUntil >= 0 && hoursUntil <= config.urgentWindowHours && config.urgentSurchargeRate > 0) {
      const amt = supply * config.urgentSurchargeRate;
      lineItems.push({ key: "urgent", labelKo: "긴급 예약 할증", labelEn: "Urgent booking", amount: amt });
      subtotal += amt;
    }
  }

  // Fixed add-ons
  if (input.childSeat) {
    lineItems.push({ key: "childseat", labelKo: "카시트", labelEn: "Child seat", amount: config.childSeatFee });
    subtotal += config.childSeatFee;
  }
  if (input.airportPicket) {
    lineItems.push({ key: "picket", labelKo: "공항 피켓", labelEn: "Airport meet & greet", amount: config.airportPicketFee });
    subtotal += config.airportPicketFee;
  }
  if (input.extraWaitingHours && input.extraWaitingHours > 0) {
    const amt = input.extraWaitingHours * config.extraWaitingFeePerHour;
    lineItems.push({ key: "waiting", labelKo: "추가 대기", labelEn: "Extra waiting", amount: amt });
    subtotal += amt;
  }
  if (input.tollAndParking && input.tollAndParking > 0) {
    lineItems.push({ key: "toll", labelKo: "톨게이트·주차", labelEn: "Toll & parking", amount: input.tollAndParking });
    subtotal += input.tollAndParking;
  }

  // Promotion discount — resolve percent against the current subtotal.
  let promoAmount = input.discountAmount ?? 0;
  if (input.promo) {
    promoAmount =
      input.promo.discountType === "PERCENT"
        ? subtotal * (input.promo.value / 100)
        : input.promo.value;
  }
  const discount = Math.min(promoAmount, subtotal);
  if (discount > 0) {
    lineItems.push({ key: "discount", labelKo: "프로모션 할인", labelEn: "Promotion discount", amount: -discount });
    subtotal -= discount;
  }

  // Payment processing fee
  const paymentFee = subtotal * config.paymentFeeRate + config.paymentFeeFixed;
  lineItems.push({ key: "payment", labelKo: "결제 수수료", labelEn: "Payment processing", amount: paymentFee });
  subtotal += paymentFee;

  const customerPrice = round(subtotal, currency);
  const rounded = lineItems.map((li) => ({ ...li, amount: round(li.amount, currency) }));

  return {
    currency,
    supplyPrice: round(supply, currency),
    customerPrice,
    marginAmount: round(customerPrice - supply, currency),
    commissionRate,
    minBookingFee,
    lineItems: rounded,
  };
}

// Resolve and validate a promotion code. Returns null if missing/invalid/expired
// or fully used, so callers can silently ignore bad codes.
export async function resolvePromotion(code: string | null | undefined) {
  if (!code) return null;
  const promo = await prisma.promotion.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!promo || !promo.active) return null;
  if (promo.expiresAt && promo.expiresAt < new Date()) return null;
  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) return null;
  return promo;
}

// ---------------------------------------------------------------------------
// Airport base-fare fallback
//
// When no admin-registered PriceRule matches, an airport pickup can still be
// priced instantly from a built-in table keyed by IATA code. The code is
// language-neutral, so this works identically for Korean and English bookings
// and needs no database seeding. Admin PriceRules always take precedence.
//
// Values are the driver supply price for a Business Sedan, airport → central
// city, in the airport's local currency. Other vehicle classes scale from it.
// ---------------------------------------------------------------------------
const BASE_AIRPORT_FARES: Record<string, { currency: string; base: number }> = {
  // Korea
  ICN: { currency: "KRW", base: 72000 }, GMP: { currency: "KRW", base: 58000 },
  // Japan
  NRT: { currency: "JPY", base: 21000 }, HND: { currency: "JPY", base: 16000 }, KIX: { currency: "JPY", base: 20000 },
  // France
  CDG: { currency: "EUR", base: 78 }, ORY: { currency: "EUR", base: 70 },
  // UK
  LHR: { currency: "GBP", base: 92 }, LGW: { currency: "GBP", base: 86 },
  // USA
  JFK: { currency: "USD", base: 120 }, EWR: { currency: "USD", base: 120 }, LGA: { currency: "USD", base: 115 },
  LAX: { currency: "USD", base: 110 }, SFO: { currency: "USD", base: 115 },
  // Italy / Spain
  FCO: { currency: "EUR", base: 74 }, BCN: { currency: "EUR", base: 62 },
  // Singapore
  SIN: { currency: "SGD", base: 70 },
};

const CLASS_MULTIPLIER: Record<string, number> = {
  "Economy Sedan": 0.82,
  "Business Sedan": 1.0,
  "Premium Sedan": 1.4,
  "Standard Van": 1.28,
  "Premium Van": 1.65,
  Minibus: 2.3,
  "VIP Chauffeur": 2.6,
};

function syntheticAirportRule(params: {
  pickupLocation: string;
  vehicleCategory: string;
}): { driverSupplyPrice: number; currency: string } | null {
  const multiplier = CLASS_MULTIPLIER[params.vehicleCategory];
  if (!multiplier) return null; // e.g. Hourly Hire — priced separately
  // Pull the leading 3-letter IATA code from the pickup label ("ICN 인천공항").
  const code = params.pickupLocation.toUpperCase().match(/\b([A-Z]{3})\b/)?.[1];
  if (!code) return null;
  const fare = BASE_AIRPORT_FARES[code];
  if (!fare) return null;
  const zeroDecimal = ["KRW", "JPY"].includes(fare.currency);
  const supply = fare.base * multiplier;
  return { driverSupplyPrice: zeroDecimal ? Math.round(supply) : Math.round(supply * 100) / 100, currency: fare.currency };
}

// Look up a registered route price for the instant-quote path. Falls back to
// the built-in airport base fare when no admin PriceRule matches.
export async function findRoutePrice(params: {
  country: string;
  city: string;
  pickupLocation: string;
  destination: string;
  vehicleCategory: string;
}): Promise<{ driverSupplyPrice: number; currency: string } | null> {
  const rules = await prisma.priceRule.findMany({
    where: {
      country: params.country,
      city: params.city,
      vehicleCategory: params.vehicleCategory,
      active: true,
    },
  });

  // Exact match on pickup + destination wins; otherwise fall back to a
  // same-city/category rule (useful when destination naming varies).
  const norm = (s: string) => s.trim().toLowerCase();
  const exact = rules.find(
    (r) => norm(r.pickupLocation) === norm(params.pickupLocation) && norm(r.destination) === norm(params.destination),
  );
  const pickupOnly = rules.find((r) => norm(r.pickupLocation) === norm(params.pickupLocation));
  return exact ?? pickupOnly ?? syntheticAirportRule(params);
}
