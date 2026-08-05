"use client";

type Pt = { lat: number; lon: number } | null;

// Real map preview for the booking flow.
// - If NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set → Google Maps Embed API
//   (directions when both ends are known, otherwise a place map).
// - Otherwise → free OpenStreetMap embed (no key), so a real map still shows.
// Renders nothing until there's something to show.
export default function MapPreview({
  pickup,
  destination,
  pickupLabel,
  destLabel,
  locale,
}: {
  pickup: Pt;
  destination: Pt;
  pickupLabel?: string;
  destLabel?: string;
  locale: string;
}) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const L = locale === "ko";
  const enc = encodeURIComponent;

  let src = "";
  let google = false;

  if (key && pickupLabel && pickupLabel.trim().length > 1) {
    google = true;
    src =
      destLabel && destLabel.trim().length > 1
        ? `https://www.google.com/maps/embed/v1/directions?key=${key}&origin=${enc(pickupLabel)}&destination=${enc(destLabel)}&mode=driving`
        : `https://www.google.com/maps/embed/v1/place?key=${key}&q=${enc(pickupLabel)}`;
  } else if (pickup) {
    const pts = [pickup, destination].filter(Boolean) as { lat: number; lon: number }[];
    const lats = pts.map((p) => p.lat);
    const lons = pts.map((p) => p.lon);
    const pad = pts.length > 1 ? 0.03 : 0.012;
    const bbox = [Math.min(...lons) - pad, Math.min(...lats) - pad, Math.max(...lons) + pad, Math.max(...lats) + pad].join(",");
    const marker = pts.length === 1 ? `&marker=${pickup.lat},${pickup.lon}` : "";
    src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${marker}`;
  }

  if (!src) return null;

  return (
    <div className="mt-1 rounded-xl overflow-hidden border border-[var(--color-line)]">
      <div className="h-44 sm:h-52 bg-[var(--color-mist)]">
        <iframe
          title="map preview"
          src={src}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="px-3 py-1.5 text-[11px] text-[var(--color-slate)] flex items-center justify-between">
        <span>{destLabel ? (L ? "픽업 → 목적지 경로" : "Pickup → destination") : (L ? "픽업 위치" : "Pickup location")}</span>
        <span className="text-[var(--color-slate)]/70">{google ? "Google Maps" : "OpenStreetMap"}</span>
      </div>
    </div>
  );
}
