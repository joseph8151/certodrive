import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b?.name || !b?.email || !b?.message) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  await prisma.inquiry.create({
    data: {
      name: String(b.name).slice(0, 200),
      email: String(b.email).slice(0, 200),
      category: b.category ?? "GENERAL",
      subject: (b.subject ?? "General inquiry").slice(0, 300),
      message: String(b.message).slice(0, 5000),
    },
  });
  return NextResponse.json({ ok: true });
}
