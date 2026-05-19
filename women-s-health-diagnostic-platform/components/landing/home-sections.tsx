"use client"

import { motion } from "framer-motion"
import { Building2, Stethoscope, Wifi, Tablet, Globe, ShieldCheck } from "lucide-react"

const deploymentContexts = [
  {
    icon: Stethoscope,
    title: "Primary Care Clinics",
    description:
      "GPs and family physicians can run a first-pass PCOS screening using only cycle history, symptoms, and BMI — no specialist access or lab results required.",
    color: "purple",
    badge: "Core workflow",
  },
  {
    icon: Building2,
    title: "Specialist & Endocrinology",
    description:
      "Endocrinologists and gynaecologists can enter the full 6-step dataset including lab panels, ultrasound findings, and hormone biomarkers for phenotype-level precision.",
    color: "cyan",
    badge: "Full feature set",
  },
  {
    icon: Tablet,
    title: "Telehealth & Remote Consult",
    description:
      "A telehealth mode adjusts the interface for remote consultations. Patients can complete the symptom and cycle sections before a video appointment.",
    color: "pink",
    badge: "Telehealth mode",
  },
  {
    icon: Globe,
    title: "Community Health Camps",
    description:
      "Field workers can upload a patient list as a CSV file. The batch screening workflow scores hundreds of patients simultaneously and surfaces a prioritised referral queue.",
    color: "green",
    badge: "Batch screening",
  },
  {
    icon: Wifi,
    title: "Low-Resource & Offline Settings",
    description:
      "The full risk engine runs client-side in the browser. No internet connection or cloud backend is required for single-patient analysis — results work offline.",
    color: "amber",
    badge: "Offline-capable",
  },
  {
    icon: ShieldCheck,
    title: "Research & Training",
    description:
      "Educators and trainees can explore how Rotterdam criteria, phenotype classification, and SHAP explainability interact — using the molecular pathway module for deeper learning.",
    color: "teal",
    badge: "Educational",
  },
]

const colorMap: Record<string, string> = {
  purple: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  pink: "border-pink-500/30 bg-pink-500/10 text-pink-300",
  green: "border-green-500/30 bg-green-500/10 text-green-300",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  teal: "border-teal-500/30 bg-teal-500/10 text-teal-300",
}

const iconColorMap: Record<string, string> = {
  purple: "text-purple-400",
  cyan: "text-cyan-400",
  pink: "text-pink-400",
  green: "text-green-400",
  amber: "text-amber-400",
  teal: "text-teal-400",
}

export default function HomeSections() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <span className="inline-block px-4 py-1.5 rounded-full border border-purple-500/30 text-purple-300 text-sm mb-6">
          Designed for Real-World Clinical Settings
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Feasible Across the{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Care Continuum
          </span>
        </h2>
        <p className="text-zinc-400 text-lg leading-relaxed">
          HerOva is built to work in the environments where PCOS is most likely to be missed — not just fully-equipped
          hospital labs. From a GP consultation to a community health camp with no laboratory access, the platform adapts
          to what data is available.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deploymentContexts.map((ctx, i) => (
          <motion.div
            key={ctx.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 flex flex-col gap-4 hover:border-zinc-600 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[ctx.color].split(" ").slice(1).join(" ")}`}>
                <ctx.icon className={`w-5 h-5 ${iconColorMap[ctx.color]}`} />
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${colorMap[ctx.color]}`}>
                {ctx.badge}
              </span>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">{ctx.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{ctx.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Data requirements summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-14 rounded-2xl border border-zinc-700/60 bg-zinc-900/40 p-8"
      >
        <h3 className="text-white font-bold text-xl mb-6 text-center">What Data Does HerOva Need?</h3>
        <div className="grid sm:grid-cols-3 gap-6 text-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              Required (Steps 1–3)
            </div>
            <ul className="text-zinc-400 space-y-1.5 pl-4">
              <li>Age, weight, height (BMI auto-calculated)</li>
              <li>Menstrual cycle length and regularity</li>
              <li>Clinical symptoms: acne, hirsutism, hair loss</li>
            </ul>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
              Optional — improves accuracy
            </div>
            <ul className="text-zinc-400 space-y-1.5 pl-4">
              <li>Fasting glucose, insulin, HOMA-IR</li>
              <li>Waist circumference, blood pressure</li>
              <li>Pelvic ultrasound findings</li>
            </ul>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
              Optional — enables full phenotyping
            </div>
            <ul className="text-zinc-400 space-y-1.5 pl-4">
              <li>LH, FSH, LH:FSH ratio</li>
              <li>Testosterone, DHEA-S, AMH</li>
              <li>TSH and prolactin (exclusion markers)</li>
            </ul>
          </div>
        </div>
        <p className="text-zinc-500 text-xs text-center mt-6">
          The system will generate a risk assessment from whatever data is provided. Confidence metrics adjust
          automatically to reflect data completeness.
        </p>
      </motion.div>
    </section>
  )
}
