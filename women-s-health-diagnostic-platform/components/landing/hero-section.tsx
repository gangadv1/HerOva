"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Logo from "@/components/branding/logo"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Activity, Brain, Upload, ClipboardList } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-purple-300 border border-purple-500/30">
              <Sparkles className="w-4 h-4" />
              <Logo size="sm" />
              AI-Powered Precision Diagnostics
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
          >
            <span className="text-foreground">Transforming </span>
            <span className="text-gradient-purple-pink">Women&apos;s</span>
            <br />
            <span className="text-gradient-teal-pink">Health</span>
            <span className="text-foreground"> Diagnostics</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Clinically interpretable endocrine diagnostic reasoning.
            <span className="text-purple-400"> Actionable, auditable outputs.</span>
            <span className="text-cyan-400"> Patient-centered insights.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/analysis">

              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white border-0 animate-gradient group">
                Start Analysis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

            </Link>
            
            <Link href="/analysis?mode=quick">
              <Button size="lg" variant="ghost" className="text-lg px-6 py-4 border-cyan-500/30 text-foreground hover:bg-cyan-500/5">
                Quick Screening Mode
              </Button>
            </Link>
            <Link href="/body-visualization">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-cyan-500/50 text-foreground hover:bg-cyan-500/10">
                <Activity className="mr-2 w-5 h-5" />
                Body Visualization
              </Button>
            </Link>
            <Link href="#technology">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-purple-500/50 text-foreground hover:bg-purple-500/10">
                Learn More
              </Button>
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
                Sessions
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: Activity, label: "Women Affected", value: "1 in 10", color: "purple" },
              { icon: Brain, label: "Avg Diagnosis Delay", value: "7+ Years", color: "pink" },
              { icon: Sparkles, label: "AI Accuracy Target", value: ">95%", color: "cyan" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-colors"
              >
                <stat.icon className={`w-8 h-8 mb-4 ${
                  stat.color === "purple" ? "text-purple-400" :
                  stat.color === "pink" ? "text-pink-400" : "text-cyan-400"
                }`} />
                <div className={`text-3xl font-bold mb-2 ${
                  stat.color === "purple" ? "text-purple-300" :
                  stat.color === "pink" ? "text-pink-300" : "text-cyan-300"
                }`}>
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-purple-500/50 flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-purple-400"
          />
        </div>
      </motion.div>
    </section>
  );
}
