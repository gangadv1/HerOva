"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

interface FeatureImportanceItem {
  feature: string
  value: number
  impact: "high" | "moderate" | "low"
  direction: "increase" | "neutral" | "decrease"
  threshold?: string
}

interface FeatureImportanceProps {
  features?: FeatureImportanceItem[]
  humanReasoning?: string[]
  suggestedInvestigations?: string[]
}

export function FeatureImportance({
  features = [
    {
      feature: "Cycle Length (>35 days)",
      value: 0.85,
      impact: "high",
      direction: "increase",
      threshold: "Oligomenorrhea",
    },
    {
      feature: "Follicle Count (≥12/ovary)",
      value: 0.75,
      impact: "high",
      direction: "increase",
      threshold: "Polycystic morphology",
    },
    {
      feature: "LH:FSH Ratio (>2)",
      value: 0.70,
      impact: "high",
      direction: "increase",
      threshold: "Endocrine dysfunction",
    },
    {
      feature: "Total Testosterone (>50 ng/dL)",
      value: 0.65,
      impact: "high",
      direction: "increase",
      threshold: "Hyperandrogenism",
    },
    {
      feature: "HOMA-IR (>2.5)",
      value: 0.60,
      impact: "moderate",
      direction: "increase",
      threshold: "Insulin resistance",
    },
    {
      feature: "Ovarian Volume (>10 mL)",
      value: 0.60,
      impact: "moderate",
      direction: "increase",
      threshold: "Enlarged ovaries",
    },
    {
      feature: "AMH Level (>6 ng/mL)",
      value: 0.55,
      impact: "moderate",
      direction: "increase",
      threshold: "Elevated ovarian reserve",
    },
    {
      feature: "Hirsutism Score (>8)",
      value: 0.50,
      impact: "moderate",
      direction: "increase",
      threshold: "Clinical hyperandrogenism",
    },
  ],
  humanReasoning = [],
  suggestedInvestigations = [],
}: FeatureImportanceProps) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-pink-500/20 text-pink-300 border-pink-500/30"
      case "moderate":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "low":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case "increase":
        return "↑"
      case "decrease":
        return "↓"
      default:
        return "→"
    }
  }

  return (
    <Card className="glass border-teal-500/30 p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-teal-400" />
          <h3 className="text-xl font-bold text-foreground">AI Reasoning Summary</h3>
        </div>
        <p className="text-sm text-muted-foreground">Human-readable summary of top model drivers</p>
      </div>

      <div className="space-y-2.5">
        {humanReasoning.length > 0 ? (
          humanReasoning.map((line, idx) => (
            <div key={idx} className="bg-slate-900/30 border border-slate-700/40 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-teal-400">{idx + 1}.</span>
                <span className="text-sm text-foreground">{line}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">No human-readable reasoning available.</div>
        )}
      </div>

      <div className="mt-6 p-4 bg-background/60 border border-border/30 rounded-lg">
        <h4 className="text-sm font-semibold text-foreground mb-2">Recommended follow-up</h4>
        {suggestedInvestigations.length > 0 ? (
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {suggestedInvestigations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No specific follow-up suggested.</p>
        )}
      </div>
    </Card>
  )
}
