import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Customer review for a completed trip. Recomputes the assigned driver's
// average rating and review count from all their reviews.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const reference: string | undefined = body?.reference;
  const email: string | undefined = body?.email;
  const rating = Number(body?.rating);
  const comment: string | undefined = body?.comment;

  if (!reference || !email) return NextResponse.json({ error: "Missing reference or email" }, { status: 400 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { reference }, include: { review: true } });
  if (!booking || booking.customerEmail.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status !== "COMPLETED") {
    return NextResponse.json({ error: "You can review after the trip is completed" }, { status: 409 });
  }
  if (booking.review) return NextResponse.json({ error: "A review already exists for this booking" }, { status: 409 });

  await prisma.review.create({
    data: {
      bookingId: booking.id,
      driverProfileId: booking.assignedDriverId,
      rating,
      comment: comment?.slice(0, 2000) || null,
      authorName: booking.customerName,
    },
  });

  // Recompute the driver's rating.
  if (booking.assignedDriverId) {
    const agg = await prisma.review.aggregate({
      where: { driverProfileId: booking.assignedDriverId },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.driverProfile.update({
      where: { id: booking.assignedDriverId },
      data: { rating: agg._avg.rating ?? 0, ratingCount: agg._count },
    });
  }

  return NextResponse.json({ ok: true });
}
