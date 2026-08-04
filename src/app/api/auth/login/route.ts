import { NextResponse } from "next/server";
import { authenticate, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email: string | undefined = body?.email;
  const password: string | undefined = body?.password;
  if (!email || !password) return NextResponse.json({ error: "Missing credentials" }, { status: 400 });

  const user = await authenticate(email, password);
  if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  await createSession({
    userId: user.id,
    role: user.role as "CUSTOMER" | "DRIVER" | "ADMIN",
    name: user.name,
    email: user.email,
  });

  const redirect = user.role === "ADMIN" ? "/admin" : user.role === "DRIVER" ? "/driver" : "/account";
  return NextResponse.json({ ok: true, role: user.role, redirect });
}
