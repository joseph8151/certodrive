// Flight status lookup — env-gated.
//
// Set FLIGHT_API_KEY to enable live tracking. Default provider is AviationStack
// (https://aviationstack.com); override the base URL with FLIGHT_API_BASE if you
// use a compatible endpoint. Without a key, lookups return { configured: false }
// so the UI degrades gracefully instead of erroring.

export type FlightLeg = {
  airport: string | null;
  iata: string | null;
  scheduled: string | null;
  estimated: string | null;
  terminal: string | null;
  gate: string | null;
};

export type FlightResult =
  | { configured: false }
  | { configured: true; found: false }
  | {
      configured: true;
      found: true;
      status: string | null;
      airline: string | null;
      flightIata: string;
      departure: FlightLeg;
      arrival: FlightLeg;
    };

const BASE = process.env.FLIGHT_API_BASE ?? "https://api.aviationstack.com/v1";

export async function lookupFlight(flightIata: string, date?: string): Promise<FlightResult> {
  const key = process.env.FLIGHT_API_KEY;
  if (!key) return { configured: false };

  const iata = flightIata.trim().toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z0-9]{3,8}$/.test(iata)) return { configured: true, found: false };

  const url = new URL(`${BASE}/flights`);
  url.searchParams.set("access_key", key);
  url.searchParams.set("flight_iata", iata);
  if (date) url.searchParams.set("flight_date", date);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) return { configured: true, found: false };
    const json = await res.json();
    const f = Array.isArray(json?.data) ? json.data[0] : null;
    if (!f) return { configured: true, found: false };
    const leg = (x: Record<string, unknown> | null | undefined): FlightLeg => ({
      airport: (x?.airport as string) ?? null,
      iata: (x?.iata as string) ?? null,
      scheduled: (x?.scheduled as string) ?? null,
      estimated: (x?.estimated as string) ?? null,
      terminal: (x?.terminal as string) ?? null,
      gate: (x?.gate as string) ?? null,
    });
    return {
      configured: true,
      found: true,
      status: f.flight_status ?? null,
      airline: f.airline?.name ?? null,
      flightIata: f.flight?.iata ?? iata,
      departure: leg(f.departure),
      arrival: leg(f.arrival),
    };
  } catch {
    return { configured: true, found: false };
  }
}
