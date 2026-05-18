import React, { Suspense } from "react"
import { PatientAnalysis } from "@/components/analysis/patient-analysis"

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading analysis…</div>}>
      <PatientAnalysis />
    </Suspense>
  )
}
