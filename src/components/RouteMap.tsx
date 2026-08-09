// Stylized "live route" map — a mobility-platform motif. Pure inline SVG
// (no external map/API), theme-dark, with an animated dashed route between a
// pickup and destination pin. Decorative; used on marketing surfaces.
export default function RouteMap({ from, to, className = "" }: { from: string; to: string; className?: string }) {
  return (
    <div className={`relative rounded-3xl overflow-hidden ring-1 ring-white/10 ${className}`} style={{ background: "linear-gradient(160deg,#3a352e 0%,#2a2620 60%,#201d18 100%)" }}>
      <svg viewBox="0 0 400 300" className="w-full h-full block" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${from} → ${to}`}>
        {/* faint street grid */}
        <g stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1">
          {[40, 90, 140, 190, 240, 290].map((y) => <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} />)}
          {[50, 110, 170, 230, 290, 350].map((x) => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="300" />)}
        </g>
        {/* a couple of "blocks" for depth */}
        <g fill="#ffffff" fillOpacity="0.03">
          <rect x="60" y="50" width="90" height="60" rx="6" />
          <rect x="240" y="150" width="100" height="70" rx="6" />
          <rect x="120" y="190" width="70" height="50" rx="6" />
        </g>

        {/* route path */}
        <path id="cd-route" d="M60 240 C 130 210, 150 120, 230 90 S 330 70, 350 60" fill="none" stroke="#4a453b" strokeWidth="6" strokeLinecap="round" />
        <path d="M60 240 C 130 210, 150 120, 230 90 S 330 70, 350 60" fill="none" stroke="#b8944e" strokeWidth="3" strokeLinecap="round" className="route-dash" />

        {/* pickup pin */}
        <g>
          <circle cx="60" cy="240" r="9" fill="#b8944e" fillOpacity="0.25" className="pulse-dot" />
          <circle cx="60" cy="240" r="5" fill="#b8944e" />
        </g>
        {/* destination pin */}
        <g transform="translate(350 60)">
          <path d="M0 -16 C 9 -16, 14 -9, 14 -2 C 14 7, 0 16, 0 16 C 0 16, -14 7, -14 -2 C -14 -9, -9 -16, 0 -16 Z" fill="#fff" />
          <circle cx="0" cy="-2" r="4.5" fill="var(--color-navy)" />
        </g>
      </svg>

      {/* labels */}
      <div className="absolute left-4 bottom-4 flex items-center gap-2 text-white text-xs">
        <span className="h-2 w-2 rounded-full bg-[var(--color-gold)]" />
        <span className="font-medium">{from}</span>
      </div>
      <div className="absolute right-4 top-4 flex items-center gap-2 text-white text-xs">
        <span className="font-medium">{to}</span>
        <span className="h-2 w-2 rounded-full bg-white" />
      </div>
    </div>
  );
}
