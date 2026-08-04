"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export default function RegisterForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const L = locale === "ko";
  const [f, setF] = useState({ name: "", email: "", password: "", phone: "" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, locale }),
    });
    const data = await res.json();
    if (res.ok) { router.push(data.redirect); router.refresh(); }
    else { setError(data.error ?? "Error"); setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div><label className="field-label">{L ? "이름" : "Name"}</label><input className="input" value={f.name} onChange={(e) => set("name", e.target.value)} required /></div>
      <div><label className="field-label">{L ? "이메일" : "Email"}</label><input type="email" className="input" value={f.email} onChange={(e) => set("email", e.target.value)} required /></div>
      <div><label className="field-label">{L ? "비밀번호" : "Password"}</label><input type="password" minLength={6} className="input" value={f.password} onChange={(e) => set("password", e.target.value)} required /></div>
      <div><label className="field-label">{L ? "전화번호" : "Phone"} <span className="text-[var(--color-slate)] font-normal">({L ? "선택" : "optional"})</span></label><input className="input" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
      {error && <div className="text-sm text-[#a52626]">{error}</div>}
      <button className="btn btn-primary" disabled={loading}>{loading ? "..." : L ? "회원가입" : "Create account"}</button>
    </form>
  );
}
