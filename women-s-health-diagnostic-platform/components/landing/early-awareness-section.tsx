"use client"

import { motion } from "framer-motion"
import { Heart, MapPin, GraduationCap, Scale, Sprout, Globe } from "lucide-react"

const populations = [
  {
    icon: MapPin,
    group: "Rural & Remote Communities",
    barrier: "Limited or no access to gynaecologists or endocrinologists",
    value:
      "A community health worker with a tablet can run batch screening from a patient list and surface the highest-risk individuals for referral — without a specialist present.",
    color: "purple",
  },
  {
    icon: GraduationCap,
    group: "Adolescents & Young Adults",
    barrier: "Symptoms often normalised or dismissed at first presentation",
    value:
      "Structured symptom intake and cycle pattern analysis can help surface a risk pattern earlier, supporting a conversation with a GP before years of unaddressed symptoms accumulate.",
    color: "cyan",
  },
  {
    icon: Scale,
    group: "Women with Limited Lab Access",
    barrier: "Hormone panels and ultrasound are unavailable or unaffordable",
    value:
      "The optional-step model generates a risk assessment from demographic, menstrual, and symptom data alone — no lab results required for a first-pass signal.",
    color: "pink",
  },
  {
    icon: Globe,
    group: "Low- and Middle-Income Settings",
    barrier: "Fragmented care, limited EHR infrastructure, high specialist wait times",
    value:
      "Browser-based, offline-capable deployment means the tool can run on a basic laptop or tablet with no cloud subscription or specialist software required.",
    color: "amber",
  },
  {
    icon: Heart,
    group: "Women with High Metabolic Risk",
    barrier: "PCOS-associated insulin resistance often goes unrecognised until complications arise",
    value:
      "Metabolic indicators — HOMA-IR, fasting glucose, waist circumference — are included in the scoring model, helping flag insulin resistance patterns alongside hormonal signals.",
    color: "green",
  },
  {
    icon: Sprout,
    group: "Primary Care & General Practice",
    barrier: "GPs may lack structured tools to evaluate PCOS systematically",
    value:
      "The 6-step intake provides a reproducible clinical structure for PCOS assessment in a GP consultation, with clear next-step guidance and referral indicators.",
    color: "teal",
  },
]

const preventionPoints = [
  {
    stat: "Earlier",
    label: "pattern recognition",
    body: "Identifying high-risk phenotypes before specialist referral may compress the diagnostic timeline — particularly for Type A patterns where metabolic intervention is most time-sensitive.",
    color: "purple",
  },
  {
    stat: "Clearer",
    label: "next-step guidance",
    body: "Every analysis generates ranked clinical recommendations and a referral priority indicator, reducing the ambiguity that often follows a first conversation about irregular cycles or androgen symptoms.",
    color: "cyan",
  },
  {
    stat: "Broader",
    label: "educational reach",
    body: "The molecular pathway module, Rotterdam criteria breakdown, and plain-language summary all serve an educational function — supporting both clinician training and patient understanding.",
    color: "pink",
  },
  {
    stat: "Wider",
    label: "population coverage",
    body: "A single clinician can screen hundreds of patients from a CSV export of their patient list, producing a risk-ranked referral queue in minutes rather than individual appointments.",
    color: "amber",
  },
]

const colorMap: Record<string, { border: string; bg: string; text: string; iconBg: string }> = {
  purple: { border: "border-purple-500/25", bg: "bg-purple-500/8", text: "text-purple-300", iconBg: "bg-purple-500/15 border-purple-500/30" },
  cyan: { border: "border-cyan-500/25", bg: "bg-cyan-500/8", text: "text-cyan-300", iconBg: "bg-cyan-500/15 border-cyan-500/30" },
  pink: { border: "border-pink-500/25", bg: "bg-pink-500/8", text: "text-pink-300", iconBg: "bg-pink-500/15 border-pink-500/30" },
  amber: { border: "border-amber-500/25", bg: "bg-amber-500/8", text: "text-amber-300", iconBg: "bg-amber-500/15 border-amber-500/30" },
  green: { border: "border-green-500/25", bg: "bg-green-500/8", text: "text-green-300", iconBg: "bg-green-500/15 border-green-500/30" },
  teal: { border: "border-teal-500/25", bg: "bg-teal-500/8", text: "text-teal-300", iconBg: "bg-teal-500/15 border-teal-500/30" },
}

const statColorMap: Record<string, string> = {
  purple: "text-purple-300",
  cyan: "text-cyan-300",
  pink: "text-pink-300",
  amber: "text-amber-300",
}

export function EarlyAwarenessSection() {
  return (
    <section id="impact" className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/3 to-transparent" />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-pink-300 border border-pink-500/30 mb-6">
            <Heart className="w-4 h-4" />
            Public Health Value
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-foreground">Earlier Awareness, </span>
            <span className="text-gradient-purple-pink">Broader Reach</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            PCOS affects an estimated 8–13% of women of reproductive age globally. The majority go undiagnosed for years.
            HerOva is designed to support earlier awareness — not as a replacement for clinical care, but as a structured
            first step that can reach populations where that first step is currently missing.
          </p>
        </motion.div>

        {/* Prevention / education value row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {preventionPoints.map((pt, i) => (
            <motion.div
              key={pt.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass rounded-2xl p-6 border border-zinc-800 flex flex-col gap-3"
            >
              <div className={`text-3xl font-bold ${statColorMap[pt.color]}`}>{pt.stat}</div>
              <div className="text-sm font-semibold text-foreground capitalize">{pt.label}</div>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">{pt.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Who this helps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-white mb-3">Who This Is Designed to Help</h3>
            <p className="text-zinc-400 max-w-2xl mx-auto text-sm leading-relaxed">
              The greatest diagnostic delays in PCOS are concentrated in populations with the least access to specialist
              care. Each design choice in HerOva is intended to reduce — not eliminate — one of these barriers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {populations.map((pop, i) => {
              const c = colorMap[pop.color]
              return (
                <motion.div
                  key={pop.group}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  className={`rounded-2xl border ${c.border} bg-zinc-950/60 p-5 flex flex-col gap-3`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>
                      <pop.icon className={`w-4 h-4 ${c.text}`} />
                    </div>
                    <h4 className="font-semibold text-white text-sm leading-snug mt-1">{pop.group}</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <p className="text-zinc-500">
                      <span className="font-medium text-zinc-400">Barrier: </span>
                      {pop.barrier}
                    </p>
                    <p className="text-zinc-400 leading-relaxed">
                      <span className="font-medium text-zinc-300">How HerOva can help: </span>
                      {pop.value}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Honest scope note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-5 rounded-2xl border border-zinc-700/60 bg-zinc-900/40 text-xs text-zinc-400 max-w-3xl mx-auto text-center leading-relaxed"
        >
          <span className="font-semibold text-zinc-200">Prototype-level scope. </span>
          HerOva is a research and demonstration platform. The population-level impact claims above describe the
          intended design direction, not measured outcomes. Prospective clinical validation, regulatory review, and
          outcome studies would be required before deployment as a clinical decision tool at scale.
        </motion.div>
      </div>
    </section>
  )
}
