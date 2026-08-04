import { STATUS_LABELS } from "@/lib/constants";
import type { Locale } from "@/lib/i18n";

export default function StatusPill({ status, locale = "ko" }: { status: string; locale?: Locale }) {
  const meta = STATUS_LABELS[status] ?? { ko: status, en: status, tone: "slate" };
  return <span className={`pill pill-${meta.tone}`}>{locale === "ko" ? meta.ko : meta.en}</span>;
}
