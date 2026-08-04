import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { generateVoucherCode } from "@/lib/utils";

// Minimal document upload for driver KYC. Saves to public/uploads and returns
// a public path. Swap for S3/GCS in production (same response contract).
export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 413 });

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const ext = path.extname(file.name).slice(0, 10).replace(/[^a-zA-Z0-9.]/g, "");
  const name = `${Date.now()}-${generateVoucherCode()}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), bytes);

  return NextResponse.json({ url: `/uploads/${name}` });
}
