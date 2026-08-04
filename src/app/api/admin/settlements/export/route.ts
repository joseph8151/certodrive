import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Admin-only CSV export of driver settlements.
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settlements = await prisma.settlement.findMany({
    include: { booking: true, driverProfile: true },
    orderBy: { createdAt: "desc" },
  });

  const header = ["Reference", "Driver", "Business", "Route", "ServiceDate", "Amount", "Currency", "Status", "PaidAt", "CreatedAt"];
  const rows = settlements.map((s) => [
    s.booking.reference,
    s.driverProfile.contactName,
    s.driverProfile.businessName,
    `${s.booking.pickupLocation} -> ${s.booking.destination}`,
    s.booking.serviceDate,
    s.amount,
    s.currency,
    s.status,
    s.paidAt ? s.paidAt.toISOString() : "",
    s.createdAt.toISOString(),
  ]);

  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="certodrive-settlements.csv"`,
    },
  });
}
