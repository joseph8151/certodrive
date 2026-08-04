import { notFound } from "next/navigation";
import ServiceLanding from "@/components/ServiceLanding";
import { getLocale } from "@/lib/locale";
import type { Locale } from "@/lib/i18n";

const SLUG_TO_SERVICE: Record<string, string> = {
  "airport-pickup": "AIRPORT_PICKUP",
  "airport-dropoff": "AIRPORT_DROPOFF",
  intercity: "INTERCITY",
  hourly: "HOURLY",
};

const CONTENT: Record<string, (l: Locale) => { title: string; subtitle: string; points: { t: string; d: string }[] }> = {
  "airport-pickup": (l) =>
    l === "ko"
      ? { title: "공항 픽업 예약", subtitle: "입국장에서 검증된 한인·한국어 기사가 이름 피켓으로 맞이합니다. 항공편 지연도 자동으로 확인합니다.", points: [
          { t: "공항 미팅·피켓", d: "입국장 도착 즉시 안내" },
          { t: "항공편 지연 확인", d: "추가 요금 없이 대기" },
          { t: "정찰제 요금", d: "톨게이트·주차 포함" },
          { t: "한국어 기사", d: "가족여행·출장 안심" },
        ] }
      : { title: "Airport pickup", subtitle: "A verified Korean-speaking chauffeur meets you at arrivals with a name board. We track your flight automatically.", points: [
          { t: "Meet & greet", d: "Welcomed the moment you land" },
          { t: "Flight tracking", d: "We wait, no extra charge" },
          { t: "Fixed pricing", d: "Tolls & parking included" },
          { t: "Korean drivers", d: "Ideal for families & business" },
        ] },
  "airport-dropoff": (l) =>
    l === "ko"
      ? { title: "공항 샌딩 예약", subtitle: "호텔이나 자택에서 공항까지 편안하게. 여유 있는 출발 시간으로 비행 걱정 없이 이동하세요.", points: [
          { t: "정시 픽업", d: "출발 시간 맞춤 배차" },
          { t: "넉넉한 수하물", d: "차량별 수하물 안내" },
          { t: "정찰제 요금", d: "숨겨진 비용 없음" },
          { t: "한국어 기사", d: "편안한 소통" },
        ] }
      : { title: "Airport drop-off", subtitle: "From your hotel or home to the airport in comfort, with time to spare.", points: [
          { t: "On-time pickup", d: "Timed to your departure" },
          { t: "Luggage space", d: "Right vehicle for your bags" },
          { t: "Fixed pricing", d: "No hidden fees" },
          { t: "Korean drivers", d: "Easy communication" },
        ] },
  intercity: (l) =>
    l === "ko"
      ? { title: "도시 간 이동", subtitle: "도시와 도시 사이 장거리 이동을 프리미엄 차량으로. 원하는 시간에 도어투도어로 모십니다.", points: [
          { t: "도어투도어", d: "환승·대기 없이 직행" },
          { t: "장거리 전문", d: "편안한 프리미엄 차량" },
          { t: "정찰제 요금", d: "거리 기반 투명 가격" },
          { t: "한국어 기사", d: "여정 내내 안심" },
        ] }
      : { title: "Intercity transfers", subtitle: "Long-distance city-to-city travel in a premium vehicle, door to door, on your schedule.", points: [
          { t: "Door to door", d: "No transfers or waiting" },
          { t: "Long-haul ready", d: "Comfortable premium cars" },
          { t: "Fixed pricing", d: "Transparent distance rates" },
          { t: "Korean drivers", d: "Reassurance all the way" },
        ] },
  hourly: (l) =>
    l === "ko"
      ? { title: "시간제 차량 예약", subtitle: "여러 목적지를 방문하거나 대기가 필요한 일정에. 기사와 차량을 시간 단위로 이용하세요.", points: [
          { t: "자유로운 일정", d: "여러 목적지 방문" },
          { t: "기사 대기 포함", d: "시간 단위 이용" },
          { t: "의전·비즈니스", d: "출장·행사 최적" },
          { t: "한국어 기사", d: "현지 안내까지" },
        ] }
      : { title: "Hourly chauffeur hire", subtitle: "For multi-stop days or itineraries that need waiting time. Book a car and chauffeur by the hour.", points: [
          { t: "Flexible itinerary", d: "Multiple stops" },
          { t: "Waiting included", d: "Billed by the hour" },
          { t: "Business & VIP", d: "Great for events" },
          { t: "Korean drivers", d: "Local guidance too" },
        ] },
};

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const serviceType = SLUG_TO_SERVICE[service];
  if (!serviceType) notFound();
  const locale = await getLocale();
  const c = CONTENT[service](locale);
  return <ServiceLanding locale={locale} serviceType={serviceType} title={c.title} subtitle={c.subtitle} points={c.points} />;
}

export function generateStaticParams() {
  return Object.keys(SLUG_TO_SERVICE).map((service) => ({ service }));
}
