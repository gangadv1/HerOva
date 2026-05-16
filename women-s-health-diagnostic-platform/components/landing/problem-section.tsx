"use client"

import { motion } from "framer-motion"
import { AlertTriangle, Clock, Users, TrendingUp } from "lucide-react"

export function ProblemSection() {
  return (
    <section id="problem" className="py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-pink-300 border border-pink-500/30 mb-6">
            <AlertTriangle className="w-4 h-4" />
            The Problem
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-foreground">A Crisis in </span>
            <span className="text-gradient-purple-pink">Women&apos;s Health</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Polycystic Ovary Syndrome (PCOS) represents a microcosm of a larger problem in women&apos;s health—conditions that are common, heterogeneous, and poorly understood.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-3xl p-8 border border-pink-500/20 hover:border-pink-500/40 transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Delayed Diagnoses</h3>
                <p className="text-pink-300">7+ years average wait</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Medical conditions that are common, heterogeneous, and poorly understood in medical practice lead to delayed or missed diagnoses, with disproportionate impact on marginalized populations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass rounded-3xl p-8 border border-cyan-500/20 hover:border-cyan-500/40 transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Health Disparities</h3>
                <p className="text-cyan-300">Disproportionate impact</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Marginalized populations face even greater challenges in receiving timely and accurate diagnoses, perpetuating cycles of health inequity and poor outcomes.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <div className="glass rounded-3xl p-8 border border-purple-500/20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Early Diagnosis Matters</h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Interventions for metabolic complications are most effective when implemented early, and patients deserve timely answers about their health. Our AI-powered platform aims to bridge this gap.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
