"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "textarea" | "select";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
};

export default function SimpleForm({
  endpoint,
  fields,
  submitLabel,
  successMessage,
  locale,
}: {
  endpoint: string;
  fields: Field[];
  submitLabel: string;
  successMessage: string;
  locale: Locale;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
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
      <div className="rounded-lg bg-[#e6f5ec] text-[#16794a] px-4 py-6 text-center">
        <div className="text-2xl mb-2">✓</div>
        {successMessage}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      {fields.map((f) => (
        <div key={f.name}>
          <label className="field-label">{f.label}{f.required && <span className="text-[var(--color-gold-dark)]"> *</span>}</label>
          {f.type === "textarea" ? (
            <textarea className="textarea" rows={4} required={f.required} value={values[f.name] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))} />
          ) : f.type === "select" ? (
            <select className="select" required={f.required} value={values[f.name] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}>
              <option value="">{locale === "ko" ? "선택" : "Select"}</option>
              {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : (
            <input type={f.type ?? "text"} className="input" required={f.required} placeholder={f.placeholder} value={values[f.name] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))} />
          )}
        </div>
      ))}
      {error && <div className="text-sm text-[#a52626]">{error}</div>}
      <button className="btn btn-primary" disabled={status === "loading"}>
        {status === "loading" ? "..." : submitLabel}
      </button>
    </form>
  );
}
