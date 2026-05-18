import { Suspense } from "react"
import { PatientAnalysis } from "@/components/analysis/patient-analysis"

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading analysis...</div>}>
      <PatientAnalysis />
    </Suspense>
  )
}
