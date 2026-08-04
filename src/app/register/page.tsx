import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import RegisterForm from "@/components/RegisterForm";
import { getLocale } from "@/lib/locale";

export default async function RegisterPage() {
  const locale = await getLocale();
  const L = locale === "ko";
  return (
    <>
      <SiteHeader />
      <main className="container-cd py-14">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold">{L ? "회원가입" : "Create your account"}</h1>
            <p className="text-[var(--color-slate)] mt-2 text-sm">
              {L ? "예약을 한곳에서 관리하고 더 빠르게 예약하세요." : "Manage your bookings in one place and book faster."}
            </p>
          </div>
          <div className="card p-6"><RegisterForm locale={locale} /></div>
          <p className="text-center text-sm text-[var(--color-slate)] mt-4">
            {L ? "이미 계정이 있으신가요? " : "Already have an account? "}
            <Link href="/login" className="text-[var(--color-navy)] font-medium underline">{L ? "로그인" : "Sign in"}</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
