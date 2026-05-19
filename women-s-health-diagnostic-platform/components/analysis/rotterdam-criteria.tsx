"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { CheckCircle2, AlertCircle } from "lucide-react"

interface RotterdamCriteriaProps {
  hyperandrogenism: boolean
  ovulatoryDysfunction: boolean
  polycysticOvaries: boolean
}

export function RotterdamCriteria({
  hyperandrogenism,
  ovulatoryDysfunction,
  polycysticOvaries,
}: RotterdamCriteriaProps) {
  const criteria = [
    {
      name: "Hyperandrogenism",
      met: hyperandrogenism,
      description: "Clinical (hirsutism, acne, alopecia) or biochemical (elevated testosterone/DHEAS)",
      icon: "⚡",
    },
    {
      name: "Ovulatory Dysfunction",
      met: ovulatoryDysfunction,
      description: "Oligomenorrhea (cycle >35 days) or anovulation; irregular menstrual patterns",
      icon: "🔄",
    },
    {
      name: "Polycystic Ovarian Morphology",
      met: polycysticOvaries,
      description: "Ultrasound: ≥12 follicles (2-9mm) per ovary or ovarian volume >10 mL",
      icon: "🫘",
    },
  ]

  const criteriaMetCount = criteria.filter((c) => c.met).length
  const diagnosed = criteriaMetCount >= 2

  return (
    <Card className="glass border-purple-500/30 p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-foreground mb-1">Rotterdam Criteria Evaluation</h3>
        <p className="text-sm text-muted-foreground">
          PCOS diagnosis: ≥2 of 3 criteria must be met
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {criteria.map((criterion, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
              criterion.met
                ? "bg-emerald-500/15 border-emerald-500/30"
                : "bg-slate-900/30 border-slate-700/30"
            }`}
          >
            <div className="flex-shrink-0 pt-0.5">
              {criterion.met ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground text-sm">{criterion.name}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{criterion.description}</p>
            </div>
            <div className="text-2xl flex-shrink-0">{criterion.icon}</div>
          </div>
        ))}
      </div>

      <div
        className={`p-4 rounded-lg border-2 text-center ${
          diagnosed
            ? "bg-emerald-500/15 border-emerald-500/30"
            : "bg-yellow-500/15 border-yellow-500/30"
        }`}
      >
        <div className="text-sm font-semibold text-muted-foreground mb-1">Clinical Diagnosis</div>
        <div className={`text-2xl font-bold ${
          diagnosed ? "text-emerald-400" : "text-yellow-400"
        }`}>
          {criteriaMetCount} / 3 Criteria Met
        </div>
        <div className={`text-xs mt-2 font-medium ${
          diagnosed ? "text-emerald-300" : "text-yellow-300"
        }`}>
          {diagnosed ? "✓ PCOS Diagnosed (Rotterdam 2012)" : "⚠ Insufficient criteria for diagnosis"}
        </div>
      </div>

      {diagnosed && (
        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-foreground">
          <strong className="text-emerald-400">Clinical Note:</strong> Patient meets Rotterdam diagnostic criteria
          consistent with polycystic ovary syndrome. Further confirmatory testing and individual assessment recommended.
        </div>
      )}
    </Card>
  )
}
