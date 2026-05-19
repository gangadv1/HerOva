"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Diagnosis {
  condition: string
  probability: number
  description: string
  icon: string
}

interface DifferentialDiagnosisProps {
  diagnoses?: Diagnosis[]
  primaryDiagnosis?: string
}

export function DifferentialDiagnosis({
  diagnoses = [
    {
      condition: "PCOS (Polycystic Ovary Syndrome)",
      probability: 78,
      description: "Hyperandrogenism, ovulatory dysfunction, polycystic ovaries",
      icon: "🫘",
    },
    {
      condition: "Endometriosis",
      probability: 14,
      description: "Ectopic endometrial tissue causing pelvic pain and infertility",
      icon: "⚕️",
    },
    {
      condition: "Healthy Ovarian Function",
      probability: 8,
      description: "No significant endocrine or structural abnormalities detected",
      icon: "✓",
    },
  ],
  primaryDiagnosis = "PCOS",
}: DifferentialDiagnosisProps) {
  // Sort by probability descending
  const sortedDiagnoses = [...diagnoses].sort((a, b) => b.probability - a.probability)

  return (
    <Card className="glass border-pink-500/30 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground mb-1">Differential Diagnosis Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Comparative diagnostic reasoning across key reproductive endocrine conditions
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {sortedDiagnoses.map((diag, idx) => {
          const isPrimary = diag.condition.includes(primaryDiagnosis)
          return (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-lg flex-shrink-0">{diag.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-foreground truncate">
                      {diag.condition}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {diag.description}
                    </p>
                  </div>
                </div>
                {isPrimary && (
                  <Badge className="bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
                    Primary
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isPrimary
                        ? "bg-gradient-to-r from-pink-500 to-pink-400"
                        : "bg-gradient-to-r from-slate-500 to-slate-400"
                    }`}
                    style={{ width: `${diag.probability}%` }}
                  />
                </div>
                <span className={`text-sm font-bold flex-shrink-0 w-12 text-right ${
                  isPrimary ? "text-pink-400" : "text-slate-400"
                }`}>
                  {diag.probability}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-slate-900/40 border border-pink-500/30 rounded-lg p-4 text-xs text-foreground space-y-2">
        <div className="font-semibold text-pink-400">Clinical Interpretation:</div>
        <p className="text-muted-foreground">
          The patient presents with a <strong className="text-foreground">78% probability of PCOS</strong> based on clinical and biochemical
          evidence including irregular menstrual cycles, elevated androgen markers, and ultrasound findings consistent
          with polycystic ovarian morphology. Differential diagnosis includes endometriosis (14%) given potential pelvic
          pain symptoms, though ovarian morphology is more consistent with PCOS.
        </p>
        <p className="text-pink-300 font-medium">
          ⚕️ Recommendation: Proceed with PCOS-specific management strategy while monitoring for overlapping conditions.
        </p>
      </div>
    </Card>
  )
}
