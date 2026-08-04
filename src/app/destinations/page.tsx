import Link from "next/link";
import PageShell from "@/components/PageShell";
import { getLocale } from "@/lib/locale";
import { POPULAR_CITIES } from "@/lib/constants";

export default async function Destinations() {
  const locale = await getLocale();
  const L = locale === "ko";
  const cities = POPULAR_CITIES[locale];
  const byCountry = cities.reduce<Record<string, typeof cities>>((acc, c) => {
    (acc[c.country] ??= []).push(c);
    return acc;
  }, {});

  return (
    <PageShell
      title={L ? "국가별·도시별 서비스" : "Destinations"}
      subtitle={L ? "전 세계 주요 도시에서 검증된 한인·한국어 기사를 만나보세요." : "Meet verified Korean-speaking chauffeurs in major cities worldwide."}
    >
      <div className="grid gap-10 max-w-4xl mx-auto">
        {Object.entries(byCountry).map(([country, list]) => (
          <div key={country}>
            <h2 className="font-display text-xl font-bold mb-4">{country}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((c) => (
                <Link key={c.city} href={`/destinations/${encodeURIComponent(c.city)}`} className="card p-5 hover:card-shadow transition-shadow">
                  <div className="font-display text-lg font-bold">{c.city}</div>
                  <div className="text-xs text-[var(--color-slate)] mt-1">{c.airports.join(" · ")}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
