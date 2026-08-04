import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const reference: string | undefined = body?.reference;
  const email: string | undefined = body?.email;
  if (!reference || !email) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const booking = await prisma.booking.findUnique({ where: { reference } });
  if (!booking || booking.customerEmail.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "No booking found for that reference and email" }, { status: 404 });
  }
  return NextResponse.json({ reference: booking.reference });
}
