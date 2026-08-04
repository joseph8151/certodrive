"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export default function PromoBannerClient({
  code,
  label,
  locale,
}: {
  code: string;
  label: string;
  locale: Locale;
}) {
  const [hidden, setHidden] = useState(false);
  const L = locale === "ko";
  if (hidden) return null;

  function dismiss() {
    document.cookie = `cd_promo_dismissed=${code}; path=/; max-age=${60 * 60 * 24 * 30}`;
    setHidden(true);
  }

  return (
    <div className="bg-[var(--color-red)] text-white text-sm">
      <div className="container-cd flex items-center justify-center gap-3 py-2 relative">
        <span className="text-center">
          <span className="font-semibold">{label}</span>{" "}
          <span className="opacity-90">{L ? "코드" : "Code"} </span>
          <span className="font-mono font-bold tracking-wide">{code}</span>
          <Link href={`/?promo=${code}#book`} className="underline underline-offset-2 ml-2 font-semibold whitespace-nowrap">
            {L ? "지금 예약 →" : "Book now →"}
          </Link>
        </span>
        <button
          aria-label="Dismiss"
          onClick={dismiss}
          className="absolute right-3 opacity-80 hover:opacity-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" /></svg>
        </button>
      </div>
    </div>
  );
}
