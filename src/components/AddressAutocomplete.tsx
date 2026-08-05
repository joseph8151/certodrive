"use client";

import { useState, useEffect, useRef } from "react";

type Sug = { label: string; lat?: number; lon?: number };

// Address input with live suggestions from /api/geocode (Photon/OSM).
// `quickOptions` (e.g. a city's airports) show first before the user types,
// so common pickup points stay one tap away. Free typing is always allowed,
// so this never blocks a booking if geocoding is unavailable.
export default function AddressAutocomplete({
  value,
  onChange,
  placeholder,
  locale,
  quickOptions = [],
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  locale: string;
  quickOptions?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [sugs, setSugs] = useState<Sug[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const justPicked = useRef(false);

  useEffect(() => {
    if (justPicked.current) { justPicked.current = false; return; }
    const q = value.trim();
    if (q.length < 3) { setSugs([]); return; }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}&lang=${locale}`);
        const data = await res.json();
        if (!cancelled) setSugs(Array.isArray(data.suggestions) ? data.suggestions : []);
      } catch {
        if (!cancelled) setSugs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [value, locale]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const quick = value.trim().length < 3
    ? quickOptions.filter((q) => q).map((q) => ({ label: q }))
    : [];
  const list: Sug[] = value.trim().length < 3 ? quick : sugs;

  function pick(label: string) {
    justPicked.current = true;
    onChange(label);
    setOpen(false);
    setSugs([]);
    setActive(-1);
  }

  return (
    <div className="relative" ref={boxRef}>
      <input
        className="input"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => { onChange(e.target.value); setOpen(true); setActive(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open || list.length === 0) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(list.length - 1, a + 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
          else if (e.key === "Enter" && active >= 0) { e.preventDefault(); pick(list[active].label); }
          else if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && (list.length > 0 || loading) && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-[var(--color-line)] bg-white shadow-lg max-h-64 overflow-auto">
          {value.trim().length < 3 && quick.length > 0 && (
            <div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide text-[var(--color-slate)]">
              {locale === "ko" ? "주요 공항" : "Airports"}
            </div>
          )}
          {list.map((s, i) => (
            <button
              key={`${s.label}-${i}`}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); pick(s.label); }}
              onMouseEnter={() => setActive(i)}
              className={`w-full text-left px-3 py-2 text-sm flex items-start gap-2 ${i === active ? "bg-[var(--color-mist)]" : "hover:bg-[var(--color-mist)]"}`}
            >
              <span className="text-[var(--color-gold-dark)] mt-0.5 shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.4-7-11a7 7 0 0 1 14 0c0 4.6-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
              </span>
              <span>{s.label}</span>
            </button>
          ))}
          {loading && value.trim().length >= 3 && (
            <div className="px-3 py-2 text-xs text-[var(--color-slate)]">{locale === "ko" ? "검색 중…" : "Searching…"}</div>
          )}
        </div>
      )}
    </div>
  );
}
