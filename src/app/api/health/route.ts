import { NextResponse } from "next/server";

// Liveness check for Railway / load balancers. Returns 200 as soon as the
// server is up — deliberately does NOT depend on the database so a transient
// DB hiccup can't fail the deploy's health check.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok" });
}
