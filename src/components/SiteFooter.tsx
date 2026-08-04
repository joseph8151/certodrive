import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { makeT } from "@/lib/i18n";

export default async function SiteFooter() {
  const locale = await getLocale();
  const t = makeT(locale);

  const cols = [
    {
      title: t("footer.company"),
      links: [
        { href: "/how-it-works", label: t("nav.help") },
        { href: "/destinations", label: t("nav.cities") },
        { href: "/vip", label: t("nav.vip") },
        { href: "/support", label: t("footer.support") },
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
    {
      title: t("footer.partners"),
      links: [
        { href: "/partners", label: t("nav.driver") },
        { href: "/corporate", label: t("footer.corporate") },
        { href: "/login", label: t("nav.login") },
      ],
    },
  ];

  return (
    <footer className="bg-[var(--color-ink)] text-white/80 mt-8">
      <div className="container-cd py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="font-display text-xl font-bold text-white">
            Certo<span className="text-[var(--color-gold)]"> Drive</span>
          </div>
          <p className="mt-3 text-sm text-white/60 max-w-xs">{t("brand.tagline")}</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-white font-semibold text-sm mb-3">{c.title}</h4>
            <ul className="space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/60 hover:text-white transition-colors">
                    {l.label}
                  </Link>
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
    </footer>
  );
}
