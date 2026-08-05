import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { seedDatabase } from "@/lib/seedData";

export const dynamic = "force-dynamic";

// One-click production bootstrap. Populates an empty database with the first
// admin account, pricing config, registered routes, demo drivers and sample
// reviews so the platform is operable right after deploy.
//
// Safety: runs only while no admin exists yet, OR when the caller supplies the
// correct ?key= matching the SETUP_KEY env var. Never destroys existing data
// (seedDatabase is idempotent / upsert-based).
async function handle(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  const configured = process.env.SETUP_KEY;

  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  const authorized = adminCount === 0 || (!!configured && key === configured);

  if (!authorized) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Setup is locked. An admin already exists. Provide ?key=<SETUP_KEY> to re-run seeding.",
      },
      { status: 403 }
    );
  }

  try {
    const result = await seedDatabase();
    return NextResponse.json({
      ok: true,
      message: "Certo Drive is ready. You can now sign in.",
      login: { email: result.admin, password: result.password, url: "/login" },
      demoDrivers: [
        "driver.seoul@certodrive.com / password123",
        "driver.paris@certodrive.com / password123",
        "driver.tokyo@certodrive.com / password123",
      ],
    });
  } catch (e) {
    console.error("[setup] seeding failed", e);
    return NextResponse.json(
      { ok: false, error: "Seeding failed", detail: String((e as Error)?.message ?? e) },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
