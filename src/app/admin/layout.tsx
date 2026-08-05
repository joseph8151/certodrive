import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/");
  const locale = await getLocale();
  const L = locale === "ko";

  const nav = [
    { href: "/admin", label: L ? "대시보드" : "Dashboard" },
    { href: "/admin/bookings", label: L ? "예약" : "Bookings" },
    { href: "/admin/analytics", label: L ? "매출 분석" : "Analytics" },
    { href: "/admin/pricing", label: L ? "가격 관리" : "Pricing" },
    { href: "/admin/promotions", label: L ? "프로모션" : "Promotions" },
    { href: "/admin/rates", label: L ? "환율" : "Rates" },
    { href: "/admin/drivers", label: L ? "기사" : "Drivers" },
    { href: "/admin/settlements", label: L ? "정산" : "Settlements" },
    { href: "/admin/cms", label: L ? "CMS" : "CMS" },
    { href: "/admin/inbox", label: L ? "문의함" : "Inbox" },
    { href: "/admin/guide", label: L ? "운영 가이드" : "Guide" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-mist)]">
      <header className="bg-[var(--color-ink)] text-white">
        <div className="container-cd h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-display text-lg font-bold">Certo<span className="text-[var(--color-gold)]"> Drive</span> <span className="text-white/40 text-sm font-sans">Admin</span></Link>
            <nav className="hidden md:flex items-center gap-1 text-sm">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="px-3 py-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10">{n.label}</Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-white/60 hidden sm:inline">{session.name}</span>
            <LogoutButton locale={locale} />
          </div>
        </div>
        <nav className="md:hidden border-t border-white/10 overflow-x-auto">
          <div className="container-cd flex gap-1 py-2 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="px-3 py-1.5 rounded-md text-white/70 whitespace-nowrap hover:bg-white/10">{n.label}</Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="container-cd py-8 overflow-x-hidden">{children}</main>
    </div>
  );
}
