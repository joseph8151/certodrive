import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { bookingSchema } from "@/lib/validation";
import { computeCustomerPrice, findRoutePrice } from "@/lib/pricing";
import { generateReference } from "@/lib/utils";
import { sendNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const d = parsed.data;
  const reference = generateReference();
  const route = `${d.pickupLocation} → ${d.destination}`;
  const dateTime = `${d.serviceDate} ${d.serviceTime}`;

  // Resolve a promotion, if provided.
  let discountAmount = 0;
  if (d.promotionCode) {
    const promo = await prisma.promotion.findUnique({ where: { code: d.promotionCode.toUpperCase() } });
    if (promo && promo.active && (!promo.expiresAt || promo.expiresAt > new Date())) {
      // Percent discounts are resolved against the computed price below; fixed here.
      if (promo.discountType === "FIXED") discountAmount = promo.value;
    }
  }

  // Instant-price path: is this a registered route?
  const rule = await findRoutePrice({
    country: d.pickupCountry,
    city: d.pickupCity,
    pickupLocation: d.pickupLocation,
    destination: d.destination,
    vehicleCategory: d.vehicleCategory,
  });

  let supplyPrice: number | null = null;
  let customerPrice: number | null = null;
  let marginAmount: number | null = null;
  let priceBreakdown: string | null = null;
  let currency = "USD";
  let status = "QUOTE_REQUESTED";
  let isInstantPriced = false;

  if (rule) {
    const pricing = await computeCustomerPrice({
      supplyPrice: rule.driverSupplyPrice,
      currency: rule.currency,
      country: d.pickupCountry,
      city: d.pickupCity,
      pickupLocation: d.pickupLocation,
      destination: d.destination,
      serviceDate: d.serviceDate,
      serviceTime: d.serviceTime,
      koreanDriverRequired: d.koreanDriverRequired,
      childSeat: d.childSeat,
      airportPicket: d.airportPicket,
      discountAmount,
    });
    supplyPrice = pricing.supplyPrice;
    customerPrice = pricing.customerPrice;
    marginAmount = pricing.marginAmount;
    priceBreakdown = JSON.stringify(pricing.lineItems);
    currency = pricing.currency;
    status = "AWAITING_CUSTOMER_PAYMENT";
    isInstantPriced = true;
  }

  const booking = await prisma.booking.create({
    data: {
      reference,
      customerName: d.customerName,
      customerEmail: d.customerEmail.toLowerCase(),
      customerPhone: d.customerPhone,
      messenger: d.messenger ?? null,
      serviceType: d.serviceType,
      tripType: d.tripType,
      pickupCountry: d.pickupCountry,
      pickupCity: d.pickupCity,
      pickupLocation: d.pickupLocation,
      destination: d.destination,
      serviceDate: d.serviceDate,
      serviceTime: d.serviceTime,
      returnDate: d.returnDate ?? null,
      returnTime: d.returnTime ?? null,
      flightNumber: d.flightNumber ?? null,
      passengers: d.passengers,
      adults: d.adults,
      children: d.children,
      luggage: d.luggage,
      vehicleCategory: d.vehicleCategory,
      koreanDriverRequired: d.koreanDriverRequired,
      childSeat: d.childSeat,
      airportPicket: d.airportPicket,
      hourlyDuration: d.hourlyDuration ?? null,
      specialRequest: d.specialRequest ?? null,
      currency,
      supplyPrice,
      customerPrice,
      marginAmount,
      priceBreakdown,
      promotionCode: d.promotionCode ?? null,
      discountAmount,
      status,
      isInstantPriced,
      statusEvents: {
        create: { to: status, actor: "customer", note: "Booking created" },
      },
    },
  });

  // Quote-request path: broadcast to approved drivers covering this city/country.
  if (!isInstantPriced) {
    const drivers = await prisma.driverProfile.findMany({
      where: {
        approvalStatus: "APPROVED",
        country: d.pickupCountry,
        OR: [{ city: d.pickupCity }, { serviceRegions: { contains: d.pickupCity } }],
      },
      include: { user: true },
      take: 25,
    });

    for (const driver of drivers) {
      await prisma.driverQuote.create({
        data: {
          bookingId: booking.id,
          driverProfileId: driver.id,
          status: "REQUESTED",
          currency: driver.settlementCurrency,
        },
      });
      await sendNotification({
        template: "NEW_BOOKING_REQUEST",
        recipientType: "DRIVER",
        to: driver.user.email,
        bookingId: booking.id,
        context: { reference, driverName: driver.contactName, route, dateTime },
      });
    }

    await sendNotification({
      template: "QUOTE_REQUESTED",
      recipientType: "CUSTOMER",
      to: booking.customerEmail,
      bookingId: booking.id,
      context: { reference, customerName: booking.customerName, route },
    });
  } else {
    await sendNotification({
      template: "QUOTE_RECEIVED",
      recipientType: "CUSTOMER",
      to: booking.customerEmail,
      bookingId: booking.id,
      context: {
        reference,
        customerName: booking.customerName,
        route,
        amount: `${customerPrice} ${currency}`,
      },
    });
  }

  return NextResponse.json({
    reference: booking.reference,
    status: booking.status,
    isInstantPriced,
    customerPrice,
    currency,
  });
}
