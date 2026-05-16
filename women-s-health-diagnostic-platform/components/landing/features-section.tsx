"use client"

import { motion } from "framer-motion"
import { 
  Stethoscope, 
  Target, 
  Microscope, 
  ShieldCheck, 
  Dna, 
  HeartPulse,
  Lightbulb,
  Users
} from "lucide-react"

const features = [
  {
    icon: Stethoscope,
    title: "Clinical AI Diagnostics",
    description: "Help clinicians interpret complex symptoms and reduce missed or incorrect diagnoses, including differentiating PCOS from similar conditions.",
    color: "purple",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Target,
    title: "Phenotype Discovery",
    description: "AI-powered phenotype classification to understand the heterogeneous presentation of PCOS and endometriosis across different patient populations.",
    color: "cyan",
    gradient: "from-cyan-500 to-teal-500"
  },
  {
    icon: Microscope,
    title: "Molecular Validation",
    description: "Single-cell RNA sequencing insights to support the biological rationale behind AI predictions and validate diagnostic markers.",
    color: "pink",
    gradient: "from-pink-500 to-rose-500"
  },
  {
    icon: Lightbulb,
    title: "Explainable AI",
    description: "SHAP-style feature contribution analysis so clinicians understand exactly why the AI makes specific diagnostic predictions.",
    color: "purple",
    gradient: "from-purple-500 to-indigo-500"
  },
  {
    icon: HeartPulse,
    title: "Real-World Practical",
    description: "Designed for real-world healthcare settings using available clinical data, making implementation feasible across different medical environments.",
    color: "cyan",
    gradient: "from-teal-500 to-cyan-500"
  },
  {
    icon: Users,
    title: "Address Disparities",
    description: "Built to address diagnostic disparities across different populations, ensuring equitable access to accurate diagnostics for all women.",
    color: "pink",
    gradient: "from-rose-500 to-pink-500"
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-cyan-300 border border-cyan-500/30 mb-6">
            <ShieldCheck className="w-4 h-4" />
            Solution Features
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-foreground">Building </span>
            <span className="text-gradient-purple-teal">Better Diagnostics</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Develop a feasible system to improve diagnostic accuracy for women&apos;s health conditions with clear impact on patient outcomes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`glass rounded-2xl p-6 border transition-all hover:scale-[1.02] group ${
                feature.color === "purple" ? "border-purple-500/20 hover:border-purple-500/40" :
                feature.color === "cyan" ? "border-cyan-500/20 hover:border-cyan-500/40" :
                "border-pink-500/20 hover:border-pink-500/40"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* DNA Helix decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute -right-20 top-1/2 -translate-y-1/2 hidden xl:block"
        >
          <Dna className="w-40 h-40 text-purple-500/10 animate-float" />
        </motion.div>
      </div>
    </section>
  )
}
