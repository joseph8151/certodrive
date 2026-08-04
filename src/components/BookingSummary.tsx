import type { Locale } from "@/lib/i18n";
import StatusPill from "./StatusPill";

type Booking = {
  reference: string;
  status: string;
  serviceType: string;
  tripType: string;
  pickupCountry: string;
  pickupCity: string;
  pickupLocation: string;
  destination: string;
  serviceDate: string;
  serviceTime: string;
  flightNumber: string | null;
  passengers: number;
  adults: number;
  children: number;
  luggage: number;
  vehicleCategory: string;
  koreanDriverRequired: boolean;
  childSeat: boolean;
  airportPicket: boolean;
  specialRequest: string | null;
  customerName: string;
};

export default function BookingSummary({ booking, locale }: { booking: Booking; locale: Locale }) {
  const rows: [string, string][] = [
    [locale === "ko" ? "픽업" : "Pickup", `${booking.pickupLocation} (${booking.pickupCity}, ${booking.pickupCountry})`],
    [locale === "ko" ? "목적지" : "Destination", booking.destination],
    [locale === "ko" ? "일시" : "Date & time", `${booking.serviceDate} ${booking.serviceTime}`],
    [locale === "ko" ? "차량" : "Vehicle", booking.vehicleCategory],
    [locale === "ko" ? "인원" : "Passengers", `${booking.passengers} (${locale === "ko" ? "성인" : "adults"} ${booking.adults}, ${locale === "ko" ? "어린이" : "children"} ${booking.children})`],
    [locale === "ko" ? "수하물" : "Luggage", String(booking.luggage)],
  ];
  if (booking.flightNumber) rows.push([locale === "ko" ? "항공편" : "Flight", booking.flightNumber]);

  const options = [
    booking.koreanDriverRequired && (locale === "ko" ? "한국어 기사" : "Korean driver"),
    booking.childSeat && (locale === "ko" ? "카시트" : "Child seat"),
    booking.airportPicket && (locale === "ko" ? "공항 피켓" : "Meet & greet"),
  ].filter(Boolean) as string[];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-[var(--color-slate)]">{locale === "ko" ? "예약 번호" : "Reference"}</div>
          <div className="font-display text-2xl font-bold">{booking.reference}</div>
        </div>
        <StatusPill status={booking.status} locale={locale} />
      </div>
      <div className="mt-5 divide-y divide-[var(--color-line)]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-2.5 text-sm">
            <span className="text-[var(--color-slate)]">{k}</span>
            <span className="font-medium text-right">{v}</span>
          </div>
        ))}
      </div>
      {options.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {options.map((o) => (
            <span key={o} className="pill pill-slate">{o}</span>
          ))}
        </div>
      )}
      {booking.specialRequest && (
        <div className="mt-4 text-sm">
          <div className="text-[var(--color-slate)] text-xs mb-1">{locale === "ko" ? "특별 요청" : "Special request"}</div>
          <p>{booking.specialRequest}</p>
        </div>
      )}
    </div>
  );
}
