"use client"

import { motion } from "framer-motion"
import { ArrowRight, X, Check, Layers, Eye, Puzzle, FlaskConical, Lightbulb } from "lucide-react"

const traditionalSteps = [
  { text: "Patient reports symptoms over months or years", bad: true },
  { text: "Single-axis screening — cycle history or hormone panel alone", bad: true },
  { text: "Referral to specialist — months of wait time", bad: true },
  { text: "Binary result: \"likely PCOS\" or \"we're not sure yet\"", bad: true },
  { text: "No structured explanation of why", bad: true },
  { text: "Repeat visits to fill data gaps", bad: true },
]

const heROvaSteps = [
  { text: "Structured 6-domain intake: demographics, cycle, symptoms, metabolic, ultrasound, labs", good: true },
  { text: "Multi-signal synthesis — any combination of inputs is scored", good: true },
  { text: "Risk result in under a minute, with or without advanced data", good: true },
  { text: "Phenotype-aware output: Type A / B / C / D — not just positive/negative", good: true },
  { text: "SHAP-style ranked explanation of which signals drove the result", good: true },
  { text: "Referral priority queue for population-level screening", good: true },
]

const innovations = [
  {
    icon: Layers,
    color: "purple",
    title: "Multi-Signal, Not Single-Test",
    body: "Traditional PCOS screening often starts with a single axis — a hormone panel, or a symptom questionnaire. HerOva synthesises up to six clinical domains simultaneously, weighting each signal against Rotterdam criteria and metabolic context.",
    tag: "Methodology",
  },
  {
    icon: Puzzle,
    color: "cyan",
    title: "Phenotype-Aware, Not Binary",
    body: "Rather than returning \"PCOS\" or \"not PCOS\", HerOva classifies patients into four Rotterdam phenotypes (A–D), each with a distinct risk profile and treatment implication. This reframes screening from a gate to a clinical map.",
    tag: "Problem reframing",
  },
  {
    icon: Eye,
    color: "pink",
    title: "Explainable by Design",
    body: "SHAP-style feature rankings show exactly which signals elevated or lowered the risk score. Plain-language sentences translate the output for non-specialist readers. The reasoning is visible, not hidden in a model weight.",
    tag: "Transparency",
  },
  {
    icon: FlaskConical,
    color: "amber",
    title: "Flexible Data Model",
    body: "Most diagnostic tools require complete data or return nothing useful. HerOva's optional-step architecture scores whatever data is available, adjusting confidence metrics rather than blocking the workflow. It works in GP clinics, telehealth, and community health camps.",
    tag: "Adaptability",
  },
]

const colorMap: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  purple: {
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
    text: "text-purple-300",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  cyan: {
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
    text: "text-cyan-300",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
  pink: {
    border: "border-pink-500/30",
    bg: "bg-pink-500/10",
    text: "text-pink-300",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  },
  amber: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
}

export function InnovationSection() {
  return (
    <section id="innovation" className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/3 to-transparent" />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-cyan-300 border border-cyan-500/30 mb-6">
            <Lightbulb className="w-4 h-4" />
            What Makes HerOva Different
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-foreground">Reframing the </span>
            <span className="text-gradient-teal-pink">Diagnostic Question</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The traditional PCOS diagnostic pathway depends on specialist access, complete lab panels, and years of
            symptom accumulation. HerOva asks a different question: what can we surface{" "}
            <em>earlier</em>, from{" "}
            <em>whatever data is available</em>, in a way that is{" "}
            <em>explainable</em> and{" "}
            <em>actionable</em>?
          </p>
        </motion.div>

        {/* Traditional vs HerOva comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-6 mb-20"
        >
          {/* Traditional column */}
          <div className="glass rounded-3xl p-8 border border-red-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                <X className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Traditional Pathway</h3>
                <p className="text-sm text-muted-foreground">Fragmented, specialist-dependent, delayed</p>
              </div>
            </div>
            <ul className="space-y-3">
              {traditionalSteps.map((step) => (
                <li key={step.text} className="flex items-start gap-3 text-sm text-zinc-400">
                  <X className="w-4 h-4 text-red-400/70 mt-0.5 flex-shrink-0" />
                  {step.text}
                </li>
              ))}
            </ul>
          </div>

          {/* HerOva column */}
          <div className="glass rounded-3xl p-8 border border-emerald-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">HerOva Approach</h3>
                <p className="text-sm text-muted-foreground">Structured, multi-signal, explainable</p>
              </div>
            </div>
            <ul className="space-y-3 relative z-10">
              {heROvaSteps.map((step) => (
                <li key={step.text} className="flex items-start gap-3 text-sm text-zinc-300">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  {step.text}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Innovation dimensions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {innovations.map((item, i) => {
            const c = colorMap[item.color]
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`glass rounded-2xl p-6 border ${c.border} group hover:scale-[1.01] transition-transform`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`w-5 h-5 ${c.text}`} />
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${c.badge}`}>
                    {item.tag}
                  </span>
                </div>
                <h3 className="font-bold text-foreground mb-2 text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Honest framing note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-start gap-4 p-5 rounded-2xl border border-zinc-700/60 bg-zinc-900/40 text-sm text-zinc-400 max-w-3xl mx-auto"
        >
          <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
          <span>
            HerOva is a <strong className="text-zinc-200">prototype-level decision-support interface</strong>, not a
            regulated diagnostic device. Its innovations are in workflow design, multi-signal synthesis, and
            explainability — not in replacing the clinical judgment or confirmatory testing that a final PCOS diagnosis
            requires.
          </span>
        </motion.div>
      </div>
    </section>
  )
}
