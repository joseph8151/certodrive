import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b?.companyName || !b?.contactName || !b?.email) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  await prisma.corporateAccount.create({
    data: {
      companyName: String(b.companyName).slice(0, 200),
      contactName: String(b.contactName).slice(0, 200),
      email: String(b.email).slice(0, 200),
      phone: b.phone ? String(b.phone).slice(0, 50) : null,
      partnerType: b.partnerType === "TRAVEL_AGENCY" ? "TRAVEL_AGENCY" : "CORPORATE",
      country: b.country ? String(b.country).slice(0, 100) : null,
      note: b.note ? String(b.note).slice(0, 2000) : null,
    },
  });
  return NextResponse.json({ ok: true });
}
