// Shared domain constants used across customer, driver and admin surfaces.

export const VEHICLE_CATEGORIES = [
  "Economy Sedan",
  "Business Sedan",
  "Premium Sedan",
  "Standard Van",
  "Premium Van",
  "Minibus",
  "VIP Chauffeur",
  "Hourly Hire",
] as const;
export type VehicleCategory = (typeof VEHICLE_CATEGORIES)[number];

export const VEHICLE_META: Record<
  string,
  { pax: number; luggage: number; blurb: { ko: string; en: string } }
> = {
  "Economy Sedan": { pax: 3, luggage: 2, blurb: { ko: "합리적인 세단", en: "Comfortable value sedan" } },
  "Business Sedan": { pax: 3, luggage: 2, blurb: { ko: "비즈니스 세단", en: "Executive business sedan" } },
  "Premium Sedan": { pax: 3, luggage: 3, blurb: { ko: "프리미엄 세단", en: "Premium luxury sedan" } },
  "Standard Van": { pax: 6, luggage: 6, blurb: { ko: "표준 밴", en: "Spacious standard van" } },
  "Premium Van": { pax: 6, luggage: 6, blurb: { ko: "프리미엄 밴", en: "Premium van" } },
  Minibus: { pax: 12, luggage: 12, blurb: { ko: "미니버스", en: "Group minibus" } },
  "VIP Chauffeur": { pax: 3, luggage: 3, blurb: { ko: "VIP 의전 차량", en: "VIP chauffeur service" } },
  "Hourly Hire": { pax: 4, luggage: 3, blurb: { ko: "시간제 차량", en: "Hourly chauffeur hire" } },
};

export const SERVICE_TYPES = [
  "AIRPORT_PICKUP",
  "AIRPORT_DROPOFF",
  "INTERCITY",
  "HOURLY",
  "VIP",
] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

// Booking status machine ------------------------------------------------------
export const BOOKING_STATUSES = [
  "QUOTE_REQUESTED",
  "QUOTE_RECEIVED",
  "AWAITING_CUSTOMER_PAYMENT",
  "PAYMENT_COMPLETED",
  "DRIVER_ASSIGNMENT_PENDING",
  "DRIVER_ASSIGNED",
  "DRIVER_CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
  "NO_SHOW",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const STATUS_LABELS: Record<string, { ko: string; en: string; tone: string }> = {
  QUOTE_REQUESTED: { ko: "견적 요청", en: "Quote requested", tone: "amber" },
  QUOTE_RECEIVED: { ko: "견적 완료", en: "Quote received", tone: "amber" },
  AWAITING_CUSTOMER_PAYMENT: { ko: "결제 대기", en: "Awaiting payment", tone: "amber" },
  PAYMENT_COMPLETED: { ko: "결제 완료", en: "Payment completed", tone: "blue" },
  DRIVER_ASSIGNMENT_PENDING: { ko: "배차 대기", en: "Assigning driver", tone: "blue" },
  DRIVER_ASSIGNED: { ko: "기사 배정", en: "Driver assigned", tone: "blue" },
  DRIVER_CONFIRMED: { ko: "기사 확정", en: "Driver confirmed", tone: "green" },
  IN_PROGRESS: { ko: "운행 중", en: "In progress", tone: "green" },
  COMPLETED: { ko: "운행 완료", en: "Completed", tone: "green" },
  CANCELLED: { ko: "취소", en: "Cancelled", tone: "red" },
  REFUNDED: { ko: "환불", en: "Refunded", tone: "red" },
  NO_SHOW: { ko: "노쇼", en: "No show", tone: "red" },
};

export const LANGUAGE_LEVELS = ["NONE", "BASIC", "CONVERSATIONAL", "FLUENT", "NATIVE"] as const;

export const CURRENCIES = ["USD", "EUR", "GBP", "KRW", "JPY", "SGD", "AUD"] as const;

// A small curated set for the booking widget selectors (expandable via CMS).
export const POPULAR_CITIES: Record<string, { country: string; city: string; airports: string[] }[]> = {
  ko: [
    { country: "대한민국", city: "서울", airports: ["ICN 인천공항", "GMP 김포공항"] },
    { country: "일본", city: "도쿄", airports: ["NRT 나리타공항", "HND 하네다공항"] },
    { country: "프랑스", city: "파리", airports: ["CDG 샤를드골공항", "ORY 오를리공항"] },
    { country: "영국", city: "런던", airports: ["LHR 히드로공항", "LGW 개트윅공항"] },
    { country: "미국", city: "뉴욕", airports: ["JFK 케네디공항", "EWR 뉴어크공항"] },
    { country: "이탈리아", city: "로마", airports: ["FCO 피우미치노공항"] },
    { country: "스페인", city: "바르셀로나", airports: ["BCN 엘프라트공항"] },
    { country: "태국", city: "방콕", airports: ["BKK 수완나품공항"] },
  ],
  en: [
    { country: "South Korea", city: "Seoul", airports: ["ICN Incheon", "GMP Gimpo"] },
    { country: "Japan", city: "Tokyo", airports: ["NRT Narita", "HND Haneda"] },
    { country: "France", city: "Paris", airports: ["CDG Charles de Gaulle", "ORY Orly"] },
    { country: "United Kingdom", city: "London", airports: ["LHR Heathrow", "LGW Gatwick"] },
    { country: "United States", city: "New York", airports: ["JFK Kennedy", "EWR Newark"] },
    { country: "Italy", city: "Rome", airports: ["FCO Fiumicino"] },
    { country: "Spain", city: "Barcelona", airports: ["BCN El Prat"] },
    { country: "Thailand", city: "Bangkok", airports: ["BKK Suvarnabhumi"] },
  ],
};

export const COUNTRY_DIAL_CODES = [
  { code: "+82", label: "🇰🇷 +82" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+33", label: "🇫🇷 +33" },
  { code: "+39", label: "🇮🇹 +39" },
  { code: "+34", label: "🇪🇸 +34" },
  { code: "+81", label: "🇯🇵 +81" },
  { code: "+66", label: "🇹🇭 +66" },
  { code: "+65", label: "🇸🇬 +65" },
  { code: "+61", label: "🇦🇺 +61" },
];
