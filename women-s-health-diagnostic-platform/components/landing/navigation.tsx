"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass py-3" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center">
            <svg viewBox="0 0 64 64" className="h-10 w-10" aria-hidden="true">
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
                  <linearGradient id="logo-flower" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fffce8" />
                    <stop offset="100%" stopColor="#facc15" />
                  </linearGradient>
                </defs>
                <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <g transform="translate(4 10) rotate(-18 18 12)">
                    <path d="M18 12C12 7 7 7 5 10c-2 3 0 8 5 10 5 2 9 0 11-4Z" fill="url(#logo-left-wing)" stroke="rgba(255,255,255,0.72)" strokeWidth="0.8" />
                    <path d="M18 13C11 15 7 19 7 23c0 3 3 5 6 4 4-1 7-5 5-14Z" fill="url(#logo-left-wing)" stroke="rgba(255,255,255,0.58)" strokeWidth="0.7" />
                    <ellipse cx="18.5" cy="14" rx="1.2" ry="7.3" fill="#7c3aed" opacity="0.92" />
                    <circle cx="19" cy="12" r="1" fill="#f5f3ff" />
                  </g>
                    <g transform="translate(2 6) scale(1.18) rotate(-26 18 12)">
                      <path d="M18 12C12 7 7 7 5 10c-2 3 0 8 5 10 5 2 9 0 11-4Z" fill="url(#logo-left-wing)" stroke="rgba(0,0,0,0.06)" strokeWidth="0.6" />
                      <path d="M18 13C11 15 7 19 7 23c0 3 3 5 6 4 4-1 7-5 5-14Z" fill="url(#logo-left-wing)" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />
                      <ellipse cx="18.5" cy="14" rx="1.4" ry="8.0" fill="#7c3aed" opacity="0.94" />
                      <circle cx="19" cy="12" r="1.1" fill="#f5f3ff" />
                    </g>
                  <g transform="translate(60 10) scale(-1 1) rotate(-18 18 12)">
                    <path d="M18 12C12 7 7 7 5 10c-2 3 0 8 5 10 5 2 9 0 11-4Z" fill="url(#logo-right-wing)" stroke="rgba(255,255,255,0.72)" strokeWidth="0.8" />
                    <path d="M18 13C11 15 7 19 7 23c0 3 3 5 6 4 4-1 7-5 5-14Z" fill="url(#logo-right-wing)" stroke="rgba(255,255,255,0.58)" strokeWidth="0.7" />
                    <ellipse cx="18.5" cy="14" rx="1.2" ry="7.3" fill="#db2777" opacity="0.92" />
                    <circle cx="19" cy="12" r="1" fill="#fff1f2" />
                  </g>
                    <g transform="translate(62 6) scale(-1.18 1.18) rotate(-26 18 12)">
                      <path d="M18 12C12 7 7 7 5 10c-2 3 0 8 5 10 5 2 9 0 11-4Z" fill="url(#logo-right-wing)" stroke="rgba(0,0,0,0.06)" strokeWidth="0.6" />
                      <path d="M18 13C11 15 7 19 7 23c0 3 3 5 6 4 4-1 7-5 5-14Z" fill="url(#logo-right-wing)" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />
                      <ellipse cx="18.5" cy="14" rx="1.4" ry="8.0" fill="#db2777" opacity="0.94" />
                      <circle cx="19" cy="12" r="1.1" fill="#fff1f2" />
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
                  <path d="M32 39V48" stroke="rgba(255,255,255,0.75)" strokeWidth="1.2" />
                  <path d="M32 38C29 34 27 31 24 30" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
                  <path d="M32 38C35 34 37 31 40 30" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
                  <path d="M32 48C31 51 30 54 29 56" stroke="rgba(255,255,255,0.65)" strokeWidth="0.9" />
                  <path d="M32 48C33 51 34 54 35 56" stroke="rgba(255,255,255,0.65)" strokeWidth="0.9" />
                </g>
              </svg>
          </div>
          <span className="sr-only">HerOva</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#problem" className="text-muted-foreground hover:text-foreground transition-colors">
            Problem
          </Link>
          <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#technology" className="text-muted-foreground hover:text-foreground transition-colors">
            Technology
          </Link>
          <Link href="#datasets" className="text-muted-foreground hover:text-foreground transition-colors">
            Datasets
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/analysis" legacyBehavior>
            <a>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0">
                Start Analysis
              </Button>
            </a>
          </Link>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden glass mt-2 mx-4 rounded-xl p-6">
          <div className="flex flex-col gap-4">
            <Link href="#problem" className="text-muted-foreground hover:text-foreground transition-colors">
              Problem
            </Link>
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#technology" className="text-muted-foreground hover:text-foreground transition-colors">
              Technology
            </Link>
            <Link href="#datasets" className="text-muted-foreground hover:text-foreground transition-colors">
              Datasets
            </Link>
            <Link href="/analysis" legacyBehavior>
              <a>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0">
                  Start Analysis
                </Button>
              </a>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
