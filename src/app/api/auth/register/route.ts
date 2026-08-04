import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional().nullable(),
  locale: z.enum(["ko", "en"]).default("ko"),
});

// Customer self-registration. Existing guest bookings made with the same email
// are linked to the new account so they appear in "My bookings".
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  const d = parsed.data;
  const email = d.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const user = await prisma.user.create({
    data: { email, passwordHash: await hashPassword(d.password), role: "CUSTOMER", name: d.name, phone: d.phone ?? null, locale: d.locale },
  });

  // Adopt prior guest bookings with this email.
  await prisma.booking.updateMany({ where: { customerEmail: email, customerUserId: null }, data: { customerUserId: user.id } });

  await createSession({ userId: user.id, role: "CUSTOMER", name: user.name, email: user.email });
  return NextResponse.json({ ok: true, redirect: "/account" });
}
