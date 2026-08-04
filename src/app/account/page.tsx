import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StatusPill from "@/components/StatusPill";
import LogoutButton from "@/components/LogoutButton";
import { getSession } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import FavoriteRouteCard, { bookHref } from "@/components/FavoriteRouteCard";
import SaveRouteButton from "@/components/SaveRouteButton";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "CUSTOMER") redirect(session.role === "ADMIN" ? "/admin" : "/driver");
  const locale = await getLocale();
  const L = locale === "ko";

  // Bookings owned by this account or made as a guest with the same email.
  const [bookings, favorites] = await Promise.all([
    prisma.booking.findMany({
      where: { OR: [{ customerUserId: session.userId }, { customerEmail: session.email.toLowerCase() }] },
      orderBy: { createdAt: "desc" },
      include: { assignedDriver: true },
    }),
    prisma.favoriteRoute.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" } }),
  ]);

  const upcoming = bookings.filter((b) => !["COMPLETED", "CANCELLED", "REFUNDED", "NO_SHOW"].includes(b.status));
  const past = bookings.filter((b) => ["COMPLETED", "CANCELLED", "REFUNDED", "NO_SHOW"].includes(b.status));

  const Card = ({ b }: { b: (typeof bookings)[number] }) => (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <Link href={`/booking/confirm/${b.reference}`} className="font-display text-lg font-bold hover:text-[var(--color-gold-dark)]">{b.reference}</Link>
        <StatusPill status={b.status} locale={locale} />
      </div>
      <div className="text-sm text-[var(--color-slate)] mt-2">{b.pickupLocation} → {b.destination}</div>
      <div className="text-sm text-[var(--color-slate)]">{b.serviceDate} {b.serviceTime} · {b.vehicleCategory}</div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-[var(--color-slate)]">{b.assignedDriver ? `${L ? "기사" : "Driver"}: ${b.assignedDriver.contactName}` : ""}</span>
        <span className="font-semibold">{formatMoney(b.customerPrice, b.currency)}</span>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-line)]">
        <Link href={bookHref(b)} className="btn btn-outline text-xs py-1 px-2">{L ? "재예약" : "Rebook"}</Link>
        <SaveRouteButton reference={b.reference} locale={locale} />
      </div>
    </div>
  );

  return (
    <>
      <SiteHeader />
      <main className="container-cd py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">{L ? `안녕하세요, ${session.name}님` : `Hi, ${session.name}`}</h1>
            <p className="text-[var(--color-slate)] text-sm mt-1">{L ? "내 예약을 확인하고 관리하세요." : "View and manage your bookings."}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/#book" className="btn btn-primary text-sm">{L ? "새 예약" : "New booking"}</Link>
            <LogoutButton locale={locale} />
          </div>
        </div>

        {favorites.length > 0 && (
          <section className="mb-8">
            <h2 className="font-semibold text-lg mb-3">{L ? "즐겨찾기 노선" : "Favorite routes"}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((fav) => <FavoriteRouteCard key={fav.id} fav={fav} locale={locale} />)}
            </div>
          </section>
        )}

        {bookings.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-[var(--color-slate)]">{L ? "아직 예약이 없습니다." : "No bookings yet."}</p>
            <Link href="/#book" className="btn btn-primary mt-4 inline-flex">{L ? "지금 예약하기" : "Book now"}</Link>
          </div>
        ) : (
          <div className="grid gap-8">
            <section>
              <h2 className="font-semibold text-lg mb-3">{L ? "예정된 예약" : "Upcoming"} ({upcoming.length})</h2>
              {upcoming.length === 0 ? <p className="text-sm text-[var(--color-slate)]">{L ? "예정된 예약이 없습니다." : "Nothing upcoming."}</p> : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{upcoming.map((b) => <Card key={b.id} b={b} />)}</div>
              )}
            </section>
            {past.length > 0 && (
              <section>
                <h2 className="font-semibold text-lg mb-3">{L ? "지난 예약" : "Past"} ({past.length})</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{past.map((b) => <Card key={b.id} b={b} />)}</div>
              </section>
            )}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
