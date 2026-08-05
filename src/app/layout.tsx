import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { getLocale } from "@/lib/locale";
import "./globals.css";

// Premium type pairing: an editorial serif for display, a clean sans for body.
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Certo Drive — 해외 한인 기사·공항 픽업·한인 택시·하루 종일 전세",
    template: "%s · Certo Drive",
  },
  description:
    "해외여행·출장 중 한국어가 통하는 검증된 한인 기사를 예약하세요. 공항 픽업·샌딩, 한인 택시, 도시 간 이동, 하루 종일 기사·차량 전세, VIP 의전. 정찰제 요금과 24시간 한국어 지원.",
  keywords: ["해외 한인 기사", "한인 택시", "공항 픽업", "하루 종일 전세 차량", "airport transfer", "Korean chauffeur abroad", "Korean taxi", "Certo Drive"],
  openGraph: {
    title: "Certo Drive",
    description: "Premium chauffeur booking with verified Korean-speaking drivers worldwide.",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${playfair.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
