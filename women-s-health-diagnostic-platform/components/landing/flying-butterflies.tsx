"use client"

const butterflies = [
  { top: "10%", left: "4%", size: 18, duration: 18, delay: "-4s", direction: "right" },
  { top: "18%", left: "88%", size: 17, duration: 21, delay: "-11s", direction: "left" },
  { top: "26%", left: "10%", size: 20, duration: 19, delay: "-7s", direction: "right" },
  { top: "34%", left: "90%", size: 16, duration: 23, delay: "-18s", direction: "left" },
  { top: "42%", left: "6%", size: 21, duration: 20, delay: "-14s", direction: "right" },
  { top: "52%", left: "84%", size: 18, duration: 18, delay: "-9s", direction: "left" },
  { top: "62%", left: "12%", size: 22, duration: 22, delay: "-20s", direction: "right" },
  { top: "72%", left: "86%", size: 17, duration: 24, delay: "-16s", direction: "left" },
  { top: "80%", left: "8%", size: 19, duration: 19, delay: "-5s", direction: "right" },
  { top: "88%", left: "92%", size: 15, duration: 25, delay: "-23s", direction: "left" },
]

const butterflyPalettes = [
  { left: "#fde68a", right: "#f59e0b", body: "#4b5563", accent: "#92400e", spot: "#fff7ed" },
  { left: "#c7d2fe", right: "#818cf8", body: "#374151", accent: "#1d4ed8", spot: "#eef2ff" },
  { left: "#fed7aa", right: "#fb7185", body: "#4338ca", accent: "#9f1239", spot: "#fff1f2" },
  { left: "#bbf7d0", right: "#34d399", body: "#334155", accent: "#047857", spot: "#ecfdf5" },
  { left: "#f5d0fe", right: "#c084fc", body: "#3f3f46", accent: "#7c3aed", spot: "#faf5ff" },
]

export function FlyingButterflies() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {butterflies.map((butterfly, index) => {
        const palette = butterflyPalettes[index % butterflyPalettes.length]
        const flap = `${(0.22 + (index % 5) * 0.03).toFixed(3)}s`
        const wingPhase = `${(index % 2 === 0 ? -0.18 : 0.18 + (index % 5) * 0.04).toFixed(3)}s`

        return (
        <span
          key={index}
          className={`butterfly butterfly-${butterfly.direction} absolute`}
          style={{
            top: butterfly.top,
            left: butterfly.left,
            width: `${butterfly.size}px`,
            height: `${butterfly.size}px`,
            animationDuration: `${butterfly.duration}s`,
            animationDelay: butterfly.delay,
            "--flap": flap,
            "--wing-phase": wingPhase,
          }}
        >
          <svg viewBox="0 0 64 64" className="butterfly-trail absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id={`butterfly-trail-left-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="45%" stopColor="rgba(148,163,184,0.18)" />
                <stop offset="100%" stopColor="rgba(100,116,139,0.16)" />
              </linearGradient>
              <linearGradient id={`butterfly-trail-right-${index}`} x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="45%" stopColor="rgba(148,163,184,0.16)" />
                <stop offset="100%" stopColor="rgba(100,116,139,0.14)" />
              </linearGradient>
            </defs>
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M31 30C19 15 9 14 7 24c-2 9 5 18 14 21 6 2 9-2 10-15Z" fill={`url(#butterfly-trail-left-${index})`} stroke="rgba(255,255,255,0.14)" strokeWidth="0.8" />
              <path d="M33 30C45 15 55 14 57 24c2 9-5 18-14 21-6 2-9-2-10-15Z" fill={`url(#butterfly-trail-right-${index})`} stroke="rgba(255,255,255,0.14)" strokeWidth="0.8" />
              <path d="M29 39C18 40 13 48 16 54c3 5 10 5 14 0 3-4 3-10-1-15Z" fill="rgba(255,255,255,0.08)" />
              <path d="M35 39C46 40 51 48 48 54c-3 5-10 5-14 0-3-4-3-10 1-15Z" fill="rgba(255,255,255,0.08)" />
              <ellipse cx="32" cy="36" rx="1.8" ry="9" fill="rgba(255,255,255,0.14)" />
            </g>
          </svg>
          <svg viewBox="0 0 64 64" className="butterfly-core absolute inset-0 h-full w-full drop-shadow-[0_0_12px_rgba(236,72,153,0.35)]">
            <defs>
              <linearGradient id={`butterfly-left-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={palette.left} />
                <stop offset="60%" stopColor={palette.accent} />
                <stop offset="100%" stopColor={palette.spot} />
              </linearGradient>
              <linearGradient id={`butterfly-right-${index}`} x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={palette.spot} />
                <stop offset="55%" stopColor={palette.right} />
                <stop offset="100%" stopColor={palette.accent} />
              </linearGradient>
              <linearGradient id={`butterfly-body-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e5e7eb" />
                <stop offset="100%" stopColor={palette.body} />
              </linearGradient>
            </defs>
            <g className="butterfly-wings" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M31 29C18 14 8 14 7 25c-1 10 7 17 18 20 5 1 7-4 6-16Z" fill={`url(#butterfly-left-${index})`} stroke="rgba(255,255,255,0.55)" strokeWidth="0.9" />
              <path d="M33 29C46 14 56 14 57 25c1 10-7 17-18 20-5 1-7-4-6-16Z" fill={`url(#butterfly-right-${index})`} stroke="rgba(255,255,255,0.55)" strokeWidth="0.9" />
              <path d="M29 39C19 41 14 49 18 54c3 4 9 4 13 0 3-4 3-9-2-15Z" fill={`url(#butterfly-left-${index})`} stroke="rgba(255,255,255,0.42)" strokeWidth="0.7" />
              <path d="M35 39C45 41 50 49 46 54c-3 4-9 4-13 0-3-4-3-9 2-15Z" fill={`url(#butterfly-right-${index})`} stroke="rgba(255,255,255,0.42)" strokeWidth="0.7" />
              <ellipse cx="32" cy="35" rx="1.7" ry="11" fill={`url(#butterfly-body-${index})`} />
              <path d="M31.5 24C28 20 26 18 22 17" stroke={palette.body} strokeWidth="1" />
              <path d="M32.5 24C36 20 38 18 42 17" stroke={palette.body} strokeWidth="1" />
              <circle cx="32" cy="29" r="1.1" fill={palette.spot} />
              <circle cx="24" cy="23" r="1.8" fill="rgba(255,255,255,0.35)" />
              <circle cx="40" cy="23" r="1.8" fill="rgba(255,255,255,0.35)" />
              <path d="M22 27C25 30 27 31 29 31" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
              <path d="M42 27C39 30 37 31 35 31" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
            </g>
          </svg>
        </span>
        )
      })}

    </div>
  )
}