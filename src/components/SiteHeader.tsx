import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { makeT } from "@/lib/i18n";
import { getSession } from "@/lib/auth";
import LocaleToggle from "./LocaleToggle";
import MobileNav from "./MobileNav";

export default async function SiteHeader() {
  const locale = await getLocale();
  const t = makeT(locale);
  const L = locale === "ko";
  const session = await getSession();
  const accountHref = session?.role === "ADMIN" ? "/admin" : session?.role === "DRIVER" ? "/driver" : "/account";

  // Trimmed primary nav — mobility-platform style.
  const primaryLinks = [
    { href: "/booking/airport-pickup", label: L ? "이용 방법" : "Rides" },
    { href: "/destinations", label: L ? "도시" : "Cities" },
    { href: "/vip", label: L ? "비즈니스" : "Business" },
    { href: "/partners", label: L ? "기사 지원" : "Drivers" },
    { href: "/support", label: L ? "고객지원" : "Support" },
  ];
  // Full list drives the mobile drawer.
  const links = [
    { href: "/booking/airport-pickup", label: t("nav.pickup") },
    { href: "/booking/airport-dropoff", label: t("nav.dropoff") },
    { href: "/booking/intercity", label: t("nav.intercity") },
    { href: "/booking/hourly", label: t("nav.hourly") },
    { href: "/vip", label: t("nav.vip") },
    { href: "/destinations", label: t("nav.cities") },
    { href: "/how-it-works", label: t("nav.help") },
    { href: "/reviews", label: L ? "후기" : "Reviews" },
    { href: "/partners", label: t("nav.driver") },
    { href: "/support", label: t("footer.support") },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-bg)]/85 backdrop-blur-md border-b border-[var(--color-line)]">
      <div className="container-cd flex items-center justify-between h-16">
        <div className="flex items-center gap-9">
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Certo Drive">
            <span className="font-display text-[1.35rem] font-extrabold tracking-tight text-[var(--color-ink)]">
              Certo<span className="text-[var(--color-slate)]">Drive</span>
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-7 text-[0.92rem] font-medium text-[var(--color-ink)]">
            {primaryLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-[var(--color-slate)] hover:text-[var(--color-ink)] transition-colors whitespace-nowrap">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <LocaleToggle locale={locale} />
          {session ? (
            <Link href={accountHref} className="hidden md:inline text-sm font-medium text-[var(--color-slate)] hover:text-[var(--color-ink)] px-2">
              {session.role === "CUSTOMER" ? (L ? "내 예약" : "Bookings") : (L ? "대시보드" : "Dashboard")}
            </Link>
          ) : (
            <Link href="/login" className="hidden md:inline text-sm font-medium text-[var(--color-slate)] hover:text-[var(--color-ink)] px-2">
              {t("nav.login")}
            </Link>
          )}
          <Link href="/#book" className="hidden sm:inline-flex btn btn-primary text-sm py-2 px-4">
            {t("nav.book")}
          </Link>
          <MobileNav locale={locale} links={links} />
        </div>
      </div>
    </header>
  );
}
