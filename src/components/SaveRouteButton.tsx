"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export default function SaveRouteButton({ reference, locale }: { reference: string; locale: Locale }) {
  const router = useRouter();
  const L = locale === "ko";
  const [state, setState] = useState<"idle" | "busy" | "saved">("idle");

  async function save() {
    setState("busy");
    const res = await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference }) });
    if (res.ok) { setState("saved"); router.refresh(); } else setState("idle");
  }

  return (
    <button className="btn btn-ghost text-xs py-1 px-2" disabled={state !== "idle"} onClick={(e) => { e.preventDefault(); save(); }}>
      {state === "saved" ? (L ? "★ 저장됨" : "★ Saved") : state === "busy" ? "..." : (L ? "☆ 노선 저장" : "☆ Save route")}
    </button>
  );
}
