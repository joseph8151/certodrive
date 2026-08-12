import type { MetadataRoute } from "next";
import { POPULAR_CITIES } from "@/lib/constants";
import { AIRPORT_CODES } from "@/lib/airports";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://certodrive.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/booking/airport-pickup",
    "/booking/airport-dropoff",
    "/booking/intercity",
    "/booking/hourly",
    "/vip",
    "/destinations",
    "/verified",
    "/how-it-works",
    "/lookup",
    "/partners",
    "/corporate",
    "/support",
    "/terms",
    "/cancellation",
    "/privacy",
  ];
  const cityPaths = [...new Set(POPULAR_CITIES.en.concat(POPULAR_CITIES.ko).map((c) => c.city))].map(
    (c) => `/destinations/${encodeURIComponent(c)}`,
  );
  const airportPaths = AIRPORT_CODES.map((code) => `/airport/${code.toLowerCase()}`);

  return [...staticPaths, ...cityPaths, ...airportPaths].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
