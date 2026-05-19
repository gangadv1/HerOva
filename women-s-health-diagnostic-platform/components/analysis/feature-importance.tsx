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
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-teal-400" />
          <h3 className="text-xl font-bold text-foreground">Feature Importance (SHAP Analysis)</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Top contributing factors ranked by impact on PCOS risk score
        </p>
      </div>

      <div className="space-y-2.5">
        {features.map((feature, idx) => (
          <div key={idx} className="bg-slate-900/40 border border-slate-700/50 rounded-lg p-3 hover:border-teal-500/50 transition-colors">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-teal-400">{idx + 1}.</span>
                  <span className="font-semibold text-foreground text-sm">{feature.feature}</span>
                  <Badge className={`${getImpactColor(feature.impact)} border`} variant="secondary">
                    {feature.impact.charAt(0).toUpperCase() + feature.impact.slice(1)}
                  </Badge>
                </div>
                {feature.threshold && (
                  <p className="text-xs text-muted-foreground ml-7">{feature.threshold}</p>
                )}
              </div>
              <span className="text-lg font-bold text-pink-400 flex-shrink-0">
                {getDirectionIcon(feature.direction)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
                  style={{ width: `${feature.value * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-slate-600 flex-shrink-0 w-8 text-right">
                {(feature.value * 100).toFixed(0)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="text-xs text-slate-700 space-y-1">
          <strong className="text-orange-900 block mb-1">📊 Interpretation:</strong>
          <p>
            The model identifies <strong>cycle length, follicle count, and hormonal ratios</strong> as the strongest
            predictors of PCOS. These correspond directly to Rotterdam diagnostic criteria components, confirming that
            the AI model captures clinically meaningful patterns in women's endocrine health data.
          </p>
        </div>
      </div>
    </Card>
  )
}
