"use client";

import type { Locale } from "@/lib/i18n";

export default function PrintButton({ locale }: { locale: Locale }) {
  return (
    <button className="btn btn-primary text-sm py-2 px-4" onClick={() => window.print()}>
      {locale === "ko" ? "인쇄 / PDF 저장" : "Print / Save PDF"}
    </button>
  );
}
