"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export default function LocaleToggle({ locale }: { locale: Locale }) {
  const router = useRouter();

  function setLocale(next: Locale) {
    document.cookie = `cd_locale=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  }

  return (
    <div className="inline-flex items-center rounded-full border border-[var(--color-line)] text-xs font-semibold overflow-hidden">
      <button
        onClick={() => setLocale("ko")}
        className={`px-2.5 py-1 ${locale === "ko" ? "bg-[var(--color-navy)] text-white" : "text-[var(--color-slate)]"}`}
      >
        한국어
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`px-2.5 py-1 ${locale === "en" ? "bg-[var(--color-navy)] text-white" : "text-[var(--color-slate)]"}`}
      >
        EN
      </button>
    </div>
  );
}
