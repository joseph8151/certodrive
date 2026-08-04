import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LookupForm from "@/components/LookupForm";
import { getLocale } from "@/lib/locale";

export default async function LookupPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const locale = await getLocale();
  const { ref } = await searchParams;
  return (
    <>
      <SiteHeader />
      <main className="container-cd py-14">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold">{locale === "ko" ? "예약 조회 및 변경" : "Manage your booking"}</h1>
            <p className="text-[var(--color-slate)] mt-2 text-sm">
              {locale === "ko" ? "예약 번호와 이메일로 예약을 확인하세요." : "Look up your booking with your reference and email."}
            </p>
          </div>
          <div className="card p-6">
            <LookupForm locale={locale} initialRef={ref ?? ""} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
