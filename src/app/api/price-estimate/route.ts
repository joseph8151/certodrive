import { NextResponse } from "next/server";
import { computeCustomerPrice, findRoutePrice } from "@/lib/pricing";

// Live price preview for the booking widget. Returns an instant estimate when
// the route is registered, otherwise signals that a quote request is needed.
// Never creates a booking.
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b?.pickupCountry || !b?.pickupCity || !b?.pickupLocation || !b?.destination || !b?.vehicleCategory) {
    return NextResponse.json({ available: false, reason: "incomplete" });
  }

  const rule = await findRoutePrice({
    country: b.pickupCountry,
    city: b.pickupCity,
    pickupLocation: b.pickupLocation,
    destination: b.destination,
    vehicleCategory: b.vehicleCategory,
  });
  if (!rule) return NextResponse.json({ available: false, reason: "quote" });

  const pricing = await computeCustomerPrice({
    supplyPrice: rule.driverSupplyPrice,
    currency: rule.currency,
    country: b.pickupCountry,
    city: b.pickupCity,
    pickupLocation: b.pickupLocation,
    destination: b.destination,
    serviceDate: b.serviceDate,
    serviceTime: b.serviceTime,
    koreanDriverRequired: !!b.koreanDriverRequired,
    childSeat: !!b.childSeat,
    airportPicket: !!b.airportPicket,
  });

  return NextResponse.json({
    available: true,
    customerPrice: pricing.customerPrice,
    currency: pricing.currency,
    lineItems: pricing.lineItems,
  });
}
