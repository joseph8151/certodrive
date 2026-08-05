"use client";

import { useState, useEffect } from "react";
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
  const L = locale === "ko";

  // Lock body scroll while the menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const secondary = [
    { href: "/lookup", label: L ? "예약 조회" : "Manage booking" },
    { href: "/partners", label: L ? "기사 파트너" : "Drive with us" },
    { href: "/login", label: L ? "로그인" : "Sign in" },
  ];

  return (
    <div className="lg:hidden">
      <button aria-label="Menu" onClick={() => setOpen(true)} className="p-2 -mr-2 text-[var(--color-ink)]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-[rgba(11,17,28,0.5)]" onClick={() => setOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-[var(--color-line)]">
              <span className="font-display text-lg font-bold text-[var(--color-navy)]">
                Certo<span className="text-[var(--color-gold)]"> Drive</span>
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-2 -mr-2 text-[var(--color-slate)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Scrollable links */}
            <nav className="flex-1 overflow-y-auto px-6 py-6">
              <div className="text-[11px] uppercase tracking-wider text-[var(--color-slate)] mb-3">{L ? "서비스" : "Services"}</div>
              <div className="grid">
                {links.map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                    className="py-3.5 text-[17px] font-medium text-[var(--color-ink)] border-b border-[var(--color-line)] hover:text-[var(--color-gold-dark)]">
                    {l.label}
                  </Link>
                ))}
              </div>

              <div className="text-[11px] uppercase tracking-wider text-[var(--color-slate)] mt-7 mb-3">{L ? "계정" : "Account"}</div>
              <div className="grid">
                {secondary.map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                    className="py-3 text-[15px] text-[var(--color-slate)] border-b border-[var(--color-line)] hover:text-[var(--color-ink)]">
                    {l.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Sticky CTA */}
            <div className="px-6 py-5 border-t border-[var(--color-line)]">
              <Link href="/#book" onClick={() => setOpen(false)} className="btn btn-gold w-full text-base">
                {L ? "예약하기" : "Book now"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
