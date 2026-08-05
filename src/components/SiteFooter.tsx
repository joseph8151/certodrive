import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { makeT } from "@/lib/i18n";
import { IMG, cityImage } from "@/lib/images";
import FloatingContact from "./FloatingContact";
import Icon from "./Icon";

export default async function SiteFooter() {
  const locale = await getLocale();
  const t = makeT(locale);
  const L = locale === "ko";

  const trust = [
    { icon: "shield", title: L ? "검증된 한인 기사" : "Verified Korean drivers", desc: L ? "면허·보험·신원 확인 완료" : "Licensed, insured, vetted" },
    { icon: "tag", title: L ? "투명한 사전 요금" : "Upfront pricing", desc: L ? "예약 시 확정, 숨은 비용 없음" : "Fixed at booking, no surprises" },
    { icon: "clock", title: L ? "24시간 한국어 지원" : "24/7 Korean support", desc: L ? "언제든 연락 가능" : "Reach us anytime" },
    { icon: "globe", title: L ? "전 세계 주요 도시" : "Worldwide cities", desc: L ? "공항 픽업부터 전세까지" : "Airport transfers to full-day" },
  ];

  const cities = L
    ? ["서울", "도쿄", "파리", "런던", "뉴욕", "로마", "바르셀로나", "방콕"]
    : ["Seoul", "Tokyo", "Paris", "London", "New York", "Rome", "Barcelona", "Bangkok"];

  const cols = [
    {
      title: t("footer.company"),
      links: [
        { href: "/how-it-works", label: t("nav.help") },
        { href: "/reviews", label: L ? "고객 후기" : "Reviews" },
        { href: "/destinations", label: t("nav.cities") },
        { href: "/vip", label: t("nav.vip") },
        { href: "/support", label: t("footer.support") },
      ],
    },
    {
      title: t("footer.partners"),
      links: [
        { href: "/partners", label: t("nav.driver") },
        { href: "/corporate", label: t("footer.corporate") },
        { href: "/login", label: t("nav.login") },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { href: "/terms", label: t("footer.terms") },
        { href: "/cancellation", label: t("footer.cancel") },
        { href: "/privacy", label: t("footer.privacy") },
      ],
    },
  ];

  return (
    <footer className="mt-16 text-white" style={{ backgroundColor: "var(--color-navy)" }}>
      {/* Image CTA band */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: "var(--color-navy)",
          backgroundImage: `linear-gradient(90deg, rgba(15,24,41,0.94) 0%, rgba(15,24,41,0.72) 55%, rgba(15,24,41,0.55) 100%), url("${IMG.vipBand}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container-cd py-16 md:py-24">
          <div className="max-w-xl">
            <span className="eyebrow text-[var(--color-gold)]">CERTO DRIVE</span>
            <h3 className="font-display text-3xl md:text-4xl font-bold mt-3 leading-tight">
              {L ? "다음 여행, 공항에서부터 편안하게" : "Your next trip, effortless from the airport"}
            </h3>
            <p className="text-white/70 mt-3 leading-relaxed">
              {L
                ? "검증된 한인·한국어 기사와 함께. 지금 몇 분이면 예약이 끝납니다."
                : "Travel with a verified Korean-speaking chauffeur. Book in minutes."}
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/#book" className="btn btn-gold">{t("nav.book")}</Link>
              <Link href="/how-it-works" className="btn btn-outline text-white border-white/40 hover:bg-white hover:text-[var(--color-navy)]">
                {L ? "이용 방법" : "How it works"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="border-b border-white/10">
        <div className="container-cd py-12 grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          {trust.map((x) => (
            <div key={x.title} className="flex items-start gap-3">
              <span className="shrink-0 grid place-items-center h-10 w-10 rounded-full bg-white/5 ring-1 ring-white/10 text-[var(--color-gold)]">
                <Icon name={x.icon} size={20} />
              </span>
              <div>
                <div className="text-sm font-semibold leading-snug">{x.title}</div>
                <div className="text-xs text-white/55 mt-0.5 leading-snug">{x.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Columns */}
      <div className="container-cd py-16 md:py-20 grid gap-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="font-display text-2xl font-bold">
            Certo<span className="text-[var(--color-gold)]"> Drive</span>
          </div>
          <p className="mt-3 text-sm text-white/60 max-w-xs leading-relaxed">{t("brand.tagline")}</p>
          <div className="mt-5 space-y-2.5 text-sm text-white/75">
            <a href="mailto:support@certodrive.com" className="flex items-center gap-2.5 hover:text-white transition-colors">
              <Icon name="chat" size={16} className="text-[var(--color-gold)]" /> support@certodrive.com
            </a>
            <div className="flex items-center gap-2.5">
              <Icon name="clock" size={16} className="text-[var(--color-gold)]" /> {L ? "24시간 · 연중무휴" : "24/7 · every day"}
            </div>
            <div className="flex items-center gap-2.5">
              <Icon name="globe" size={16} className="text-[var(--color-gold)]" /> {L ? "전 세계 한인 기사 네트워크" : "Global Korean-driver network"}
            </div>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">{c.title}</h4>
            <ul className="space-y-2.5 text-sm">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/60 hover:text-[var(--color-gold)] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Popular destinations */}
      <div className="border-t border-white/10">
        <div className="container-cd py-12">
          <h4 className="text-white/50 font-semibold text-xs uppercase tracking-wider mb-6">
            {L ? "인기 도시" : "Popular cities"}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
            {cities.map((city) => (
              <Link
                key={city}
                href={`/destinations/${encodeURIComponent(city)}`}
                className="lift group relative h-28 rounded-xl overflow-hidden ring-1 ring-white/10"
                style={{
                  backgroundColor: "var(--color-navy)",
                  backgroundImage: `linear-gradient(180deg, rgba(15,24,41,0.15) 0%, rgba(15,24,41,0.82) 100%), url("${cityImage(city)}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <span className="absolute inset-x-0 bottom-0 p-3 text-sm font-semibold group-hover:text-[var(--color-gold)] transition-colors">
                  {city}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-cd py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <span>© {new Date().getFullYear()} Certo Drive. {t("footer.rights")}</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Icon name="shield" size={14} className="text-[var(--color-gold)]" />
              {L ? "안전한 카드 결제" : "Secure card payment"}
            </span>
            <span>서울 · Seoul · Worldwide</span>
          </div>
        </div>
      </div>
      <FloatingContact locale={locale} />
    </footer>
  );
}
