import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Address autocomplete proxy. Uses Photon (photon.komoot.io) — a free,
// key-less, worldwide geocoder built on OpenStreetMap — so precise pickup /
// drop-off addresses can be captured for drivers without a Google billing key.
// Proxying server-side avoids CORS and keeps the client simple. If we later
// add a Google Places key, only this route needs to change.
type Suggestion = { label: string; lat: number; lon: number };

function labelOf(p: Record<string, unknown>): string {
  const s = (k: string) => (typeof p[k] === "string" ? (p[k] as string) : "");
  const line1 = [s("name") || s("street"), s("housenumber")].filter(Boolean).join(" ");
  const parts = [line1, s("district") || s("city") || s("county"), s("state"), s("country")]
    .map((x) => x.trim())
    .filter(Boolean);
  // De-dupe consecutive repeats (e.g. name === city).
  return parts.filter((x, i) => x && x !== parts[i - 1]).join(", ");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const lang = url.searchParams.get("lang") === "ko" ? "default" : "en";
  if (q.length < 3) return NextResponse.json({ suggestions: [] });

  try {
    const api = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=${lang}`;
    const res = await fetch(api, {
      headers: { "User-Agent": "CertoDrive/1.0 (booking address autocomplete)" },
      // Cache identical queries briefly at the edge.
      next: { revalidate: 300 },
    });
    if (!res.ok) return NextResponse.json({ suggestions: [] });
    const data = (await res.json()) as { features?: { properties: Record<string, unknown>; geometry: { coordinates: [number, number] } }[] };
    const seen = new Set<string>();
    const suggestions: Suggestion[] = [];
    for (const f of data.features ?? []) {
      const label = labelOf(f.properties);
      if (!label || seen.has(label)) continue;
      seen.add(label);
      suggestions.push({ label, lon: f.geometry.coordinates[0], lat: f.geometry.coordinates[1] });
    }
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
