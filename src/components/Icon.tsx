import type { SVGProps } from "react";

// Refined stroke line-icons (24×24, currentColor) — replaces emoji for a
// cleaner, premium feel. Add new keys as needed.
const PATHS: Record<string, React.ReactNode> = {
  shield: <><path d="M12 3l7 3v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></>,
  badge: <><path d="M12 3l2.2 1.6 2.7-.2 1 2.5 2.3 1.4-.6 2.7.6 2.7-2.3 1.4-1 2.5-2.7-.2L12 21l-2.2-1.6-2.7.2-1-2.5L3.8 15.8l.6-2.7-.6-2.7 2.3-1.4 1-2.5 2.7.2L12 3z" /><path d="M9 12l2 2 4-4" /></>,
  tag: <><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0l-6.2-6.2a2 2 0 0 1-.6-1.4V5a2 2 0 0 1 2-2h7.4a2 2 0 0 1 1.4.6l6 6a2 2 0 0 1 0 2.8z" /><circle cx="8.5" cy="8.5" r="1.3" /></>,
  plane: <path d="M10.2 3.3a1.4 1.4 0 0 1 2.4 0l2.2 5.1 5.7.8c1 .1 1.4 1.4.6 2.1l-4.2 3.7 1.1 5.6c.2 1-.9 1.8-1.8 1.3L12 19.1l-5 2.7c-.9.5-2-.3-1.8-1.3l1.1-5.6-4.2-3.7c-.8-.7-.4-2 .6-2.1l5.7-.8 2.2-5.1z" transform="rotate(0 12 12)" />,
  board: <><rect x="4" y="4" width="16" height="12" rx="1.5" /><path d="M12 16v4M8 20h8" /><path d="M8 8.5h8M8 11.5h5" /></>,
  chat: <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />,
  car: <><path d="M3 13l1.8-5A2 2 0 0 1 6.7 6.7h10.6a2 2 0 0 1 1.9 1.3L21 13" /><path d="M3 13h18v4a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1H6.5v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4z" /><circle cx="7" cy="16" r="1" /><circle cx="17" cy="16" r="1" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  route: <><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M6 8.5V13a4 4 0 0 0 4 4h4" /></>,
  arrival: <><path d="M3 20h18" /><path d="M4.5 15.5l5-.8 4.5-6c.6-.8 1.8-1 2.6-.4.8.6.9 1.7.3 2.5l-3.2 4.3 3.8-.6" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
};

export default function Icon({ name, size = 22, ...props }: { name: keyof typeof PATHS | string; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {PATHS[name] ?? PATHS.globe}
    </svg>
  );
}
