"use client"

import { motion } from "framer-motion"
import { Database, FileSpreadsheet, Dna, FlaskConical } from "lucide-react"

const datasets = [
  {
    icon: FileSpreadsheet,
    title: "Main PCOS Dataset",
    description: "PCOS physical and clinical parameters - REQUIRED as the foundation of your project to ensure a common basis for comparison across teams.",
    type: "Required",
    color: "purple",
    items: ["Physical parameters", "Clinical markers", "Hormonal data", "Metabolic indicators"]
  },
  {
    icon: FlaskConical,
    title: "Endometriosis Dataset",
    description: "Supplementary dataset containing endometriosis features and symptoms to explore related conditions.",
    type: "Supplementary",
    color: "cyan",
    items: ["Symptom profiles", "Feature correlations", "Diagnostic markers", "Patient outcomes"]
  },
  {
    icon: Dna,
    title: "Single-Cell Datasets",
    description: "PCOS-related and endometrium-related single-cell datasets to support the biological rationale behind your proposed solution.",
    type: "Advanced",
    color: "pink",
    items: ["RNA sequencing", "Cell type annotations", "Gene expression", "Pathway analysis"]
  }
]

export function DatasetSection() {
  return (
    <section id="datasets" className="py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-purple-300 border border-purple-500/30 mb-6">
            <Database className="w-4 h-4" />
            Available Datasets
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-foreground">Powered by </span>
            <span className="text-gradient-purple-pink">Real Data</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Multiple datasets to support your analysis, from clinical parameters to cutting-edge single-cell genomics.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {datasets.map((dataset, index) => (
            <motion.div
              key={dataset.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={`glass rounded-3xl p-8 border transition-all hover:scale-[1.02] relative overflow-hidden ${
                dataset.color === "purple" ? "border-purple-500/30 hover:border-purple-500/50" :
                dataset.color === "cyan" ? "border-cyan-500/30 hover:border-cyan-500/50" :
                "border-pink-500/30 hover:border-pink-500/50"
              }`}
            >
              {/* Glow effect */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl ${
                dataset.color === "purple" ? "bg-purple-500/20" :
                dataset.color === "cyan" ? "bg-cyan-500/20" :
                "bg-pink-500/20"
              }`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    dataset.color === "purple" ? "bg-gradient-to-br from-purple-500 to-pink-500" :
                    dataset.color === "cyan" ? "bg-gradient-to-br from-cyan-500 to-teal-500" :
                    "bg-gradient-to-br from-pink-500 to-rose-500"
                  }`}>
                    <dataset.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    dataset.type === "Required" ? "bg-purple-500/20 text-purple-300" :
                    dataset.type === "Supplementary" ? "bg-cyan-500/20 text-cyan-300" :
                    "bg-pink-500/20 text-pink-300"
                  }`}>
                    {dataset.type}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-3">{dataset.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">{dataset.description}</p>

                <div className="space-y-2">
                  {dataset.items.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        dataset.color === "purple" ? "bg-purple-400" :
                        dataset.color === "cyan" ? "bg-cyan-400" :
                        "bg-pink-400"
                      }`} />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground">
            The main dataset forms the core of your project, while additional datasets may be used to supplement, compare, or expand the solution.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
