import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getLocale } from "@/lib/locale";
import PromoBannerClient from "./PromoBannerClient";

// Surfaces the best currently-usable promotion as a dismissible top bar.
export default async function PromoBanner() {
  const locale = await getLocale();
  const now = new Date();

  const promos = await prisma.promotion.findMany({
    where: { active: true, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    orderBy: { value: "desc" },
    take: 5,
  });
  const promo = promos.find((p) => p.maxUses == null || p.usedCount < p.maxUses);
  if (!promo) return null;

  // Respect a prior dismissal (server-side, so no flash).
  const dismissed = (await cookies()).get("cd_promo_dismissed")?.value;
  if (dismissed === promo.code) return null;

  const discount = promo.discountType === "PERCENT" ? `${promo.value}%` : `${promo.value}`;
  const label =
    locale === "ko"
      ? `${promo.description ?? "특별 할인"} — ${discount} 할인`
      : `${promo.description ?? "Special offer"} — ${discount} off`;

  return <PromoBannerClient code={promo.code} label={label} locale={locale} />;
}
