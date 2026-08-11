import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { makeT } from "@/lib/i18n";
import { BUSINESS } from "@/lib/business";
import FloatingContact from "./FloatingContact";

export default async function SiteFooter() {
  const locale = await getLocale();
  const t = makeT(locale);
  const L = locale === "ko";

  const cols = [
    {
      title: L ? "서비스" : "Services",
      links: [
        { href: "/booking/airport-pickup", label: t("nav.pickup") },
        { href: "/booking/intercity", label: t("nav.intercity") },
        { href: "/booking/hourly", label: t("nav.hourly") },
        { href: "/vip", label: t("nav.vip") },
      ],
    },
    {
      title: L ? "도시" : "Cities",
      links: [
        { href: "/destinations", label: t("nav.cities") },
        { href: "/how-it-works", label: t("nav.help") },
        { href: "/reviews", label: L ? "후기" : "Reviews" },
        { href: "/lookup", label: t("nav.lookup") },
      ],
    },
    {
      title: L ? "기사 · 비즈니스" : "Drivers & business",
      links: [
        { href: "/partners", label: t("nav.driver") },
        { href: "/corporate", label: t("footer.corporate") },
        { href: "/login", label: t("nav.login") },
        { href: "/support", label: t("footer.support") },
      ],
    },
    {
      title: L ? "약관" : "Legal",
      links: [
        { href: "/terms", label: t("footer.terms") },
        { href: "/cancellation", label: t("footer.cancel") },
        { href: "/privacy", label: t("footer.privacy") },
      ],
    },
  ];

  return (
    <footer className="bg-[var(--color-graphite)] text-white">
      <div className="container-cd pt-24 md:pt-36 pb-16 md:pb-20 grid gap-x-12 gap-y-14 md:grid-cols-12">
        {/* Brand */}
        <div className="md:col-span-4">
          <div className="font-display text-2xl font-extrabold tracking-tight">
            Certo<span className="text-white/50">Drive</span>
          </div>
          <p className="mt-4 text-sm text-white/55 max-w-xs leading-relaxed">
            {L ? "전 세계 주요 도시의 한국어 가능 프리미엄 이동 — 예약부터 도착까지 관리형 서비스." : "Premium Korean-speaking rides in cities worldwide — managed from booking to arrival."}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href="mailto:support@certodrive.com" className="chip bg-transparent border-white/20 text-white/80 hover:border-white/50">support@certodrive.com</a>
            <span className="chip bg-transparent border-white/20 text-white/80">{L ? "24시간 한국어 지원" : "24/7 Korean support"}</span>
          </div>
        </div>

        {/* Links */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-12">
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-white/40 font-semibold text-[11px] uppercase tracking-[0.14em] mb-5">{c.title}</h4>
              <ul className="space-y-4 text-sm">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/65 hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Legal disclosure (Korea) */}
      <div className="border-t border-white/10">
        <div className="container-cd py-8 text-[11px] leading-relaxed text-white/40">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <span className="text-white/55 font-medium">{L ? "사업자 정보" : "Business"}</span>
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

      <div className="border-t border-white/10">
        <div className="container-cd py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/45">
          <span>© {new Date().getFullYear()} Certo Drive. {t("footer.rights")}</span>
          <span>Seoul · Worldwide</span>
        </div>
      </div>
      <FloatingContact locale={locale} />
    </footer>
  );
}
