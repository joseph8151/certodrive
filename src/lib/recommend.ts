import { prisma } from "./db";
import { safeJson } from "./utils";

// Ranks approved driver partners for a booking, so admins get a one-click
// "recommended driver" list instead of scanning the whole roster.
// Scoring is transparent: each signal contributes points and a human reason.

export interface DriverRecommendation {
  driverProfileId: string;
  name: string;
  business: string;
  city: string;
  score: number;
  reasons: string[];
  offeredPrice: number | null;
  currency: string;
  rating: number;
  koreanLevel: string;
}

const KOREAN_SCORE: Record<string, number> = { NATIVE: 25, FLUENT: 18, CONVERSATIONAL: 8, BASIC: 2, NONE: 0 };

export async function recommendDrivers(bookingId: string, locale: "ko" | "en" = "ko"): Promise<DriverRecommendation[]> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return [];
  const L = locale === "ko";

  const drivers = await prisma.driverProfile.findMany({
    where: { approvalStatus: "APPROVED", country: booking.pickupCountry },
    include: {
      user: true,
      vehicles: true,
      driverQuotes: { where: { bookingId } },
    },
  });

  const recs: DriverRecommendation[] = drivers.map((d) => {
    let score = 0;
    const reasons: string[] = [];
    const regions = safeJson<string[]>(d.serviceRegions, []);

    // Location match
    if (d.city === booking.pickupCity) { score += 40; reasons.push(L ? "픽업 도시 일치" : "Pickup city match"); }
    else if (regions.includes(booking.pickupCity)) { score += 30; reasons.push(L ? "서비스 지역 커버" : "Covers region"); }

    // Korean language
    const kScore = KOREAN_SCORE[d.koreanLevel] ?? 0;
    if (booking.koreanDriverRequired) {
      score += kScore;
      if (kScore >= 18) reasons.push(L ? "한국어 능숙" : "Fluent Korean");
      else if (kScore === 0) { score -= 25; reasons.push(L ? "⚠ 한국어 불가" : "⚠ No Korean"); }
    } else if (kScore >= 18) {
      score += 5;
    }

    // Vehicle match
    if (d.vehicles.some((v) => v.category === booking.vehicleCategory)) {
      score += 15; reasons.push(L ? "요청 차량 보유" : "Has requested vehicle");
    }

    // Rating & reliability
    score += d.rating * 4;
    if (d.rating >= 4.5 && d.ratingCount > 0) reasons.push(L ? `평점 ${d.rating.toFixed(1)}` : `Rated ${d.rating.toFixed(1)}`);
    score -= d.cancelRate * 20;

    // Availability
    if (!d.acceptingBookings) { score -= 50; reasons.push(L ? "예약 미수락 상태" : "Not accepting bookings"); }

    // Existing offer for this booking
    const offer = d.driverQuotes.find((q) => q.status === "OFFERED");
    let offeredPrice: number | null = null;
    if (offer?.supplyPrice != null) {
      score += 20; offeredPrice = offer.supplyPrice;
      reasons.push(L ? "이 예약에 견적 제출" : "Quoted this booking");
    }

    return {
      driverProfileId: d.id,
      name: d.contactName,
      business: d.businessName,
      city: d.city,
      score: Math.round(score),
      reasons,
      offeredPrice,
      currency: offer?.currency ?? d.settlementCurrency,
      rating: d.rating,
      koreanLevel: d.koreanLevel,
    };
  });

  return recs.sort((a, b) => b.score - a.score).slice(0, 5);
}
