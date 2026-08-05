import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { makeT } from "@/lib/i18n";
import FloatingContact from "./FloatingContact";
import Icon from "./Icon";

export default async function SiteFooter() {
  const locale = await getLocale();
  const t = makeT(locale);
  const L = locale === "ko";

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
    <footer className="mt-12 text-white" style={{ backgroundColor: "var(--color-navy)" }}>
      {/* CTA strip */}
      <div className="border-b border-white/10">
        <div className="container-cd py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl md:text-3xl font-bold">{L ? "다음 여행, 공항에서부터 편안하게" : "Your next trip, effortless from the airport"}</h3>
            <p className="text-white/65 mt-2 text-sm">{L ? "검증된 한인·한국어 기사와 함께하세요." : "Travel with a verified Korean-speaking chauffeur."}</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/#book" className="btn btn-gold">{t("nav.book")}</Link>
            <Link href="/reviews" className="btn btn-outline text-white border-white/40 hover:bg-white hover:text-[var(--color-navy)]">{L ? "후기 보기" : "Reviews"}</Link>
          </div>
        </div>
      </div>

      {/* Columns */}
      <div className="container-cd py-14 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="font-display text-2xl font-bold">Certo<span className="text-[var(--color-gold)]"> Drive</span></div>
          <p className="mt-3 text-sm text-white/60 max-w-xs leading-relaxed">{t("brand.tagline")}</p>
          <div className="mt-5 space-y-2 text-sm text-white/70">
            <div className="flex items-center gap-2"><Icon name="chat" size={16} className="text-[var(--color-gold)]" /> support@certodrive.com</div>
            <div className="flex items-center gap-2"><Icon name="globe" size={16} className="text-[var(--color-gold)]" /> {L ? "24시간 한국어 지원 · 전 세계" : "24/7 Korean support · Worldwide"}</div>
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

      <div className="border-t border-white/10">
        <div className="container-cd py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <span>© {new Date().getFullYear()} Certo Drive. {t("footer.rights")}</span>
          <span>서울 · Seoul · Global chauffeur network</span>
        </div>
      </div>
      <FloatingContact locale={locale} />
    </footer>
  );
}
