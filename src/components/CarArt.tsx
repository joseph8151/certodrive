// Elegant side-profile vehicle illustrations (SVG) for the fleet cards.
// Silhouette shifts subtly by body type: sedan, van, minibus.

export default function CarArt({ type = "sedan", className = "" }: { type?: "sedan" | "van" | "minibus"; className?: string }) {
  return (
    <svg viewBox="0 0 320 150" className={className} role="img" aria-label={`${type} illustration`}>
      <defs>
        <linearGradient id={`body-${type}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a3a58" />
          <stop offset="1" stopColor="#3a352e" />
        </linearGradient>
        <linearGradient id={`glass-${type}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4a5f86" />
          <stop offset="1" stopColor="#2c3c5c" />
        </linearGradient>
      </defs>

      {type === "sedan" && (
        <g>
          <path d="M26 104 C40 78 70 70 96 68 L120 50 C132 42 150 40 170 40 L208 42 C232 44 252 56 268 74 L292 82 C300 84 302 92 300 100 L298 104 Z" fill={`url(#body-${type})`} />
          <path d="M124 54 C134 47 150 46 168 46 L200 47 C216 48 230 55 240 66 L150 66 L128 64 Z" fill={`url(#glass-${type})`} opacity="0.9" />
          <path d="M150 66 L150 46" stroke="#3a352e" strokeWidth="2" />
        </g>
      )}
      {type === "van" && (
        <g>
          <path d="M22 106 C30 74 44 60 60 56 L120 46 C150 42 210 42 250 50 C272 55 288 70 296 88 L298 102 C299 106 296 108 292 108 L26 108 C22 108 21 108 22 106 Z" fill={`url(#body-${type})`} />
          <path d="M70 60 L118 52 C150 49 200 49 236 56 L236 76 L70 76 Z" fill={`url(#glass-${type})`} opacity="0.9" />
          <path d="M120 52 L120 76 M170 51 L170 76" stroke="#3a352e" strokeWidth="2" />
        </g>
      )}
      {type === "minibus" && (
        <g>
          <path d="M20 108 C24 70 30 56 42 52 L250 44 C276 44 292 60 298 84 L300 104 C301 107 298 108 296 108 L24 108 C20 108 20 108 20 108 Z" fill={`url(#body-${type})`} />
          <path d="M52 58 L250 52 L250 78 L52 78 Z" fill={`url(#glass-${type})`} opacity="0.9" />
          <path d="M100 54 L100 78 M150 53 L150 78 M200 52 L200 78" stroke="#3a352e" strokeWidth="2" />
        </g>
      )}

      {/* Champagne accent line */}
      <path d="M30 104 L296 104" stroke="#b8944e" strokeWidth="2" opacity="0.7" />
      {/* Wheels */}
      <g>
        <circle cx="96" cy="108" r="22" fill="#201d18" />
        <circle cx="96" cy="108" r="12" fill="#3a352e" stroke="#b8944e" strokeWidth="1.5" />
        <circle cx="236" cy="108" r="22" fill="#201d18" />
        <circle cx="236" cy="108" r="12" fill="#3a352e" stroke="#b8944e" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
