import type { Metadata } from "next";
import { getLocale } from "@/lib/locale";
import "./globals.css";

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
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* Editorial serif for headings: Cormorant (Latin) + Nanum Myeongjo (Korean). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Nanum+Myeongjo:wght@700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
