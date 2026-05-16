import React from "react"

type LogoProps = {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const dims = size === "sm" ? 18 : size === "lg" ? 36 : 24
  return (
    <svg viewBox="0 0 64 64" width={dims} height={dims} className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logo-left-wing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ede9fe" />
          <stop offset="55%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="logo-right-wing" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffe4ec" />
          <stop offset="55%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
      </defs>

      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g transform="translate(4 10) rotate(-18 18 12)">
          <path d="M18 12C12 7 7 7 5 10c-2 3 0 8 5 10 5 2 9 0 11-4Z" fill="url(#logo-left-wing)" stroke="rgba(255,255,255,0.72)" strokeWidth="0.8" />
          <path d="M18 13C11 15 7 19 7 23c0 3 3 5 6 4 4-1 7-5 5-14Z" fill="url(#logo-left-wing)" stroke="rgba(255,255,255,0.58)" strokeWidth="0.7" />
        </g>

        <g transform="translate(60 10) scale(-1 1) rotate(-18 18 12)">
          <path d="M18 12C12 7 7 7 5 10c-2 3 0 8 5 10 5 2 9 0 11-4Z" fill="url(#logo-right-wing)" stroke="rgba(255,255,255,0.72)" strokeWidth="0.8" />
          <path d="M18 13C11 15 7 19 7 23c0 3 3 5 6 4 4-1 7-5 5-14Z" fill="url(#logo-right-wing)" stroke="rgba(255,255,255,0.58)" strokeWidth="0.7" />
        </g>

        <g transform="translate(32 43)">
          {[
            [0, -10],
            [8, -6],
            [10, 2],
            [6, 9],
            [0, 11],
            [-6, 9],
            [-10, 2],
            [-8, -6],
          ].map(([x, y], index) => (
            <ellipse
              key={index}
              cx={x}
              cy={y}
              rx="3.8"
              ry="5.6"
              transform={`rotate(${index * 45} ${x} ${y})`}
              fill="#ffffff"
              stroke="rgba(0,0,0,0.06)"
              strokeWidth="0.45"
            />
          ))}
          <circle cx="0" cy="0" r="3.8" fill="#facc15" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" />
          <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
        </g>
      </g>
    </svg>
  )
}

export default Logo
