import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LoginForm from "@/components/LoginForm";
import { getLocale } from "@/lib/locale";

export default async function LoginPage() {
  const locale = await getLocale();
  return (
    <>
      <SiteHeader />
      <main className="container-cd py-14">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold">{locale === "ko" ? "로그인" : "Sign in"}</h1>
            <p className="text-[var(--color-slate)] mt-2 text-sm">
              {locale === "ko" ? "기사 파트너 및 관리자 로그인" : "Driver partner & admin sign in"}
            </p>
          </div>
          <div className="card p-6">
            <LoginForm locale={locale} />
          </div>
          <p className="text-center text-sm text-[var(--color-slate)] mt-4">
            {locale === "ko" ? "기사 파트너 가입을 원하시나요? " : "Want to become a driver partner? "}
            <Link href="/partners" className="text-[var(--color-navy)] font-medium underline">
              {locale === "ko" ? "파트너 지원" : "Apply here"}
            </Link>
          </p>
          <div className="mt-6 rounded-lg bg-[var(--color-mist)] p-4 text-xs text-[var(--color-slate)]">
            <p className="font-semibold text-[var(--color-ink)] mb-1">{locale === "ko" ? "데모 계정" : "Demo accounts"}</p>
            <p>Admin — admin@certodrive.com / password123</p>
            <p>Driver — driver.seoul@certodrive.com / password123</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
