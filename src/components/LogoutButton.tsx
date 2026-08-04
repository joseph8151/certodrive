"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export default function LogoutButton({ locale }: { locale: Locale }) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button onClick={logout} className="text-[var(--color-slate)] hover:text-[var(--color-ink)] font-medium">
      {locale === "ko" ? "로그아웃" : "Sign out"}
    </button>
  );
}
