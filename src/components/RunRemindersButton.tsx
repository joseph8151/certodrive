"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export default function RunRemindersButton({ locale }: { locale: Locale }) {
  const router = useRouter();
  const L = locale === "ko";
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setBusy(true); setMsg(null);
    const res = await fetch("/api/cron/reminders", { method: "POST" });
    const d = await res.json().catch(() => ({}));
    if (res.ok) setMsg(L ? `${d.sent}건 발송 (대상 ${d.candidates}건, ${d.date})` : `${d.sent} sent (${d.candidates} candidates, ${d.date})`);
    else setMsg(d.error ?? "Error");
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button className="btn btn-outline text-sm" disabled={busy} onClick={run}>
        {busy ? "..." : L ? "내일 이용 리마인더 발송" : "Send day-before reminders"}
      </button>
      {msg && <span className="text-sm text-[var(--color-slate)]">{msg}</span>}
    </div>
  );
}
