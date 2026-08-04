import { formatMoney } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

type Item = { key: string; labelKo: string; labelEn: string; amount: number };

export default function PriceBreakdown({
  items,
  total,
  currency,
  locale,
}: {
  items: Item[];
  total: number;
  currency: string;
  locale: Locale;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] overflow-hidden">
      <div className="px-4 py-3 bg-[var(--color-mist)] text-sm font-semibold">
        {locale === "ko" ? "요금 상세" : "Price breakdown"}
      </div>
      <div className="divide-y divide-[var(--color-line)]">
        {items.map((it) => (
          <div key={it.key} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className={it.amount < 0 ? "text-[#16794a]" : "text-[var(--color-slate)]"}>
              {locale === "ko" ? it.labelKo : it.labelEn}
            </span>
            <span className={it.amount < 0 ? "text-[#16794a] font-medium" : "font-medium"}>
              {formatMoney(it.amount, currency)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-4 py-3.5 bg-[var(--color-ink)] text-white">
        <span className="font-semibold">{locale === "ko" ? "총 결제 금액" : "Total"}</span>
        <span className="font-display text-xl font-bold">{formatMoney(total, currency)}</span>
      </div>
    </div>
  );
}
