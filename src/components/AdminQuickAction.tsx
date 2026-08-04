"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminQuickAction({
  body,
  label,
  variant = "primary",
  confirmText,
}: {
  body: Record<string, unknown>;
  label: string;
  variant?: "primary" | "outline" | "ghost" | "gold";
  confirmText?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function go() {
    if (confirmText && !confirm(confirmText)) return;
    setBusy(true);
    const res = await fetch("/api/admin/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) router.refresh();
    else setBusy(false);
  }

  return (
    <button className={`btn btn-${variant} text-sm py-1.5 px-3`} disabled={busy} onClick={go}>
      {busy ? "..." : label}
    </button>
  );
}
