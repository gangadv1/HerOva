"use client"

import React, { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Logo from "@/components/branding/logo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BodyVisualization } from "@/components/analysis/body-visualization"
import { ArrowLeft, Upload, FileSpreadsheet, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Loader as Loader2, Download, Users, Activity, X, Brain, Info, TrendingUp } from "lucide-react"
import { healthApi, type CSVUploadResult, type FullAnalysisResult } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { ResultsDashboard } from "@/components/analysis/results-dashboard"

type SelectedPatient = CSVUploadResult["patients"][number] | null

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value > 0
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    return ["1", "true", "yes", "y", "positive", "present"].includes(normalized)
  }
  return false
}

function buildPathwayInsights(patientData: Record<string, unknown>) {
  return [
    {
      name: "Insulin signaling",
      activity: Math.min(100, 30 + (toNumber(patientData.homaIr) > 2.5 ? 32 : 0) + (toNumber(patientData.fastingGlucose) > 100 ? 8 : 0) + (toNumber(patientData.insulinLevel) > 15 ? 6 : 0)),
      description: "Insulin resistance and downstream signaling disruption",
      icon: "🔋",
    },
    {
      name: "Androgen synthesis",
      activity: Math.min(100, 28 + (toBoolean(patientData.hirsutism) || toBoolean(patientData.acne) ? 28 : 0) + (toNumber(patientData.lhFshRatio) > 2 ? 8 : 0)),
      description: "Steroidogenic activity linked to androgen excess",
      icon: "⚡",
    },
    {
      name: "Ovarian follicle regulation",
      activity: Math.min(100, 30 + (toBoolean(patientData.polycysticAppearance) || toNumber(patientData.follicleCountLeft) >= 12 || toNumber(patientData.follicleCountRight) >= 12 ? 26 : 0) + (toNumber(patientData.amh) > 6 ? 8 : 0) + (toNumber(patientData.cycleLength) > 35 ? 6 : 0)),
      description: "Follicle maturation and ovulatory regulation",
      icon: "🫘",
    },
    {
      name: "Inflammatory signaling",
      activity: Math.min(100, 24 + (toNumber(patientData.homaIr) > 2.5 ? 18 : 0) + (toNumber(patientData.bmi) > 25 ? 8 : 0) + (toBoolean(patientData.skinDarkening) ? 6 : 0)),
      description: "Low-grade inflammatory activity that can amplify endocrine dysfunction",
      icon: "🔥",
    },
  ].sort((left, right) => right.activity - left.activity)
}

function buildBiologicalSummary(patientData: Record<string, unknown>, analysis: FullAnalysisResult) {
  const dominantPathway = buildPathwayInsights(patientData)[0]
  const phenotypeName = analysis.phenotype?.name || "Unknown phenotype"
  return `The leading biological signal is ${dominantPathway.name.toLowerCase()} at ${dominantPathway.activity}%, with phenotype assignment of ${phenotypeName}.`
}

class ErrorBoundary extends React.Component<any, { hasError: boolean; error: any }>{
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }

  componentDidCatch(error: any, info: any) {
    // Log to console for diagnostics
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-2">An error occurred rendering the patient details</h3>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{String(this.state.error)}</pre>
          <div className="mt-4">
            <button
              className="px-3 py-2 bg-red-500 text-white rounded"
              onClick={() => location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function buildBatchDifferentialDiagnosis(analysis: FullAnalysisResult) {
  const riskScore = analysis.prediction?.pcosRiskScore ?? 0
  return [
    { condition: "PCOS", probability: riskScore, description: "Batch-generated single-patient diagnostic profile", icon: "🫘" },
    { condition: "Metabolic dysfunction", probability: Math.min(100, Math.max(15, 30 + (analysis.prediction?.riskLevel === "high" ? 25 : 0))), description: "Insulin and metabolic features in the current analysis", icon: "🔋" },
    { condition: "Non-PCOS / alternative explanation", probability: Math.max(5, 100 - riskScore * 0.8), description: "Residual probability for non-PCOS interpretation", icon: "✓" },
  ].sort((left, right) => right.probability - left.probability)
}

export default function CSVUploadPage() {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CSVUploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [savedNotice, setSavedNotice] = useState<string | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<FullAnalysisResult | null>(null)
  const [selectedAnalysisLoading, setSelectedAnalysisLoading] = useState(false)
  const [analysisByRow, setAnalysisByRow] = useState<Record<number, FullAnalysisResult>>({})
  const [referredRows, setReferredRows] = useState<Set<number>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0]
      if (dropped.name.endsWith(".csv")) {
        setFile(dropped)
        setError(null)
      } else {
        setError("Please upload a CSV file")
      }
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setSavedNotice(null)
    setSessionId(null)
    try {
      const res = await healthApi.csvUpload(file)
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setError(null)
    setSavedNotice(null)
    setSessionId(null)
    setSaving(false)
    setSelectedPatient(null)
    setSelectedAnalysis(null)
    setSelectedAnalysisLoading(false)
    setAnalysisByRow({})
    setReferredRows(new Set())
    if (inputRef.current) inputRef.current.value = ""
  }

  const openPatientDetails = (patient: SelectedPatient) => {
    setSelectedPatient(patient)
    setSelectedAnalysis(patient ? analysisByRow[patient.rowId] ?? null : null)
  }

  const closePatientDetails = () => {
    setSelectedPatient(null)
    setSelectedAnalysis(null)
    setSelectedAnalysisLoading(false)
  }

  const persistReferralState = async (rowIds: number[]) => {
    if (!sessionId || !result) return

    try {
      await healthApi.session.saveResult(sessionId, {
        batch_summary: result.summary,
        batch_patients: result.patients,
        file_name: file?.name || "batch-upload.csv",
        source: "batch-upload",
        referral_row_ids: rowIds,
        referral_patients: result.patients.filter((item) => rowIds.includes(item.rowId)),
      })
    } catch {
      // Keep the UI responsive if persistence fails.
    }
  }

  const generateSinglePatientAnalysis = async (patientOverride?: SelectedPatient) => {
    const targetPatient = patientOverride ?? selectedPatient
    if (!targetPatient || selectedAnalysisLoading) return

    setSelectedAnalysisLoading(true)
    try {
      const analysis = await healthApi.analyze(targetPatient.patientData)
      setAnalysisByRow((current) => ({ ...current, [targetPatient.rowId]: analysis }))
      setSelectedAnalysis(analysis)
      toast({
        title: "Single Patient Analysis generated",
        description: `Analysis complete for row #${targetPatient.rowId}.`,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate analysis"
      setError(message)
      toast({
        title: "Analysis generation failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setSelectedAnalysisLoading(false)
    }
  }

  const handleReferPatient = async (patient: SelectedPatient) => {
    if (!patient) return

    setSelectedPatient(patient)
    setSelectedAnalysis(analysisByRow[patient.rowId] ?? null)

    if (!analysisByRow[patient.rowId]) {
      await generateSinglePatientAnalysis(patient)
    }

    setReferredRows((current) => {
      const next = new Set(current)
      next.add(patient.rowId)
      return next
    })

    const nextReferralRows = Array.from(new Set([...referredRows, patient.rowId]))

    // Ensure there's a session to persist referral state. If not, create one locally (or via API).
    if (!sessionId && result) {
      try {
        const session = await healthApi.session.create(
          {
            source: "batch-upload",
            fileName: file?.name || "batch-upload.csv",
            totalRows: result.summary.totalRows,
            processedPatients: result.summary.processedPatients,
            pcosPositive: result.summary.pcosPositive,
          },
          result
        )

        const savedSessionId = session.session?.id
        if (savedSessionId) setSessionId(savedSessionId)
      } catch {
        // ignore; persistence is optional for UI referral behavior
      }
    }

    await persistReferralState(nextReferralRows)

    toast({
      title: "Referral queued",
      description: `Patient #${patient.rowId} has been marked for referral review.`,
    })
  }

  const handleSaveBatch = async () => {
    if (!result || saving) return

    setSaving(true)
    setError(null)

    try {
      const session = await healthApi.session.create(
        {
          source: "batch-upload",
          fileName: file?.name || "batch-upload.csv",
          totalRows: result.summary.totalRows,
          processedPatients: result.summary.processedPatients,
          pcosPositive: result.summary.pcosPositive,
        },
        result
      )

      const savedSessionId = session.session?.id
      if (savedSessionId) {
        setSessionId(savedSessionId)
        await healthApi.session.saveResult(savedSessionId, {
          batch_summary: result.summary,
          batch_patients: result.patients,
          file_name: file?.name || "batch-upload.csv",
          source: "batch-upload",
          referral_row_ids: Array.from(referredRows),
          referral_patients: result.patients.filter((item) => referredRows.has(item.rowId)),
        })
        setSavedNotice(`Saved batch upload as session ${savedSessionId.slice(0, 8)}.`)
        toast({
          title: "Batch results saved",
          description: `Session ${savedSessionId.slice(0, 8)} now appears in Sessions.`,
        })
      } else {
        setSavedNotice("Saved batch upload.")
        toast({
          title: "Batch results saved",
          description: "Your batch upload was saved successfully.",
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save batch results"
      setError(message)
      toast({
        title: "Batch save failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const sampleCSV = `Age,Weight,Height,BMI,Cycle_Length,Irregular_Periods,Acne,Hirsutism,Total_Testosterone,LH,FSH,AMH,HOMA_IR,Follicle_Count_Left,Follicle_Count_Right,Polycystic
28,65,165,23.9,35,true,false,false,45,10,6,4.5,2.8,10,12,false
32,80,160,31.3,45,true,true,true,65,14,5,8.2,4.1,18,22,true
24,55,170,19.0,28,false,false,false,30,6,5,3.0,1.5,6,7,false
35,90,158,36.0,60,true,true,true,72,16,4,9.5,5.2,20,24,true
22,58,168,20.5,30,false,false,false,35,7,5,3.2,1.8,8,9,false`

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-mesh opacity-30 pointer-events-none" />

      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="hover:bg-primary/20">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Logo size="sm" />
                  <span>Population Screening Dashboard</span>
                </h1>
                <p className="text-sm text-muted-foreground">Upload population or clinic data to identify high-risk patients, phenotype distributions, and referral priorities.</p>
              </div>
            </div>
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
              <FileSpreadsheet className="h-3 w-3 mr-1" />
              Population Screening
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              {/* Upload Area */}
              <Card className="glass border-purple-500/20 p-8 mb-6">
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                    dragActive
                      ? "border-cyan-400 bg-cyan-500/10"
                      : file
                      ? "border-green-400/50 bg-green-500/5"
                      : "border-border hover:border-purple-500/50"
                  }`}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {file ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-500/30 flex items-center justify-center mx-auto">
                        <FileSpreadsheet className="w-8 h-8 text-green-400" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReset()
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mx-auto">
                        <Upload className="w-8 h-8 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-foreground">
                          Drop your CSV file here
                        </p>
                        <p className="text-sm text-muted-foreground">
                          or click to browse. Supports .csv files with patient data
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex justify-center"
                  >
                    <Button
                      onClick={handleUpload}
                      disabled={loading}
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Activity className="w-5 h-5 mr-2" />
                          Analyze Patients
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </Card>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20 mb-6 flex items-center gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-pink-400 shrink-0" />
                  <p className="text-sm text-foreground">{error}</p>
                </motion.div>
              )}

              {/* Sample CSV */}
              <Card className="glass border-cyan-500/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Download className="w-4 h-4 text-cyan-400" />
                    Sample CSV Format
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                    onClick={() => {
                      const blob = new Blob([sampleCSV], { type: "text/csv" })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = "sample_patients.csv"
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                  >
                    Download Sample
                  </Button>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs text-muted-foreground whitespace-pre">
                    {sampleCSV.split("\n").slice(0, 3).join("\n")}
                    {"\n..."}
                  </pre>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Supported columns: Age, Weight, Height, BMI, Cycle_Length, Irregular_Periods, Acne, Hirsutism, Total_Testosterone, LH, FSH, AMH, HOMA_IR, Follicle_Count_Left, Follicle_Count_Right, Polycystic
                </p>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <Card className="glass border-border/50 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Rows</p>
                  <p className="text-2xl font-bold text-foreground">{result.summary.totalRows}</p>
                </Card>
                <Card className="glass border-cyan-500/20 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">PCOS Positive</p>
                  <p className="text-2xl font-bold text-cyan-300">{result.summary.pcosPositive}</p>
                </Card>
                <Card className="glass border-pink-500/20 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">High Risk</p>
                  <p className="text-2xl font-bold text-pink-400">{result.summary.highRisk}</p>
                </Card>
                <Card className="glass border-yellow-500/20 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Moderate Risk</p>
                  <p className="text-2xl font-bold text-yellow-400">{result.summary.moderateRisk}</p>
                </Card>
                <Card className="glass border-green-500/20 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Low Risk</p>
                  <p className="text-2xl font-bold text-green-400">{result.summary.lowRisk}</p>
                </Card>
              </div>

              {/* Phenotype Distribution */}
              <Card className="glass border-cyan-500/20 p-6 mb-8">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Phenotype Distribution
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(result.summary.phenotypeDistribution).map(([type, count]) => {
                    const labels: Record<string, string> = {
                      A: "Classic PCOS",
                      B: "Non-PCO PCOS",
                      C: "Ovulatory PCOS",
                      D: "Normo-androgenic",
                      NA: "Non-PCOS",
                    }
                    const colors: Record<string, string> = {
                      A: "border-pink-500/40 bg-pink-500/10 text-pink-300",
                      B: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
                      C: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
                      D: "border-green-500/40 bg-green-500/10 text-green-300",
                      NA: "border-border bg-muted/20 text-muted-foreground",
                    }
                    return (
                      <div
                        key={type}
                        className={`p-4 rounded-xl border text-center ${colors[type] || colors.NA}`}
                      >
                        <p className="text-3xl font-bold">{count as number}</p>
                        <p className="text-xs mt-1">Type {type}</p>
                        <p className="text-xs opacity-70">{labels[type]}</p>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Risk Heatmap + Referral Queue */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                <Card className="glass border-pink-500/20 p-6 lg:col-span-2">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-pink-400" />
                    Risk Heatmap
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">Visual overview of individual risk scores (sample of up to 200 patients)</p>
                  <div className="grid grid-cols-20 gap-1">
                    {result.patients.slice(0, 200).map((p, idx) => {
                      const color = p.riskLevel === "high" ? "bg-pink-400" : p.riskLevel === "moderate" ? "bg-yellow-400" : "bg-green-400"
                      return (
                        <div key={idx} title={`Row ${p.rowId}: ${p.riskScore}% (${p.riskLevel})`} className={`w-3 h-3 rounded ${color}`} />
                      )
                    })}
                  </div>
                </Card>

                <Card className="glass border-yellow-500/20 p-6">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-yellow-400" />
                    Referral Priority Queue
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">Top high-risk patients for immediate follow-up</p>
                  <div className="space-y-2">
                    {result.patients
                      .filter((p) => p.riskLevel === "high")
                      .sort((a, b) => b.riskScore - a.riskScore)
                      .slice(0, 10)
                      .map((p) => (
                        <div key={p.rowId} className="flex items-center justify-between gap-3 p-2 rounded border border-border/30 bg-muted/10">
                          <div>
                            <div className="text-sm font-medium">#{p.rowId} — Type {p.phenotype}</div>
                            <div className="text-xs text-muted-foreground">Risk: {p.riskScore}%</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {referredRows.has(p.rowId) ? (
                              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30" variant="outline">
                                Referred
                              </Badge>
                            ) : null}
                            <Button size="sm" variant="outline" onClick={() => handleReferPatient(p)} className="border-yellow-500/30 text-yellow-200 hover:bg-yellow-500/10">
                              Review & Refer
                            </Button>
                          </div>
                        </div>
                      ))}
                    {result.patients.filter((p) => p.riskLevel === "high").length === 0 && (
                      <div className="text-sm text-muted-foreground">No high-risk patients identified.</div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Patient Results Table */}
              <Card className="glass border-purple-500/20 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    Patient Results
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="border-purple-500/30 text-foreground hover:bg-purple-500/10"
                  >
                    Upload New File
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-muted-foreground font-medium">Row</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Risk Score</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Risk Level</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Phenotype</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Key Factors</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Analysis</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Triggered Columns</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.patients.map((patient) => {
                        const patientAnalysis = analysisByRow[patient.rowId]
                        return (
                        <tr
                          key={patient.rowId}
                          onClick={() => openPatientDetails(patient)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault()
                              openPatientDetails(patient)
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          className="border-b border-border/50 hover:bg-muted/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        >
                          <td className="p-3 text-foreground">#{patient.rowId}</td>
                          <td className="p-3">
                            <span className={`font-mono font-bold ${
                              patient.riskScore >= 70 ? "text-pink-400" :
                              patient.riskScore >= 40 ? "text-yellow-400" : "text-green-400"
                            }`}>
                              {patient.riskScore}%
                            </span>
                          </td>
                          <td className="p-3">
                            <Badge className={`text-xs ${
                              patient.riskLevel === "high" ? "bg-pink-500/20 text-pink-300" :
                              patient.riskLevel === "moderate" ? "bg-yellow-500/20 text-yellow-300" :
                              "bg-green-500/20 text-green-300"
                            }`}>
                              {patient.riskLevel}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="border-cyan-500/30 text-cyan-300 text-xs">
                              Type {patient.phenotype} - {patient.phenotypeName}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {patient.factors.slice(0, 2).map((f) => (
                                <span key={f} className="text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded">
                                  {f}
                                </span>
                              ))}
                              {patient.factors.length > 2 && (
                                <span className="text-xs text-muted-foreground">+{patient.factors.length - 2}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge className={patientAnalysis ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-slate-500/20 text-slate-300 border-slate-500/30"} variant="outline">
                              {patientAnalysis ? "Analysis Complete" : "Analysis Not Generated"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {patient.triggeredColumns.slice(0, 2).map((column) => (
                                <span key={column} className="text-xs text-cyan-200 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                                  {column}
                                </span>
                              ))}
                              {patient.triggeredColumns.length > 2 && (
                                <span className="text-xs text-muted-foreground">+{patient.triggeredColumns.length - 2}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </Card>

              <AnimatePresence>
                {selectedPatient && (
                  <motion.div
                    key={`patient-modal-${selectedPatient.rowId}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 py-6"
                    onClick={closePatientDetails}
                  >
                    <motion.div
                      initial={{ scale: 0.98, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.98, y: 20 }}
                      transition={{ duration: 0.2 }}
                      className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border/60 bg-background shadow-2xl"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {/* Error boundary to catch render errors inside the modal */}
                      <ErrorBoundary>
                      {/* Render full ResultsDashboard to mirror single-patient analysis layout */}
                      <div>
                        <ResultsDashboard patientData={selectedPatient.patientData as any} onBack={closePatientDetails} />
                      </div>
                      </ErrorBoundary>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Disclaimer */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border mb-6">
                <p className="text-xs text-muted-foreground text-center">
                  <strong>Disclaimer:</strong> Batch analysis results are for research purposes only. Individual clinical evaluation is required for diagnosis.
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <Link href="/analysis">
                  <Button variant="outline" className="border-purple-500/50 text-foreground hover:bg-purple-500/10">
                    Single Patient Analysis
                  </Button>
                </Link>
                <Button
                  onClick={handleSaveBatch}
                  disabled={saving}
                  variant="outline"
                  className="border-cyan-500/50 text-foreground hover:bg-cyan-500/10"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Batch Results"
                  )}
                </Button>
                <Button onClick={handleReset} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0">
                  Upload Another File
                </Button>
              </div>
              {savedNotice && (
                <div className="mt-4 text-center text-sm text-cyan-300">
                  {savedNotice}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
