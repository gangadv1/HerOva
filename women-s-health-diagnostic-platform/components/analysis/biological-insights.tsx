"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Pathway {
  name: string
  activity: number
  genes: string[]
  description: string
  icon: string
  color: string
}

interface BiologicalInsightsProps {
  phenotype?: string
  pathways?: Pathway[]
  subtypeLabel?: string
}

export function BiologicalInsights({
  phenotype = "Type A",
  pathways = [
    {
      name: "Chronic Low-Grade Inflammation",
      activity: 75,
      genes: ["IL-6", "TNF-α", "CRP", "NF-κB"],
      description: "Elevated systemic inflammation; key link to insulin resistance and metabolic dysfunction",
      icon: "🔥",
      color: "bg-red-100 border-red-300",
    },
    {
      name: "Insulin Signaling Pathway",
      activity: 82,
      genes: ["INSR", "IRS-1", "PI3K", "AKT"],
      description:
        "Impaired insulin receptor signaling; present in 50-70% of PCOS cases; drives metabolic phenotype",
      icon: "🔋",
      color: "bg-amber-100 border-amber-300",
    },
    {
      name: "Androgen Synthesis Pathway",
      activity: 68,
      genes: ["CYP17A1", "CYP11A1", "StAR", "3β-HSD"],
      description:
        "Excessive ovarian/adrenal androgen production; explains hirsutism, acne, and alopecia manifestations",
      icon: "⚡",
      color: "bg-yellow-100 border-yellow-300",
    },
    {
      name: "Ovarian Dysfunction & Follicle Development",
      activity: 71,
      genes: ["AMH", "FSHR", "LHCGR", "BMP15"],
      description:
        "Arrested follicle maturation, anovulation, and polycystic ovarian morphology; reproductive consequences",
      icon: "🫘",
      color: "bg-purple-100 border-purple-300",
    },
  ],
  subtypeLabel = "Insulin-Resistant Metabolic Phenotype",
}: BiologicalInsightsProps) {
  const sortedPathways = [...pathways].sort((a, b) => b.activity - a.activity)

  return (
    <div className="space-y-6">
      {/* Phenotype & Subtype Card */}
      <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900 mb-3">Phenotype Classification & Subtype</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white border border-indigo-200 rounded-lg p-4">
            <div className="text-xs text-slate-600 font-semibold mb-1">PRIMARY PHENOTYPE</div>
            <div className="text-2xl font-bold text-indigo-700 mb-2">{phenotype}</div>
            <div className="text-sm text-slate-700">
              {phenotype === "Type A"
                ? "Classic Hyperandrogenic PCOS with polycystic ovaries and ovulatory dysfunction"
                : phenotype === "Type B"
                  ? "Non-PCO PCOS with hyperandrogenism and ovulatory dysfunction"
                  : phenotype === "Type C"
                    ? "Non-hyperandrogenic PCOS with polycystic ovaries"
                    : "Normo-androgenic PCOS with polycystic ovaries"}
            </div>
          </div>

          <div className="bg-white border border-blue-200 rounded-lg p-4">
            <div className="text-xs text-slate-600 font-semibold mb-1">METABOLIC SUBTYPE</div>
            <div className="text-lg font-bold text-blue-700 mb-2">{subtypeLabel}</div>
            <div className="text-sm text-slate-700">
              {subtypeLabel.includes("Insulin-Resistant")
                ? "Elevated HOMA-IR, metabolic syndrome features, increased cardiometabolic risk"
                : "Normal insulin sensitivity, lower metabolic dysfunction, lean body composition"}
            </div>
          </div>
        </div>

        {/* Characteristics */}
        <div className="bg-indigo-100 border border-indigo-200 rounded-lg p-4">
          <div className="font-semibold text-indigo-900 text-sm mb-2">Distinguishing Characteristics:</div>
          <div className="flex flex-wrap gap-2">
            {["Elevated AMH", "Irregular ovulation", "Polycystic ovaries", "Inflammatory profile", "Metabolic dysregulation"].map(
              (char, idx) => (
                <Badge
                  key={idx}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  • {char}
                </Badge>
              )
            )}
          </div>
        </div>
      </Card>

      {/* Molecular Pathways Card */}
      <Card className="bg-gradient-to-br from-slate-50 to-cyan-50 border-slate-200 p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-1">Molecular Pathways & Biological Mechanisms</h3>
          <p className="text-sm text-slate-600">
            Key dysregulated pathways contributing to PCOS phenotype and manifestations
          </p>
        </div>

        <div className="space-y-4">
          {sortedPathways.map((pathway, idx) => (
            <div key={idx} className={`border-2 rounded-lg p-4 ${pathway.color}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{pathway.icon}</span>
                  <div>
                    <div className="font-bold text-slate-900">{pathway.name}</div>
                    <p className="text-sm text-slate-700 mt-1">{pathway.description}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-slate-600 font-semibold mb-1">Activity</div>
                  <div className="text-2xl font-bold text-slate-900">{pathway.activity}%</div>
                </div>
              </div>

              {/* Activity bar */}
              <div className="mt-3 h-2 bg-slate-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-400"
                  style={{ width: `${pathway.activity}%` }}
                />
              </div>

              {/* Key genes */}
              <div className="mt-3 flex flex-wrap gap-2">
                {pathway.genes.map((gene, gIdx) => (
                  <Badge key={gIdx} variant="outline" className="text-xs bg-white">
                    {gene}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
          <div className="text-xs text-slate-700 space-y-2">
            <strong className="text-cyan-900 block">🧬 Biological Interpretation:</strong>
            <p>
              The patient demonstrates <strong>coordinated dysregulation across 4 key PCOS pathways</strong>. The
              highest activity in the <strong>insulin signaling pathway (82%)</strong> suggests insulin resistance as a
              central pathogenic mechanism, driving metabolic dysfunction, compensatory androgen excess, and chronic
              inflammation. This integrated view moves beyond single-hormone testing toward systems-level understanding
              of PCOS etiology.
            </p>
          </div>
        </div>
      </Card>

      {/* Cell Type Distribution */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Ovarian Cellular Architecture</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { name: "Granulosa", count: 2847, color: "bg-pink-100", icon: "💜" },
            { name: "Stromal", count: 3241, color: "bg-purple-100", icon: "🟣" },
            { name: "Theca", count: 1523, color: "bg-blue-100", icon: "🔵" },
            { name: "Immune", count: 892, color: "bg-orange-100", icon: "🧡" },
            { name: "Endothelial", count: 1156, color: "bg-red-100", icon: "❤️" },
          ].map((cell, idx) => (
            <div key={idx} className={`${cell.color} border rounded-lg p-3 text-center`}>
              <div className="text-2xl mb-1">{cell.icon}</div>
              <div className="font-semibold text-sm text-slate-900">{cell.name}</div>
              <div className="text-lg font-bold text-slate-700">{cell.count}</div>
              <div className="text-xs text-slate-600">
                {((cell.count / 9759) * 100).toFixed(0)}% of total
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-slate-700">
          <strong className="text-emerald-900">Note:</strong> PCOS is characterized by increased stromal volume and
          inflammatory cell infiltration compared to healthy ovaries, contributing to androgen excess and ovulatory dysfunction.
        </div>
      </Card>
    </div>
  )
}
