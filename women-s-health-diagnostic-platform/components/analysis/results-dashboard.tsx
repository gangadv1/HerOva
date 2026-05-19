"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Logo from "@/components/branding/logo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, TrendingUp, TrendingDown, Brain, Activity, Dna, FileText, Loader as Loader2, Save, Users, Zap } from "lucide-react"
import type { PatientData } from "./patient-analysis"
import { healthApi, type FullAnalysisResult } from "@/lib/api"
import { RotterdamCriteria } from "./rotterdam-criteria"
import { DifferentialDiagnosis } from "./differential-diagnosis"
import { FeatureImportance } from "./feature-importance"
import { BiologicalInsights } from "./biological-insights"

interface ResultsDashboardProps {
  patientData: PatientData
  onBack: () => void
}

export function ResultsDashboard({ patientData, onBack }: ResultsDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<FullAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        setLoading(true)
        const result = await healthApi.analyze(patientData)
        setAnalysis(result)

        const session = await healthApi.session.create(patientData)
        if (session.session?.id) {
          setSessionId(session.session.id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed")
      } finally {
        setLoading(false)
      }
    }
    runAnalysis()
  }, [patientData])

  const handleSaveResults = async () => {
    if (!sessionId || !analysis) return
    setSaving(true)
    try {
      await healthApi.session.saveResult(sessionId, {
        pcos_risk_score: analysis.prediction.pcosRiskScore,
        phenotype: analysis.phenotype.type,
        phenotype_name: analysis.phenotype.name,
        phenotype_description: analysis.phenotype.description,
        risk_level: analysis.prediction.riskLevel,
        contributing_factors: analysis.prediction.contributingFactors,
        shap_values: analysis.shap.values,
        cluster_assignment: analysis.clustering.assignedCluster,
        confidence_metrics: analysis.confidenceMetrics,
        recommendations: analysis.recommendations,
      })
    } catch {
      // Silently handle save errors
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Running AI Analysis</h2>
          <p className="text-muted-foreground">Processing clinical data through ML pipeline...</p>
          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2"><Activity className="w-4 h-4 text-pink-400" /> Calculating PCOS risk score...</p>
            <p className="flex items-center justify-center gap-2"><Brain className="w-4 h-4 text-purple-400" /> Generating SHAP explanations...</p>
            <p className="flex items-center justify-center gap-2"><Dna className="w-4 h-4 text-cyan-400" /> Performing phenotype clustering...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Analysis Error</h2>
          <p className="text-muted-foreground mb-6">{error || "Unknown error occurred"}</p>
          <Button onClick={onBack} variant="outline">Back to Analysis</Button>
        </div>
      </div>
    )
  }

  const prediction = analysis.prediction
  const phenotype = analysis.phenotype
  const shap = analysis.shap ?? { values: [], topContributors: [] }
  const clustering = analysis.clustering ?? {
    assignedCluster: {
      id: 0,
      name: analysis.phenotypeDisplay?.displayName ?? phenotype.name,
      description: analysis.phenotype.description,
      characteristics: analysis.phenotypeDisplay?.characteristics ?? [],
      riskProfile: prediction.riskLevel,
      metabolicRisk: prediction.riskLevel,
    },
    allClusters: [],
  }
  const confidenceMetrics = analysis.confidenceMetrics
  const recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : []

  const getRiskColor = (level: string) => {
    if (level === "high") return "pink"
    if (level === "moderate") return "yellow"
    return "green"
  }

  const riskColor = getRiskColor(prediction.riskLevel)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 glass sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Analysis
          </button>
          <div className="flex items-center gap-3">
            {sessionId && (
              <Badge variant="outline" className="border-cyan-500/30 text-cyan-300 text-xs">
                Session: {sessionId.slice(0, 8)}
              </Badge>
            )}
            <Link href="/" className="flex items-center gap-3">
              <Logo size="sm" />
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">AI Diagnostic </span>
            <span className="text-gradient-purple-pink">Results</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive analysis powered by ML prediction, SHAP explainability, and phenotype clustering
          </p>
        </motion.div>

        {/* Main Results Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* PCOS Risk Score */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass border-purple-500/30 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">PCOS Risk Score</h3>
                  <p className="text-sm text-muted-foreground">ML-powered Rotterdam assessment</p>
                </div>
              </div>
              <div className="relative mb-6">
                <div className="text-6xl font-bold text-center mb-2">
                  <span className={riskColor === "pink" ? "text-pink-400" : riskColor === "yellow" ? "text-yellow-400" : "text-green-400"}>
                    {prediction.pcosRiskScore}
                  </span>
                  <span className="text-2xl text-muted-foreground">%</span>
                </div>
                <Progress value={prediction.pcosRiskScore} className="h-3" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Low Risk</span>
                  <span>High Risk</span>
                </div>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                riskColor === "pink" ? "bg-pink-500/20 text-pink-300" : riskColor === "yellow" ? "bg-yellow-500/20 text-yellow-300" : "bg-green-500/20 text-green-300"
              }`}>
                {riskColor === "pink" ? <AlertTriangle className="w-4 h-4" /> : riskColor === "yellow" ? <TrendingUp className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                {prediction.riskLevel.charAt(0).toUpperCase() + prediction.riskLevel.slice(1)} Probability
              </div>
            </Card>
          </motion.div>

          {/* Phenotype Classification */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass border-cyan-500/30 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                  <Dna className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Phenotype Classification</h3>
                  <p className="text-sm text-muted-foreground">Clustering-based subtype</p>
                </div>
              </div>
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 mb-3">
                  <span className="text-3xl font-bold text-cyan-300">{phenotype.type}</span>
                </div>
                <h4 className="text-xl font-bold text-foreground">{phenotype.name}</h4>
              </div>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">{phenotype.description}</p>
            </Card>
          </motion.div>

          {/* Confidence Metrics */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass border-pink-500/30 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">AI Confidence</h3>
                  <p className="text-sm text-muted-foreground">Model certainty metrics</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">PCOS Classification</span>
                    <span className="text-pink-300">{confidenceMetrics.pcosClassification}%</span>
                  </div>
                  <Progress value={confidenceMetrics.pcosClassification} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Phenotype Match</span>
                    <span className="text-cyan-300">{confidenceMetrics.phenotypeMatch}%</span>
                  </div>
                  <Progress value={confidenceMetrics.phenotypeMatch} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Data Quality</span>
                    <span className="text-purple-300">{confidenceMetrics.dataQuality}%</span>
                  </div>
                  <Progress value={confidenceMetrics.dataQuality} className="h-2" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* CLINICAL FOUNDATION: Rotterdam Criteria */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-8">
          <RotterdamCriteria
            hyperandrogenism={analysis.Rotterdam.hyperandrogenism}
            ovulatoryDysfunction={analysis.Rotterdam.ovulatoryDysfunction}
            polycysticOvaries={analysis.Rotterdam.polycysticOvaries}
          />
        </motion.div>

        {/* DIFFERENTIAL DIAGNOSIS: Competing Conditions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
          <DifferentialDiagnosis />
        </motion.div>

        {/* SHAP FEATURE IMPORTANCE: Explainability */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-8">
          <FeatureImportance />
        </motion.div>

        {/* BIOLOGICAL INSIGHTS: Phenotype & Molecular Pathways */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-8">
          <BiologicalInsights
            phenotype={phenotype.type}
            subtypeLabel={
              prediction.riskLevel === "high"
                ? "Insulin-Resistant Metabolic Phenotype"
                : prediction.riskLevel === "moderate"
                  ? "Mixed Metabolic Phenotype"
                  : "Lean PCOS Phenotype"
            }
          />
        </motion.div>

        {/* Cluster Assignment */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mb-8">
          <Card className="glass border-cyan-500/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Phenotype Cluster Assignment</h3>
                  <p className="text-sm text-muted-foreground">Patient assigned to {clustering.assignedCluster?.name ?? "Unassigned"}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <h4 className="font-semibold text-foreground mb-2">{clustering.assignedCluster?.name ?? "Unassigned"}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{clustering.assignedCluster?.description ?? "No cluster information available from the current analysis response."}</p>
                  <div className="flex flex-wrap gap-2">
                    {(clustering.assignedCluster?.characteristics ?? []).map((c) => (
                      <Badge key={c} variant="outline" className="border-cyan-500/30 text-cyan-300 text-xs">{c}</Badge>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/20 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Metabolic Risk</span>
                    <Badge className={(clustering.assignedCluster?.metabolicRisk ?? prediction.riskLevel) === "high" ? "bg-pink-500/20 text-pink-300" : (clustering.assignedCluster?.metabolicRisk ?? prediction.riskLevel) === "moderate" ? "bg-yellow-500/20 text-yellow-300" : "bg-green-500/20 text-green-300"}>
                      {(clustering.assignedCluster?.metabolicRisk ?? prediction.riskLevel).toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-foreground mb-3">All Phenotype Clusters</h5>
                {clustering.allClusters.length > 0 ? clustering.allClusters.map((cluster) => (
                  <div key={cluster.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    cluster.id === (clustering.assignedCluster?.id ?? -1) ? "bg-cyan-500/10 border-cyan-500/40" : "bg-muted/10 border-border/50"
                  }`}>
                    <span className="text-sm text-foreground">{cluster.name}</span>
                    <Badge variant="outline" className={`text-xs ${
                      cluster.metabolicRisk === "high" ? "border-pink-500/30 text-pink-300" : cluster.metabolicRisk === "moderate" ? "border-yellow-500/30 text-yellow-300" : "border-green-500/30 text-green-300"
                    }`}>
                      {cluster.metabolicRisk}
                    </Badge>
                  </div>
                )) : (
                  <div className="p-3 rounded-lg bg-muted/10 border border-border/50 text-sm text-muted-foreground">
                    Cluster details are unavailable in the current response.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* SHAP Feature Importance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
          <Card className="glass border-purple-500/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">SHAP Feature Contribution</h3>
                <p className="text-sm text-muted-foreground">Explainable AI showing which factors drive the diagnosis</p>
              </div>
            </div>
            <div className="space-y-4">
              {shap.values.length > 0 ? shap.values.map((feature, index) => (
                <motion.div key={feature.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + index * 0.05 }} className="flex items-center gap-4">
                  <span className="w-36 text-sm text-muted-foreground shrink-0">{feature.name}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${feature.value * 100}%` }} transition={{ duration: 0.8, delay: 0.5 + index * 0.05 }}
                        className={`h-full rounded-full ${feature.impact === "high" ? "bg-gradient-to-r from-pink-500 to-pink-400" : feature.impact === "moderate" ? "bg-gradient-to-r from-yellow-500 to-yellow-400" : "bg-gradient-to-r from-green-500 to-green-400"}`}
                      />
                    </div>
                    <span className={`text-sm font-mono w-12 ${feature.impact === "high" ? "text-pink-400" : feature.impact === "moderate" ? "text-yellow-400" : "text-green-400"}`}>
                      {(feature.value * 100).toFixed(0)}%
                    </span>
                  </div>
                </motion.div>
              )) : (
                <div className="p-3 rounded-lg bg-muted/10 border border-border/50 text-sm text-muted-foreground">
                  No SHAP feature contributions were returned by the backend.
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Contributing Factors & Recommendations */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="glass border-purple-500/20 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-foreground">Contributing Factors</h3>
              </div>
              <div className="space-y-3">
                {prediction.contributingFactors.length > 0 ? prediction.contributingFactors.map((factor) => (
                  <div key={factor} className="flex items-center gap-3 p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
                    <AlertTriangle className="w-4 h-4 text-pink-400 shrink-0" />
                    <span className="text-sm text-foreground">{factor}</span>
                  </div>
                )) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    <span className="text-sm text-foreground">No significant risk factors identified</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card className="glass border-cyan-500/20 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-foreground">Clinical Recommendations</h3>
              </div>
              <div className="space-y-3">
                {recommendations.length > 0 ? recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs text-cyan-300">{index + 1}</span>
                    </div>
                    <span className="text-sm text-foreground">{rec}</span>
                  </div>
                )) : (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">No additional recommendations returned.</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Disclaimer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Disclaimer:</strong> This AI-powered analysis is for research and educational purposes only.
            It should not be used as a substitute for professional medical advice, diagnosis, or treatment.
            Always consult with a qualified healthcare provider for clinical decisions.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="outline" onClick={onBack} className="border-purple-500/50 text-foreground hover:bg-purple-500/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Modify Analysis
          </Button>
          <Button variant="outline" onClick={handleSaveResults} disabled={saving || !sessionId} className="border-cyan-500/50 text-foreground hover:bg-cyan-500/10">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Results
          </Button>
          <Link href="/molecular">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0">
              View Molecular Insights
              <Dna className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>

      <footer className="mt-12 text-center">
        <span className="text-sm font-semibold text-foreground">HerOva</span>
      </footer>
    </div>
  )
}
