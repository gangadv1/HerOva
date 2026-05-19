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
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 mb-1">Differential Diagnosis Analysis</h3>
        <p className="text-sm text-slate-600">
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
                    <div className="font-semibold text-sm text-slate-900 truncate">
                      {diag.condition}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                      {diag.description}
                    </p>
                  </div>
                </div>
                {isPrimary && (
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 flex-shrink-0">
                    Primary
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isPrimary
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                        : "bg-gradient-to-r from-slate-400 to-slate-300"
                    }`}
                    style={{ width: `${diag.probability}%` }}
                  />
                </div>
                <span className={`text-sm font-bold flex-shrink-0 w-12 text-right ${
                  isPrimary ? "text-emerald-700" : "text-slate-600"
                }`}>
                  {diag.probability}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white border border-indigo-100 rounded-lg p-4 text-xs text-slate-700 space-y-2">
        <div className="font-semibold text-indigo-900">Clinical Interpretation:</div>
        <p>
          The patient presents with a <strong>78% probability of PCOS</strong> based on clinical and biochemical
          evidence including irregular menstrual cycles, elevated androgen markers, and ultrasound findings consistent
          with polycystic ovarian morphology. Differential diagnosis includes endometriosis (14%) given potential pelvic
          pain symptoms, though ovarian morphology is more consistent with PCOS.
        </p>
        <p className="text-indigo-700 font-medium">
          ⚕️ Recommendation: Proceed with PCOS-specific management strategy while monitoring for overlapping conditions.
        </p>
      </div>
    </Card>
  )
}
