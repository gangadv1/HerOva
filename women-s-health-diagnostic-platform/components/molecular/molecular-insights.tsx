"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Logo from "@/components/branding/logo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  ArrowLeft,
  Dna,
  FlaskConical,
  Network,
  Zap,
  Activity,
  TrendingUp
} from "lucide-react"

const pathways = [
  {
    id: "inflammation",
    name: "Chronic Low-Grade Inflammation",
    color: "pink",
    description: "Elevated inflammatory markers contribute to insulin resistance and ovarian dysfunction",
    genes: ["IL-6", "TNF-α", "CRP", "NF-κB"],
    relevance: "Inflammation amplifies metabolic dysfunction and may contribute to long-term cardiovascular risk in PCOS patients.",
    activity: 75
  },
  {
    id: "insulin",
    name: "Insulin Signaling Pathway",
    color: "cyan",
    description: "Dysregulated insulin signaling leads to hyperinsulinemia and compensatory androgen production",
    genes: ["INSR", "IRS-1", "PI3K", "AKT"],
    relevance: "Insulin resistance is present in 50-70% of PCOS patients, independent of obesity. It drives ovarian androgen excess.",
    activity: 82
  },
  {
    id: "androgen",
    name: "Hyperandrogenism Pathway",
    color: "purple",
    description: "Excessive androgen production from ovarian theca cells and adrenal glands",
    genes: ["CYP17A1", "CYP11A1", "StAR", "3β-HSD"],
    relevance: "Elevated androgens cause clinical symptoms (hirsutism, acne) and disrupt follicular development.",
    activity: 68
  },
  {
    id: "ovarian",
    name: "Ovarian Dysfunction",
    color: "pink",
    description: "Impaired folliculogenesis leading to anovulation and polycystic morphology",
    genes: ["AMH", "FSHR", "LHCGR", "BMP15"],
    relevance: "Follicular arrest prevents dominant follicle selection, causing accumulation of small antral follicles.",
    activity: 71
  }
]

const cellTypes = [
  { name: "Granulosa Cells", count: 2847, color: "purple", description: "Estrogen-producing cells surrounding oocytes" },
  { name: "Theca Cells", count: 1523, color: "pink", description: "Androgen-producing cells in ovarian stroma" },
  { name: "Stromal Cells", count: 3241, color: "cyan", description: "Supportive cells in ovarian architecture" },
  { name: "Immune Cells", count: 892, color: "yellow", description: "Inflammatory mediators in ovarian tissue" },
  { name: "Endothelial Cells", count: 1156, color: "green", description: "Blood vessel lining cells" },
]

function seededNoise(seed: number) {
  const value = Math.sin(seed) * 10000
  return value - Math.floor(value)
}

export function MolecularInsights() {
  const [selectedPathway, setSelectedPathway] = useState(pathways[0])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 glass sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/analysis" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Analysis
          </Link>
          <Link href="/" className="flex items-center gap-3">
            <Logo size="sm" />
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-purple-300 border border-purple-500/30 mb-6">
            <Dna className="w-4 h-4" />
            Single-Cell Analysis
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">Molecular </span>
            <span className="text-gradient-purple-teal">Insights</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Single-cell RNA sequencing data reveals cellular heterogeneity and dysregulated pathways in PCOS ovarian tissue
          </p>
        </motion.div>

        {/* UMAP Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="glass border-purple-500/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Network className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">UMAP Cell Clustering</h3>
                <p className="text-sm text-muted-foreground">Dimensionality reduction of ovarian single-cell transcriptomes</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* UMAP Plot */}
              <div className="lg:col-span-2 aspect-square bg-muted/20 rounded-xl p-4 relative overflow-hidden">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  {/* Generate cluster points */}
                  {cellTypes.map((cellType, typeIndex) => {
                    const centerX = 100 + (typeIndex % 3) * 100 + seededNoise(typeIndex + 1) * 50
                    const centerY = 100 + Math.floor(typeIndex / 2) * 120 + seededNoise(typeIndex + 11) * 50
                    
                    return Array.from({ length: 40 }).map((_, i) => {
                      const angle = seededNoise(typeIndex * 100 + i + 1) * Math.PI * 2
                      const radius = seededNoise(typeIndex * 100 + i + 51) * 50
                      const x = centerX + Math.cos(angle) * radius
                      const y = centerY + Math.sin(angle) * radius
                      
                      const colors = {
                        purple: "rgb(168, 85, 247)",
                        pink: "rgb(236, 72, 153)",
                        cyan: "rgb(34, 211, 238)",
                        yellow: "rgb(234, 179, 8)",
                        green: "rgb(34, 197, 94)"
                      }
                      
                      return (
                        <circle
                          key={`${typeIndex}-${i}`}
                          cx={x}
                          cy={y}
                          r={2}
                          fill={colors[cellType.color as keyof typeof colors]}
                          opacity={0.7}
                        />
                      )
                    })
                  })}
                </svg>

                {/* Axis labels */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                  UMAP 1
                </div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground">
                  UMAP 2
                </div>
              </div>

              {/* Cell Type Legend */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground mb-4">Cell Types Identified</h4>
                {cellTypes.map((cellType) => {
                  const colors = {
                    purple: "bg-purple-500",
                    pink: "bg-pink-500",
                    cyan: "bg-cyan-500",
                    yellow: "bg-yellow-500",
                    green: "bg-green-500"
                  }
                  
                  return (
                    <div key={cellType.name} className="glass rounded-lg p-3 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${colors[cellType.color as keyof typeof colors]}`} />
                          <span className="text-sm font-medium text-foreground">{cellType.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{cellType.count.toLocaleString()} cells</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{cellType.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Pathway Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="glass border-cyan-500/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Dysregulated Pathways</h3>
                <p className="text-sm text-muted-foreground">Key molecular pathways implicated in PCOS pathophysiology</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pathway Selection */}
              <div className="space-y-3">
                {pathways.map((pathway) => (
                  <button
                    key={pathway.id}
                    onClick={() => setSelectedPathway(pathway)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedPathway.id === pathway.id
                        ? pathway.color === "pink" 
                          ? "bg-pink-500/20 border-pink-500/50"
                          : pathway.color === "cyan"
                          ? "bg-cyan-500/20 border-cyan-500/50"
                          : "bg-purple-500/20 border-purple-500/50"
                        : "bg-muted/20 border-border hover:border-purple-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{pathway.name}</span>
                      <div className="flex items-center gap-2">
                        <Activity className={`w-4 h-4 ${
                          pathway.color === "pink" ? "text-pink-400" :
                          pathway.color === "cyan" ? "text-cyan-400" :
                          "text-purple-400"
                        }`} />
                        <span className={`text-sm font-mono ${
                          pathway.color === "pink" ? "text-pink-400" :
                          pathway.color === "cyan" ? "text-cyan-400" :
                          "text-purple-400"
                        }`}>
                          {pathway.activity}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{pathway.description}</p>
                  </button>
                ))}
              </div>

              {/* Pathway Details */}
              <div className="glass rounded-xl p-6 border border-purple-500/20">
                <h4 className="text-lg font-bold text-foreground mb-4">{selectedPathway.name}</h4>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Pathway Activity</span>
                    <span className={`font-mono ${
                      selectedPathway.color === "pink" ? "text-pink-400" :
                      selectedPathway.color === "cyan" ? "text-cyan-400" :
                      "text-purple-400"
                    }`}>
                      {selectedPathway.activity}%
                    </span>
                  </div>
                  <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedPathway.activity}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full rounded-full ${
                        selectedPathway.color === "pink" 
                          ? "bg-gradient-to-r from-pink-500 to-pink-400"
                          : selectedPathway.color === "cyan"
                          ? "bg-gradient-to-r from-cyan-500 to-cyan-400"
                          : "bg-gradient-to-r from-purple-500 to-purple-400"
                      }`}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className="text-sm font-semibold text-foreground mb-3">Key Genes</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedPathway.genes.map((gene) => (
                      <span
                        key={gene}
                        className={`px-3 py-1 rounded-full text-xs font-mono ${
                          selectedPathway.color === "pink" 
                            ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                            : selectedPathway.color === "cyan"
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        }`}
                      >
                        {gene}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-lg p-4 border border-cyan-500/20">
                  <h5 className="text-sm font-semibold text-cyan-300 mb-2">Clinical Relevance</h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedPathway.relevance}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Scientific Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass border-pink-500/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Scientific Summary</h3>
                <p className="text-sm text-muted-foreground">Integrated molecular findings</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass rounded-xl p-4 border border-purple-500/20">
                <TrendingUp className="w-8 h-8 text-purple-400 mb-3" />
                <h4 className="font-bold text-foreground mb-2">Theca Cell Hyperactivity</h4>
                <p className="text-sm text-muted-foreground">
                  Single-cell analysis reveals upregulated steroidogenic genes in theca cells, explaining elevated androgen production.
                </p>
              </div>

              <div className="glass rounded-xl p-4 border border-cyan-500/20">
                <Activity className="w-8 h-8 text-cyan-400 mb-3" />
                <h4 className="font-bold text-foreground mb-2">Granulosa Dysfunction</h4>
                <p className="text-sm text-muted-foreground">
                  Altered FSH receptor signaling in granulosa cells contributes to impaired follicle maturation and anovulation.
                </p>
              </div>

              <div className="glass rounded-xl p-4 border border-pink-500/20">
                <Zap className="w-8 h-8 text-pink-400 mb-3" />
                <h4 className="font-bold text-foreground mb-2">Immune Infiltration</h4>
                <p className="text-sm text-muted-foreground">
                  Increased immune cell presence suggests chronic inflammation may play a role in PCOS pathogenesis.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/analysis">
            <Button
              variant="outline"
              className="border-purple-500/50 text-foreground hover:bg-purple-500/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Analysis
            </Button>
          </Link>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0">
              Return Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
