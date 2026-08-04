import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import LogoutButton from "@/components/LogoutButton";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "DRIVER") redirect("/");
  const locale = await getLocale();
  const L = locale === "ko";

  return (
    <div className="min-h-screen bg-[var(--color-mist)]">
      <header className="bg-white border-b border-[var(--color-line)]">
        <div className="container-cd h-16 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/driver" className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-[var(--color-navy)]">Certo<span className="text-[var(--color-gold)]"> Drive</span></span>
              <span className="pill pill-slate">{L ? "기사 파트너" : "Partner"}</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link href="/driver" className="px-3 py-1.5 rounded-md text-[var(--color-slate)] hover:bg-[var(--color-mist)]">{L ? "대시보드" : "Dashboard"}</Link>
              <Link href="/driver/profile" className="px-3 py-1.5 rounded-md text-[var(--color-slate)] hover:bg-[var(--color-mist)]">{L ? "프로필·차량" : "Profile"}</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-[var(--color-slate)] hidden sm:inline">{session.name}</span>
            <LogoutButton locale={locale} />
          </div>
        </div>
      </header>
      <main className="container-cd py-8">{children}</main>
    </div>
  );
}
