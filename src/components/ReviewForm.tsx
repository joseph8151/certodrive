"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export default function ReviewForm({ reference, locale }: { reference: string; locale: Locale }) {
  const router = useRouter();
  const L = locale === "ko";
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) return setError(L ? "별점을 선택하세요." : "Please select a rating.");
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, email, rating, comment }),
    });
    if (res.ok) setStatus("done");
    else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Error");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="card p-6 text-center">
        <div className="text-2xl">🙏</div>
        <p className="mt-2 font-medium">{L ? "소중한 후기 감사합니다!" : "Thank you for your review!"}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-6 grid gap-4">
      <h3 className="font-semibold text-lg">{L ? "이용 후기를 남겨주세요" : "Leave a review"}</h3>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="text-3xl leading-none"
            aria-label={`${n} stars`}
          >
            <span className={(hover || rating) >= n ? "text-[var(--color-gold)]" : "text-[var(--color-line)]"}>★</span>
          </button>
        ))}
      </div>
      <div>
        <label className="field-label">{L ? "예약 이메일 (본인 확인)" : "Booking email (verification)"}</label>
        <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="field-label">{L ? "코멘트" : "Comment"} <span className="text-[var(--color-slate)] font-normal">({L ? "선택" : "optional"})</span></label>
        <textarea className="textarea" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>
      {error && <div className="text-sm text-[#a52626]">{error}</div>}
      <button className="btn btn-primary" disabled={status === "loading"}>
        {status === "loading" ? "..." : L ? "후기 등록" : "Submit review"}
      </button>
    </form>
  );
}
