"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Locale } from "@/lib/i18n";

type Msg = { id: string; sender: string; senderName: string; body: string; createdAt: string };

// Direct customer <-> driver chat for one booking. Polls every few seconds
// (no websockets needed on serverless). `me` is the current viewer's role so
// their own messages align right.
export default function BookingChat({
  reference,
  me,
  locale,
}: {
  reference: string;
  me: "CUSTOMER" | "DRIVER" | "ADMIN";
  locale: Locale;
}) {
  const L = locale === "ko";
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warn, setWarn] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/messages?reference=${encodeURIComponent(reference)}`);
      if (res.ok) {
        const d = await res.json();
        setMessages(Array.isArray(d.messages) ? d.messages : []);
      }
    } catch { /* ignore transient */ }
  }, [reference]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true); setError(null);
    try {
      const res = await fetch("/api/bookings/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, body }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      setText("");
      setWarn(!!d.warning);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSending(false);
    }
  }

  const roleLabel = (s: string) =>
    s === "DRIVER" ? (L ? "기사" : "Driver") : s === "ADMIN" ? (L ? "체르토" : "Certo") : (L ? "고객" : "Customer");

  return (
    <div className="card p-5 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{me === "DRIVER" ? (L ? "고객과 대화" : "Chat with customer") : (L ? "기사와 대화" : "Chat with your driver")}</h3>
        <span className="text-xs text-[var(--color-slate)]">{L ? "실시간" : "Live"}</span>
      </div>
      <p className="text-[11px] text-[var(--color-slate)] bg-[var(--color-mist)] rounded-md px-3 py-2 mb-3 leading-relaxed">
        {L
          ? "픽업 위치·시간 조율용 대화입니다. 안전을 위해 요금 협의·외부 결제·개인 연락처 공유는 금지됩니다. 모든 결제는 체르토 드라이브를 통해 진행하세요."
          : "For coordinating pickup and timing. For your safety, price negotiation, off-platform payment, and sharing personal contacts are not allowed — keep all payment on Certo Drive."}
      </p>

      <div className="flex-1 max-h-80 overflow-y-auto grid gap-3 pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-[var(--color-slate)] text-center py-6">
            {L ? "아직 대화가 없습니다. 먼저 인사를 건네보세요." : "No messages yet — say hello."}
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender === me;
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <div className="text-[11px] text-[var(--color-slate)] mb-1">
                {mine ? (L ? "나" : "You") : `${roleLabel(m.sender)} · ${m.senderName}`}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                mine ? "bg-[var(--color-navy)] text-white" : "bg-[var(--color-mist)] text-[var(--color-ink)]"
              }`}>
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {warn && (
        <div className="text-xs text-[#9a6a12] bg-[#fdf3e0] rounded-md px-3 py-2 mt-2">
          {L
            ? "⚠️ 요금·외부 결제·연락처 관련 내용이 감지되었습니다. 외부 거래는 정책 위반이며 보호를 받을 수 없습니다. 모든 결제는 체르토를 통해 진행하세요."
            : "⚠️ This looks like off-platform or payment talk. Off-platform deals violate policy and aren't protected — keep payment on Certo Drive."}
        </div>
      )}
      {error && <div className="text-xs text-[#a52626] mt-2">{error}</div>}

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          className="input flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={L ? "메시지를 입력하세요…" : "Type a message…"}
          maxLength={2000}
        />
        <button className="btn btn-primary" disabled={sending || !text.trim()}>
          {sending ? "…" : (L ? "전송" : "Send")}
        </button>
      </form>
    </div>
  );
}
