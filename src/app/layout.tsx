import type { Metadata } from "next";
import { getLocale } from "@/lib/locale";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Certo Drive — 검증된 한인·한국어 기사 프리미엄 차량 예약",
    template: "%s · Certo Drive",
  },
  description:
    "전 세계 주요 도시에서 검증된 한인 및 한국어 가능 기사를 예약하세요. 공항 픽업, 샌딩, 도시 간 이동, 시간제 차량, VIP 의전. 정찰제 요금과 24시간 한국어 지원.",
  keywords: ["한인 기사", "공항 픽업", "airport transfer", "Korean chauffeur", "private car", "Certo Drive"],
  openGraph: {
    title: "Certo Drive",
    description: "Premium chauffeur booking with verified Korean-speaking drivers worldwide.",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
