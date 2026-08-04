"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export type CityContentInit = {
  city: string; country: string; headline: string; intro: string;
  faqText: string; metaTitle: string; metaDescription: string; published: boolean;
};

export default function CityContentForm({ locale, initial }: { locale: Locale; initial?: CityContentInit }) {
  const router = useRouter();
  const L = locale === "ko";
  const [f, setF] = useState<CityContentInit>(initial ?? {
    city: "", country: "", headline: "", intro: "", faqText: "", metaTitle: "", metaDescription: "", published: true,
  });
  const set = (k: keyof CityContentInit, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null); setMsg(null);
    const res = await fetch("/api/admin/actions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "SAVE_CITY_CONTENT", content: f }),
    });
    if (res.ok) { setMsg(L ? "저장되었습니다." : "Saved."); router.refresh(); }
    else { const d = await res.json().catch(() => ({})); setError(d.error ?? "Error"); }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="field-label">{L ? "도시 (예약창 값과 일치)" : "City (match booking widget)"}</label><input className="input" value={f.city} onChange={(e) => set("city", e.target.value)} required /></div>
        <div><label className="field-label">{L ? "국가" : "Country"}</label><input className="input" value={f.country} onChange={(e) => set("country", e.target.value)} /></div>
      </div>
      <div><label className="field-label">{L ? "헤드라인" : "Headline"}</label><input className="input" value={f.headline} onChange={(e) => set("headline", e.target.value)} /></div>
      <div><label className="field-label">{L ? "소개 문구" : "Intro"}</label><textarea className="textarea" rows={3} value={f.intro} onChange={(e) => set("intro", e.target.value)} /></div>
      <div>
        <label className="field-label">{L ? "FAQ (한 줄에 '질문 | 답변')" : "FAQ (one per line: 'Q | A')"}</label>
        <textarea className="textarea" rows={4} value={f.faqText} onChange={(e) => set("faqText", e.target.value)} placeholder={L ? "공항에서 어떻게 만나나요? | 입국장에서 이름 피켓으로 안내합니다." : "How do we meet? | At arrivals with a name board."} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="field-label">{L ? "SEO 제목" : "Meta title"}</label><input className="input" value={f.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} /></div>
        <div><label className="field-label">{L ? "SEO 설명" : "Meta description"}</label><input className="input" value={f.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} /></div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[var(--color-navy)]" checked={f.published} onChange={(e) => set("published", e.target.checked)} />{L ? "공개" : "Published"}</label>
      {error && <div className="text-sm text-[#a52626]">{error}</div>}
      {msg && <div className="text-sm text-[#16794a]">{msg}</div>}
      <button className="btn btn-primary w-fit" disabled={busy}>{busy ? "..." : L ? "도시 콘텐츠 저장" : "Save city content"}</button>
    </form>
  );
}
