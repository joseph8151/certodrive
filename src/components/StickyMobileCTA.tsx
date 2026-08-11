"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

// Mobile-only sticky action bar (Uber-style). Appears after the hero scrolls
// past, links to the booking widget. Hidden on >= sm where the header CTA shows.
export default function StickyMobileCTA({ locale }: { locale: Locale }) {
  const L = locale === "ko";
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`sm:hidden fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ${show ? "translate-y-0" : "translate-y-full"}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-3 mb-3 rounded-2xl bg-[var(--color-ink)] text-white shadow-lg flex items-center justify-between pl-5 pr-2 py-2">
        <div className="leading-tight">
          <div className="text-[13px] font-semibold">{L ? "요금 확인하기" : "Check your price"}</div>
          <div className="text-[11px] text-white/55">{L ? "1분이면 충분합니다" : "Takes about a minute"}</div>
        </div>
        <a href="#book" className="rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-ink)] font-semibold text-sm px-4 py-2.5">
          {L ? "예약 시작" : "Start"}
        </a>
      </div>
    </div>
  );
}
