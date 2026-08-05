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
    <footer className="mt-24 text-white" style={{ backgroundColor: "var(--color-navy)" }}>
      {/* Main */}
      <div className="container-cd py-20 md:py-28 grid gap-16 md:grid-cols-12">
        {/* Brand + contact */}
        <div className="md:col-span-5">
          <div className="font-display text-2xl font-bold">
            Certo<span className="text-[var(--color-gold)]"> Drive</span>
          </div>
          <p className="mt-4 text-sm text-white/60 max-w-sm leading-relaxed">{t("brand.tagline")}</p>
          <div className="mt-6 space-y-3 text-sm text-white/75">
            <a href="mailto:support@certodrive.com" className="flex items-center gap-2.5 hover:text-white transition-colors">
              <Icon name="chat" size={16} className="text-[var(--color-gold)]" /> support@certodrive.com
            </a>
            <div className="flex items-center gap-2.5">
              <Icon name="clock" size={16} className="text-[var(--color-gold)]" /> {L ? "24시간 · 연중무휴 한국어 지원" : "24/7 Korean support"}
            </div>
          </div>
          <Link href="/#book" className="btn btn-gold mt-7 inline-flex">{t("nav.book")}</Link>
        </div>

        {/* Link columns */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-white/50 font-semibold text-xs uppercase tracking-wider mb-4">{c.title}</h4>
              <ul className="space-y-3 text-sm">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/70 hover:text-[var(--color-gold)] transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-cd py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/45">
          <span>© {new Date().getFullYear()} Certo Drive. {t("footer.rights")}</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Icon name="shield" size={14} className="text-[var(--color-gold)]" />
              {L ? "안전한 카드 결제" : "Secure card payment"}
            </span>
            <span>Seoul · Worldwide</span>
          </div>
        </div>
      </div>
      <FloatingContact locale={locale} />
    </footer>
  );
}
