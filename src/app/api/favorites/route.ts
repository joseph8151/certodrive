import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Customer favorite routes for quick rebooking.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const b = await req.json().catch(() => null);

  // Derive route from an existing booking, or from explicit fields.
  let route: { serviceType: string; pickupCountry: string; pickupCity: string; pickupLocation: string; destination: string; vehicleCategory: string } | null = null;
  if (b?.reference) {
    const booking = await prisma.booking.findUnique({ where: { reference: b.reference } });
    if (!booking || (booking.customerUserId !== session.userId && booking.customerEmail.toLowerCase() !== session.email.toLowerCase())) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    route = { serviceType: booking.serviceType, pickupCountry: booking.pickupCountry, pickupCity: booking.pickupCity, pickupLocation: booking.pickupLocation, destination: booking.destination, vehicleCategory: booking.vehicleCategory };
  } else if (b?.pickupCountry && b?.pickupCity && b?.pickupLocation && b?.destination) {
    route = { serviceType: b.serviceType ?? "AIRPORT_PICKUP", pickupCountry: b.pickupCountry, pickupCity: b.pickupCity, pickupLocation: b.pickupLocation, destination: b.destination, vehicleCategory: b.vehicleCategory ?? "Business Sedan" };
  }
  if (!route) return NextResponse.json({ error: "Missing route" }, { status: 400 });

  // Avoid duplicates (same user + same route).
  const existing = await prisma.favoriteRoute.findFirst({
    where: { userId: session.userId, pickupLocation: route.pickupLocation, destination: route.destination, vehicleCategory: route.vehicleCategory },
  });
  if (existing) return NextResponse.json({ ok: true, id: existing.id, duplicate: true });

  const fav = await prisma.favoriteRoute.create({ data: { userId: session.userId, label: b?.label ?? null, ...route } });
  return NextResponse.json({ ok: true, id: fav.id });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const b = await req.json().catch(() => null);
  const fav = await prisma.favoriteRoute.findUnique({ where: { id: b?.id } });
  if (!fav || fav.userId !== session.userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.favoriteRoute.delete({ where: { id: fav.id } });
  return NextResponse.json({ ok: true });
}
