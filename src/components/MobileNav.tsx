"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export default function MobileNav({
  locale,
  links,
}: {
  locale: Locale;
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        aria-label="Menu"
        onClick={() => setOpen(true)}
        className="p-2 -mr-2 text-[var(--color-ink)]"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-72 bg-white p-6 flex flex-col gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-lg font-bold text-[var(--color-navy)]">Certo Drive</span>
              <button onClick={() => setOpen(false)} className="p-1 text-[var(--color-slate)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-[15px] font-medium border-b border-[var(--color-line)]"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/lookup" onClick={() => setOpen(false)} className="py-2.5 text-[15px] font-medium border-b border-[var(--color-line)]">
              {locale === "ko" ? "예약 조회" : "Manage booking"}
            </Link>
            <Link href="/partners" onClick={() => setOpen(false)} className="py-2.5 text-[15px] font-medium border-b border-[var(--color-line)]">
              {locale === "ko" ? "기사 파트너" : "Drive with us"}
            </Link>
            <Link href="/login" onClick={() => setOpen(false)} className="py-2.5 text-[15px] font-medium">
              {locale === "ko" ? "로그인" : "Sign in"}
            </Link>
            <Link href="/#book" onClick={() => setOpen(false)} className="btn btn-primary mt-4">
              {locale === "ko" ? "예약하기" : "Book now"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
