import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { makeT } from "@/lib/i18n";
import { BUSINESS } from "@/lib/business";
import { IMG } from "@/lib/images";
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
      <div className="container-cd pt-28 md:pt-40 pb-20 md:pb-28 grid gap-x-14 gap-y-14 md:grid-cols-12 items-start">
        {/* Brand + contact */}
        <div className="md:col-span-4">
          <div className="font-display text-2xl">
            Certo<span className="text-[var(--color-gold)]"> Drive</span>
          </div>
          <p className="mt-4 text-sm text-white/60 max-w-xs leading-relaxed">{t("brand.tagline")}</p>
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
        <div className="md:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-10">
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-white/45 font-semibold text-[11px] uppercase tracking-[0.2em] mb-6">{c.title}</h4>
              <ul className="space-y-4 text-sm">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/70 hover:text-[var(--color-gold)] transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Image panel */}
        <div className="md:col-span-3">
          <div
            className="relative rounded-2xl overflow-hidden aspect-[4/5] ring-1 ring-white/10"
            style={{ backgroundColor: "var(--color-navy)", backgroundImage: `linear-gradient(180deg, rgba(30,27,22,0.15) 0%, rgba(30,27,22,0.8) 100%), url(${IMG.meet})`, backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="font-display text-lg leading-snug">{L ? "품격 있는 이동의 기준" : "A higher standard of travel"}</div>
              <div className="text-xs text-white/60 mt-1">{L ? "검증된 한인 기사와 함께" : "With a verified Korean chauffeur"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Business info (legal disclosure) — compact */}
      <div className="border-t border-white/10">
        <div className="container-cd py-6 text-[11px] leading-relaxed text-white/40">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span className="text-white/50 font-medium">{L ? "사업자 정보" : "Business"}</span>
            <span>{L ? BUSINESS.nameKo : BUSINESS.nameEn}</span>
            <span>{L ? "대표" : "Rep."} {BUSINESS.representative}</span>
            <span>{L ? "사업자등록번호" : "Reg."} {BUSINESS.registrationNo}</span>
            {BUSINESS.mailOrderNo && <span>{L ? "통신판매" : "Mail-order"} {BUSINESS.mailOrderNo}</span>}
            <span>{L ? BUSINESS.addressKo : BUSINESS.addressEn}</span>
          </div>
          {L && (
            <p className="mt-2 text-white/30 max-w-4xl">
              체르토 드라이브는 통신판매중개자로서 예약을 중개하며, 실제 운송은 각 운송면허를 보유한 기사·사업자가 제공합니다. 개별 운송 서비스의 책임은 해당 사업자에게 있습니다.
            </p>
          )}
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
