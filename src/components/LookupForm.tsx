"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export default function LookupForm({ locale, initialRef }: { locale: Locale; initialRef: string }) {
  const router = useRouter();
  const [ref, setRef] = useState(initialRef);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref.trim().toUpperCase(), email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Not found");
      router.push(`/booking/confirm/${data.reference}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div>
        <label className="field-label">{locale === "ko" ? "예약 번호" : "Reference"}</label>
        <input className="input" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="CD-XXXXXX" required />
      </div>
      <div>
        <label className="field-label">{locale === "ko" ? "이메일" : "Email"}</label>
        <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      {error && <div className="text-sm text-[#a52626]">{error}</div>}
      <button className="btn btn-primary" disabled={loading}>
        {loading ? (locale === "ko" ? "조회 중..." : "Searching...") : locale === "ko" ? "예약 조회" : "Find booking"}
      </button>
    </form>
  );
}
