"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Logo from "@/components/branding/logo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, FileSpreadsheet, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Loader as Loader2, Download, Users, Activity, X } from "lucide-react"
import { healthApi, type CSVUploadResult } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export default function CSVUploadPage() {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CSVUploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [savedNotice, setSavedNotice] = useState<string | null>(null)
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
    if (inputRef.current) inputRef.current.value = ""
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
                        <div key={p.rowId} className="flex items-center justify-between p-2 rounded border border-border/30">
                          <div>
                            <div className="text-sm font-medium">#{p.rowId} — Type {p.phenotype}</div>
                            <div className="text-xs text-muted-foreground">Risk: {p.riskScore}%</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">Refer</Button>
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
                        <th className="text-left p-3 text-muted-foreground font-medium">Triggered Columns</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.patients.map((patient) => (
                        <tr key={patient.rowId} className="border-b border-border/50 hover:bg-muted/20">
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

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
