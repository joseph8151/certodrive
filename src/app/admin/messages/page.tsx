import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminMessages() {
  const locale = await getLocale();
  const L = locale === "ko";

  const [flagged, recent] = await Promise.all([
    prisma.bookingMessage.findMany({
      where: { flagged: true },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { booking: { select: { reference: true, customerName: true } } },
    }),
    prisma.bookingMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { booking: { select: { reference: true } } },
    }),
  ]);

  const roleLabel = (s: string) => (s === "DRIVER" ? (L ? "기사" : "Driver") : s === "ADMIN" ? "Certo" : (L ? "고객" : "Customer"));

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold">{L ? "대화 모니터링" : "Chat monitoring"}</h1>
        <p className="text-sm text-[var(--color-slate)] mt-1">
          {L ? "요금 협의·외부 결제·연락처 공유가 감지된 메시지입니다. 위반 시 기사·고객에게 경고하거나 계정을 정지하세요." : "Messages flagged for off-platform / price talk."}
        </p>
      </div>

      <section>
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <span className="pill pill-red">{L ? "플래그" : "Flagged"}</span> {flagged.length}
        </h2>
        {flagged.length === 0 ? (
          <div className="card p-6 text-sm text-[var(--color-slate)]">{L ? "감지된 위반 메시지가 없습니다." : "No flagged messages."}</div>
        ) : (
          <div className="grid gap-3">
            {flagged.map((m) => (
              <div key={m.id} className="card p-4 border-l-4" style={{ borderLeftColor: "#a52626" }}>
                <div className="flex items-center justify-between text-xs text-[var(--color-slate)]">
                  <span>
                    <Link href={`/admin/bookings?ref=${m.booking.reference}`} className="text-[var(--color-navy)] font-medium underline">{m.booking.reference}</Link>
                    {" · "}{roleLabel(m.sender)} · {m.senderName}
                  </span>
                  <span>{new Date(m.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-sm">{m.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-3">{L ? "최근 대화" : "Recent messages"}</h2>
        <div className="card divide-y divide-[var(--color-line)]">
          {recent.map((m) => (
            <div key={m.id} className="px-4 py-3 flex items-start justify-between gap-4 text-sm">
              <div className="min-w-0">
                <span className="text-xs text-[var(--color-slate)]">{m.booking.reference} · {roleLabel(m.sender)}</span>
                <p className={`mt-0.5 ${m.flagged ? "text-[#a52626]" : ""} break-words`}>{m.body}</p>
              </div>
              <span className="text-xs text-[var(--color-slate)] whitespace-nowrap">{new Date(m.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
          {recent.length === 0 && <div className="px-4 py-6 text-sm text-[var(--color-slate)]">{L ? "대화 없음" : "No messages"}</div>}
        </div>
      </section>
    </div>
  );
}
