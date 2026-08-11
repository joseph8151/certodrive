import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LoginForm from "@/components/LoginForm";
import SocialButtons from "@/components/SocialButtons";
import { getLocale } from "@/lib/locale";
import { authProviders } from "@/lib/oauth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const locale = await getLocale();
  const providers = authProviders();
  const { error } = await searchParams;
  const L = locale === "ko";
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
          {error && (
            <div className="mb-4 rounded-lg bg-[#fdeaea] text-[#a52626] text-sm px-3 py-2">
              {L ? "소셜 로그인에 실패했습니다. 다시 시도해 주세요." : "Social sign-in failed. Please try again."}
            </div>
          )}
          <div className="card p-6 grid gap-4">
            <LoginForm locale={locale} />
            <SocialButtons providers={providers} locale={locale} />
          </div>
          <p className="text-center text-sm text-[var(--color-slate)] mt-4">
            {locale === "ko" ? "고객 회원가입 " : "New customer? "}
            <Link href="/register" className="text-[var(--color-navy)] font-medium underline">
              {locale === "ko" ? "회원가입" : "Create an account"}
            </Link>
            {" · "}
            {locale === "ko" ? "기사 파트너 " : "Driver? "}
            <Link href="/partners" className="text-[var(--color-navy)] font-medium underline">
              {locale === "ko" ? "파트너 지원" : "Apply here"}
            </Link>
          </p>
          {process.env.NODE_ENV !== "production" && (
            <div className="mt-6 rounded-lg bg-[var(--color-mist)] p-4 text-xs text-[var(--color-slate)]">
              <p className="font-semibold text-[var(--color-ink)] mb-1">{locale === "ko" ? "데모 계정 (개발 전용)" : "Demo accounts (dev only)"}</p>
              <p>Admin — admin@certodrive.com / password123</p>
              <p>Driver — driver.seoul@certodrive.com / password123</p>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
