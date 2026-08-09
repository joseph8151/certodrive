import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { makeT } from "@/lib/i18n";
import { getSession } from "@/lib/auth";
import LocaleToggle from "./LocaleToggle";
import MobileNav from "./MobileNav";

export default async function SiteHeader() {
  const locale = await getLocale();
  const t = makeT(locale);
  const session = await getSession();
  const accountHref = session?.role === "ADMIN" ? "/admin" : session?.role === "DRIVER" ? "/driver" : "/account";

  // Full list powers the mobile menu; the desktop bar shows a trimmed primary
  // set so longer English labels don't crowd the header.
  const links = [
    { href: "/booking/airport-pickup", label: t("nav.pickup") },
    { href: "/booking/airport-dropoff", label: t("nav.dropoff") },
    { href: "/booking/intercity", label: t("nav.intercity") },
    { href: "/booking/hourly", label: t("nav.hourly") },
    { href: "/vip", label: t("nav.vip") },
    { href: "/destinations", label: t("nav.cities") },
    { href: "/how-it-works", label: t("nav.help") },
    { href: "/reviews", label: locale === "ko" ? "후기" : "Reviews" },
  ];
  const primaryHrefs = ["/booking/airport-pickup", "/booking/hourly", "/vip", "/destinations", "/how-it-works", "/reviews"];
  const primaryLinks = primaryHrefs.map((h) => links.find((l) => l.href === h)!);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[var(--color-line)]">
      <div className="container-cd flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-bold tracking-tight text-[var(--color-navy)]">
            Certo<span className="text-[var(--color-gold)]"> Drive</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium text-[var(--color-ink)]">
          {primaryLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-[var(--color-gold-dark)] transition-colors whitespace-nowrap">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleToggle locale={locale} />
          <Link href="/lookup" className="hidden md:inline text-sm font-medium hover:text-[var(--color-gold-dark)]">
            {t("nav.lookup")}
          </Link>
          {session ? (
            <Link href={accountHref} className="hidden md:inline text-sm font-medium hover:text-[var(--color-gold-dark)]">
              {session.role === "CUSTOMER" ? (locale === "ko" ? "내 예약" : "My bookings") : (locale === "ko" ? "대시보드" : "Dashboard")}
            </Link>
          ) : (
            <Link href="/login" className="hidden md:inline text-sm font-medium hover:text-[var(--color-gold-dark)]">
              {t("nav.login")}
            </Link>
          )}
          <Link href="/#book" className="hidden sm:inline btn btn-primary text-sm py-2 px-4">
            {t("nav.book")}
          </Link>
          <MobileNav locale={locale} links={links} />
        </div>
      </div>
      </header>
    </>
  );
}
