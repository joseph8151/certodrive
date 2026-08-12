import { NextResponse } from "next/server";
import { lookupFlight } from "@/lib/flights";

// GET /api/flights?flight=KE901&date=2026-08-28 → normalized flight status.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const flight = url.searchParams.get("flight");
  const date = url.searchParams.get("date") ?? undefined;
  if (!flight) return NextResponse.json({ configured: false, found: false }, { status: 400 });
  const result = await lookupFlight(flight, date);
  return NextResponse.json(result);
}
