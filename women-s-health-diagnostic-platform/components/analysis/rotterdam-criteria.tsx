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
    <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-900 mb-1">Rotterdam Criteria Evaluation</h3>
        <p className="text-sm text-slate-600">
          PCOS diagnosis: ≥2 of 3 criteria must be met
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {criteria.map((criterion, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
              criterion.met
                ? "bg-emerald-50 border-emerald-200"
                : "bg-slate-100 border-slate-200 opacity-70"
            }`}
          >
            <div className="flex-shrink-0 pt-0.5">
              {criterion.met ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 text-sm">{criterion.name}</div>
              <p className="text-xs text-slate-600 mt-0.5">{criterion.description}</p>
            </div>
            <div className="text-2xl flex-shrink-0">{criterion.icon}</div>
          </div>
        ))}
      </div>

      <div
        className={`p-4 rounded-lg border-2 text-center ${
          diagnosed
            ? "bg-emerald-50 border-emerald-300"
            : "bg-amber-50 border-amber-300"
        }`}
      >
        <div className="text-sm font-semibold text-slate-700 mb-1">Clinical Diagnosis</div>
        <div className={`text-2xl font-bold ${
          diagnosed ? "text-emerald-700" : "text-amber-700"
        }`}>
          {criteriaMetCount} / 3 Criteria Met
        </div>
        <div className={`text-xs mt-2 font-medium ${
          diagnosed ? "text-emerald-600" : "text-amber-600"
        }`}>
          {diagnosed ? "✓ PCOS Diagnosed (Rotterdam 2012)" : "⚠ Insufficient criteria for diagnosis"}
        </div>
      </div>

      {diagnosed && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-slate-700">
          <strong className="text-blue-900">Clinical Note:</strong> Patient meets Rotterdam diagnostic criteria
          consistent with polycystic ovary syndrome. Further confirmatory testing and individual assessment recommended.
        </div>
      )}
    </Card>
  )
}
