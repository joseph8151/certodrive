"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

// Floating KakaoTalk / WhatsApp consult button for customer-facing pages.
// Handles are placeholders — swap for the real channel links in production.
const KAKAO_URL = "https://pf.kakao.com/_certodrive";
const WHATSAPP_URL = "https://wa.me/821000000000";

export default function FloatingContact({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const L = locale === "ko";

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 print:hidden">
      {open && (
        <div className="flex flex-col gap-2 mb-1">
          <a
            href={KAKAO_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#FEE500] text-[#3c1e1e] font-semibold text-sm pl-3 pr-4 py-2.5 shadow-lg hover:brightness-95"
          >
            <span className="text-base">💬</span> {L ? "카카오톡 상담" : "KakaoTalk"}
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#25D366] text-white font-semibold text-sm pl-3 pr-4 py-2.5 shadow-lg hover:brightness-95"
          >
            <span className="text-base">📱</span> WhatsApp
          </a>
          <a
            href="mailto:support@certodrive.com"
            className="flex items-center gap-2 rounded-full bg-white text-[var(--color-ink)] border border-[var(--color-line)] font-semibold text-sm pl-3 pr-4 py-2.5 shadow-lg hover:bg-[var(--color-mist)]"
          >
            <span className="text-base">✉️</span> {L ? "이메일 문의" : "Email"}
          </a>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={L ? "상담 열기" : "Open chat"}
        className="h-14 w-14 rounded-full bg-[var(--color-red)] text-white shadow-xl flex items-center justify-center hover:bg-[var(--color-red-dark)] transition-colors"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" /></svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
      </button>
    </div>
  );
}
