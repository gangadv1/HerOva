"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Upload, ClipboardList } from "lucide-react"
import Logo from "@/components/branding/logo"

export function CTASection() {
  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Glow effects */}
          <div className="absolute -top-20 left-1/4 w-60 h-60 bg-purple-500/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 w-60 h-60 bg-cyan-500/30 rounded-full blur-3xl" />
          
          <div className="glass rounded-3xl p-12 md:p-16 border border-purple-500/30 text-center relative overflow-hidden">
            {/* Shimmer effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            </div>

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, type: "spring" }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center mx-auto mb-8"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-foreground">Ready to Transform </span>
                <span className="text-gradient-purple-pink">Diagnostics?</span>
              </h2>

              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Experience the future of women&apos;s health diagnostics. Our AI-powered platform is designed to help clinicians make more accurate, timely diagnoses.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/analysis" legacyBehavior>
                  <a>
                    <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white border-0 animate-gradient group">
                      Start Analysis Now
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </a>
                </Link>
                <Link href="/csv-upload">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-cyan-500/50 text-foreground hover:bg-cyan-500/10">
                    <Upload className="mr-2 w-5 h-5" />
                    Batch Upload
                  </Button>
                </Link>
                <Link href="/sessions">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-pink-500/50 text-foreground hover:bg-pink-500/10">
                    <ClipboardList className="mr-2 w-5 h-5" />
                    View Sessions
                  </Button>
                </Link>
              </div>

              <p className="mt-8 text-sm text-muted-foreground">
                Built for the Women&apos;s Health Hackathon • PCOS & Endometriosis Focus
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Logo size="md" />
          </div>
          <p className="text-muted-foreground text-sm">
            AI-Powered Precision Diagnostics for Women&apos;s Health
          </p>
          <p className="text-muted-foreground/60 text-xs mt-2">
            © 2026 HerOva Health. For hackathon demonstration purposes.
          </p>
        </motion.footer>
      </div>
    </section>
  )
}
