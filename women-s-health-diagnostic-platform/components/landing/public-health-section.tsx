"use client"

import { motion } from "framer-motion"
import { Users, Clock, MapPin, TrendingUp, ChevronRight } from "lucide-react"
import Link from "next/link"

const stats = [
  { value: "8–13%", label: "of women of reproductive age are estimated to have PCOS globally", color: "purple" },
  { value: "2+ yrs", label: "average time to diagnosis in many health systems", color: "pink" },
  { value: "70%", label: "of PCOS cases are estimated to go undiagnosed", color: "amber" },
  { value: "400+", label: "patient profiles used to train and validate the screening model", color: "cyan" },
]

const colorMap: Record<string, { value: string; border: string; bg: string }> = {
  purple: { value: "text-purple-300", border: "border-purple-500/30", bg: "bg-purple-500/10" },
  pink: { value: "text-pink-300", border: "border-pink-500/30", bg: "bg-pink-500/10" },
  amber: { value: "text-amber-300", border: "border-amber-500/30", bg: "bg-amber-500/10" },
  cyan: { value: "text-cyan-300", border: "border-cyan-500/30", bg: "bg-cyan-500/10" },
}

const impactAreas = [
  {
    icon: Clock,
    title: "Reducing Diagnostic Delay",
    body: "By surfacing a structured risk score from routine clinical data, HerOva is designed to help clinicians identify high-probability PCOS cases earlier — before specialist referral wait times add months to the diagnostic pathway.",
  },
  {
    icon: MapPin,
    title: "Reaching Underserved Populations",
    body: "In settings where endocrinology specialists are scarce, a community health worker with a tablet can upload a patient list and identify the highest-risk patients in a catchment area without a specialist present.",
  },
  {
    icon: Users,
    title: "Supporting Clinician Education",
    body: "The explainability features — SHAP rankings, Rotterdam criteria breakdowns, and molecular pathway context — help generalist clinicians and trainees build their understanding of PCOS diagnostic criteria.",
  },
  {
    icon: TrendingUp,
    title: "Enabling Earlier Intervention",
    body: "Earlier identification of high-risk phenotypes — particularly Type A with insulin resistance — can support earlier lifestyle, metabolic, and reproductive intervention, with potential to improve long-term outcomes.",
  },
]

export default function PublicHealthSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-14"
      >
        <span className="inline-block px-4 py-1.5 rounded-full border border-pink-500/30 text-pink-300 text-sm mb-6">
          Public Health Impact
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Closing the{" "}
          <span className="bg-gradient-to-r from-pink-400 to-amber-400 bg-clip-text text-transparent">
            Diagnostic Gap
          </span>
        </h2>
        <p className="text-zinc-400 text-lg leading-relaxed">
          PCOS is one of the most common and most underdiagnosed endocrine conditions worldwide. HerOva is designed to
          help close the gap between the scale of the problem and the availability of diagnostic expertise.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`rounded-2xl border p-6 ${colorMap[stat.color].border} ${colorMap[stat.color].bg}`}
          >
            <div className={`text-4xl font-bold mb-2 ${colorMap[stat.color].value}`}>{stat.value}</div>
            <p className="text-zinc-400 text-sm leading-relaxed">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Impact areas */}
      <div className="grid md:grid-cols-2 gap-6 mb-14">
        {impactAreas.map((area, i) => (
          <motion.div
            key={area.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex gap-4 p-6 rounded-2xl border border-zinc-800 bg-zinc-950/60"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <area.icon className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">{area.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{area.body}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Honest prototype framing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl border border-zinc-700/60 bg-zinc-900/40 p-8 text-center"
      >
        <h3 className="text-white font-bold text-xl mb-4">Prototype-Level — Honest About Where We Are</h3>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl mx-auto mb-6">
          HerOva is a research and demonstration platform. The risk scores and phenotype outputs are designed to support
          clinical reasoning, not replace it. Prospective clinical validation, regulatory review, and outcome studies
          would be required before deployment in a live clinical setting. The current prototype demonstrates the
          feasibility of the workflow and the quality of the decision-support logic.
        </p>
        <Link
          href="/analysis"
          className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors text-sm font-medium"
        >
          Try the single-patient analysis
          <ChevronRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </section>
  )
}
