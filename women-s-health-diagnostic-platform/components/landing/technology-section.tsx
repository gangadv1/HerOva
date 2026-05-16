"use client"

import { motion } from "framer-motion"
import { Brain, Cpu, BarChart3, Network, Layers, Zap } from "lucide-react"

const technologies = [
  { icon: Brain, label: "Neural Networks", color: "purple" },
  { icon: BarChart3, label: "SHAP Analysis", color: "cyan" },
  { icon: Network, label: "Graph Models", color: "pink" },
  { icon: Layers, label: "Deep Learning", color: "purple" },
  { icon: Cpu, label: "ML Pipeline", color: "cyan" },
  { icon: Zap, label: "Real-time Inference", color: "pink" },
]

export function TechnologySection() {
  return (
    <section id="technology" className="py-32 relative overflow-hidden">
      {/* Background mesh gradient */}
      <div className="absolute inset-0 bg-mesh opacity-30" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-cyan-300 border border-cyan-500/30 mb-6">
              <Cpu className="w-4 h-4" />
              Technology Stack
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-foreground">Cutting-Edge </span>
              <span className="text-gradient-teal-pink">AI Technology</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Our platform leverages state-of-the-art machine learning techniques to provide accurate, explainable, and clinically relevant diagnostic insights.
            </p>

            <div className="space-y-4">
              {[
                { title: "Explainable Predictions", desc: "SHAP-style feature contributions show exactly which factors influence diagnostic outcomes" },
                { title: "Multi-Modal Analysis", desc: "Combines clinical, hormonal, metabolic, and genomic data for comprehensive assessment" },
                { title: "Phenotype Classification", desc: "Identifies distinct disease subtypes for personalized treatment recommendations" },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 mt-2.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Tech visualization */}
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Central brain icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="w-64 h-64 rounded-full border border-purple-500/20"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute w-48 h-48 rounded-full border border-cyan-500/20"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute w-32 h-32 rounded-full border border-pink-500/20"
                />
                <div className="absolute w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center">
                  <Brain className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Orbiting tech icons */}
              {technologies.map((tech, index) => {
                const angle = (index / technologies.length) * 2 * Math.PI
                const radius = 140
                const x = Math.cos(angle) * radius
                const y = Math.sin(angle) * radius

                return (
                  <motion.div
                    key={tech.label}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    }}
                  >
                    <div className={`glass p-3 rounded-xl border ${
                      tech.color === "purple" ? "border-purple-500/30" :
                      tech.color === "cyan" ? "border-cyan-500/30" :
                      "border-pink-500/30"
                    }`}>
                      <tech.icon className={`w-6 h-6 ${
                        tech.color === "purple" ? "text-purple-400" :
                        tech.color === "cyan" ? "text-cyan-400" :
                        "text-pink-400"
                      }`} />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
