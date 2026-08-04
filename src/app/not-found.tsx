import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getLocale } from "@/lib/locale";

export default async function NotFound() {
  const locale = await getLocale();
  const L = locale === "ko";
  return (
    <>
      <SiteHeader />
      <main className="container-cd py-24 text-center">
        <div className="font-display text-6xl font-bold text-[var(--color-gold)]">404</div>
        <h1 className="font-display text-2xl font-bold mt-4">{L ? "페이지를 찾을 수 없습니다" : "Page not found"}</h1>
        <p className="text-[var(--color-slate)] mt-2">{L ? "요청하신 페이지가 존재하지 않거나 이동되었습니다." : "The page you're looking for doesn't exist or has moved."}</p>
        <Link href="/" className="btn btn-primary mt-6 inline-flex">{L ? "홈으로" : "Back home"}</Link>
      </main>
      <SiteFooter />
    </>
  );
}
