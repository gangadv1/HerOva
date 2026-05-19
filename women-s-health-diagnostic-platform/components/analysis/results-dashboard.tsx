"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Logo from "@/components/branding/logo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, TrendingUp, TrendingDown, Brain, Activity, Dna, FileText, Loader as Loader2, Save, Users, Zap, Info, Printer, ShieldAlert } from "lucide-react"
import type { PatientData } from "./patient-analysis"
import { healthApi, type FullAnalysisResult, type PredictionResult, type RotterdamEvaluation } from "@/lib/api"
import { InteractiveBodyViewer } from "@/components/body-viewer/interactive-body-viewer"
import { bodyViewerSymptoms, patientSymptomData, buildSymptomsForPatient } from "@/components/body-viewer/pcos-body-viewer-data"

interface ResultsDashboardProps {
  patientData: PatientData
  onBack: () => void
  mode?: "full" | "telehealth"
}

type DifferentialDiagnosisItem = {
  condition: string
  probability: number
  description: string
  icon: string
}

type PathwayActivity = {
  name: string
  activity: number
  genes: string[]
  description: string
  icon: string
}

type CellularComposition = {
  name: string
  percent: number
  icon: string
  description: string
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function roundPercent(value: number) {
  return Math.round(clamp(value, 0, 100))
}

function normalizePercentages<T extends { value: number }>(items: T[]) {
  const total = items.reduce((sum, item) => sum + Math.max(item.value, 0), 0) || 1
  let allocated = 0

  return items.map((item, index) => {
    const percent = index === items.length - 1
      ? Math.max(0, 100 - allocated)
      : roundPercent((Math.max(item.value, 0) / total) * 100)

    allocated += percent
    return { ...item, percent }
  })
}

function buildRotterdamEvaluation(data: PatientData): RotterdamEvaluation {
  const hyperandrogenismMet = data.hirsutism || data.acne || data.hairLoss || data.totalTestosterone > 50 || data.freeTestosterone > 3
  const ovulatoryDysfunctionMet = data.irregularPeriods || data.cycleLength > 35
  const polycysticOvariesMet = data.polycysticAppearance || data.follicleCountLeft >= 12 || data.follicleCountRight >= 12 || data.ovaryVolumeLeft > 10 || data.ovaryVolumeRight > 10

  const criteriaMetCount = [hyperandrogenismMet, ovulatoryDysfunctionMet, polycysticOvariesMet].filter(Boolean).length

  const exclusionNotes = [
    data.tsh > 4 ? "Thyroid abnormality should be excluded before final interpretation." : "TSH does not suggest a thyroid-driven mimic.",
    data.prolactin > 20 ? "Hyperprolactinemia is a potential alternative explanation and should be reviewed." : "Prolactin is not strongly suggestive of an exclusionary mimic.",
  ]

  return {
    hyperandrogenism: {
      met: hyperandrogenismMet,
      reasoning: hyperandrogenismMet
        ? "Clinical or biochemical evidence of androgen excess is present."
        : "No clear hyperandrogenism signal is identified in the current input set.",
      subcriteria: [
        { name: "Hirsutism / acne / hair loss", met: data.hirsutism || data.acne || data.hairLoss, detail: "Clinical androgenic symptoms" },
        { name: "Total testosterone", met: data.totalTestosterone > 50, detail: `Measured at ${data.totalTestosterone} ng/dL` },
        { name: "Free testosterone", met: data.freeTestosterone > 3, detail: `Measured at ${data.freeTestosterone} ng/dL` },
      ],
    },
    ovulatoryDysfunction: {
      met: ovulatoryDysfunctionMet,
      reasoning: ovulatoryDysfunctionMet
        ? "Cycle pattern is consistent with oligo-ovulation or ovulatory dysfunction."
        : "Cycle timing is not strongly suggestive of ovulatory dysfunction.",
      subcriteria: [
        { name: "Cycle length", met: data.cycleLength > 35, detail: `Cycle length is ${data.cycleLength} days` },
        { name: "Irregular periods", met: data.irregularPeriods, detail: data.irregularPeriods ? "Irregular periods reported" : "Periods reported as regular" },
      ],
    },
    polycysticOvaries: {
      met: polycysticOvariesMet,
      reasoning: polycysticOvariesMet
        ? "Ultrasound features are consistent with polycystic ovarian morphology."
        : "Current ultrasound inputs do not clearly meet polycystic ovarian morphology thresholds.",
      subcriteria: [
        { name: "Follicle count", met: data.follicleCountLeft >= 12 || data.follicleCountRight >= 12, detail: `Left ${data.follicleCountLeft}, right ${data.follicleCountRight}` },
        { name: "Ovary volume", met: data.ovaryVolumeLeft > 10 || data.ovaryVolumeRight > 10, detail: `Left ${data.ovaryVolumeLeft} mL, right ${data.ovaryVolumeRight} mL` },
      ],
    },
    criteriaMetCount,
    diagnosisMet: criteriaMetCount >= 2,
    exclusionNotes,
  }
}

function buildPhenotype(data: PatientData) {
  const hasOligo = data.irregularPeriods || data.cycleLength > 35
  const hasHyperandrogenism = data.hirsutism || data.acne || data.totalTestosterone > 50 || data.freeTestosterone > 3
  const hasPcom = data.polycysticAppearance || data.follicleCountLeft >= 12 || data.follicleCountRight >= 12

  if (hasOligo && hasHyperandrogenism && hasPcom) {
    return {
      type: "A",
      name: "Classic PCOS",
      description: "All three Rotterdam criteria are present.",
      clinicalReasoning: "This is the most complete Rotterdam phenotype and often carries the strongest metabolic signal.",
    }
  }

  if (hasOligo && hasHyperandrogenism) {
    return {
      type: "B",
      name: "Non-PCO Hyperandrogenic PCOS",
      description: "Ovulatory dysfunction and androgen excess without clear polycystic morphology.",
      clinicalReasoning: "The phenotype is driven by cycle dysfunction and hyperandrogenism rather than ultrasound morphology.",
    }
  }

  if (hasHyperandrogenism && hasPcom) {
    return {
      type: "C",
      name: "Ovulatory PCOS",
      description: "Androgen excess with polycystic morphology and relatively preserved cycling.",
      clinicalReasoning: "This pattern often presents with skin or biochemical androgen features while cycles remain closer to normal.",
    }
  }

  if (hasOligo && hasPcom) {
    return {
      type: "D",
      name: "Non-hyperandrogenic PCOS",
      description: "Cycle irregularity and polycystic morphology without overt androgen excess.",
      clinicalReasoning: "This phenotype is typically less androgenic and may show a milder reproductive profile.",
    }
  }

  return {
    type: "N/A",
    name: "Uncertain / Non-PCOS pattern",
    description: "The current inputs do not cleanly satisfy a Rotterdam phenotype.",
    clinicalReasoning: "This pattern should be interpreted alongside exclusionary diagnoses and repeat clinical assessment.",
  }
}

function buildPredictionFallback(data: PatientData): PredictionResult {
  const rotterdamEvaluation = buildRotterdamEvaluation(data)
  const phenotype = buildPhenotype(data)
  let score = 0
  const factors: string[] = []

  if (rotterdamEvaluation.ovulatoryDysfunction.met) {
    score += 30
    factors.push("Oligomenorrhea / irregular cycles")
  }
  if (rotterdamEvaluation.hyperandrogenism.met) {
    score += 25
    factors.push("Clinical or biochemical hyperandrogenism")
  }
  if (rotterdamEvaluation.polycysticOvaries.met) {
    score += 25
    factors.push("Polycystic ovarian morphology")
  }
  if (data.lhFshRatio > 2) {
    score += 10
    factors.push("Elevated LH:FSH ratio")
  }
  if (data.amh > 6) {
    score += 10
    factors.push("Elevated AMH")
  }
  if (data.homaIr > 2.5) {
    score += 10
    factors.push("Insulin resistance")
  }
  if (data.skinDarkening) {
    score += 5
    factors.push("Acanthosis nigricans")
  }

  const pcosRiskScore = Math.min(score, 100)
  const riskLevel = pcosRiskScore >= 70 ? "high" : pcosRiskScore >= 40 ? "moderate" : "low"
  const confidenceMetrics = {
    pcosClassification: Math.min(87 + (pcosRiskScore > 50 ? 8 : 0), 98),
    phenotypeMatch: Math.min(85 + (phenotype.type !== "N/A" ? 7 : 0), 96),
    dataQuality: 95,
  }

  const recommendations = pcosRiskScore >= 40
    ? [
        "Consider endocrine follow-up for hormonal correlation",
        "Review metabolic markers and insulin resistance",
        "Correlate ultrasound, cycle pattern, and androgen status",
      ]
    : [
        "Continue routine monitoring",
        "Maintain healthy lifestyle measures",
        "Reassess if cycle or androgen symptoms evolve",
      ]

  return {
    success: true,
    pcosRiskScore,
    riskLevel,
    phenotype,
    rotterdamEvaluation,
    contributingFactors: factors,
    confidenceMetrics,
    recommendations,
    timestamp: new Date().toISOString(),
  }
}

function buildShapValues(data: PatientData) {
  return [
    { name: "Cycle Length", value: data.cycleLength > 35 ? 0.85 : 0.3, impact: data.cycleLength > 35 ? "high" : "low", direction: data.cycleLength > 35 ? "increases" : "neutral", explanation: data.cycleLength > 35 ? "Prolonged cycles indicate ovulatory dysfunction" : "Normal cycle length reduces PCOS likelihood" },
    { name: "Follicle Count", value: (data.follicleCountLeft + data.follicleCountRight) / 2 >= 12 ? 0.75 : 0.25, impact: (data.follicleCountLeft + data.follicleCountRight) / 2 >= 12 ? "high" : "low", direction: (data.follicleCountLeft + data.follicleCountRight) / 2 >= 12 ? "increases" : "neutral", explanation: (data.follicleCountLeft + data.follicleCountRight) / 2 >= 12 ? "High follicle count indicates polycystic morphology" : "Follicle count is not strongly supportive of PCOM" },
    { name: "LH:FSH Ratio", value: data.lhFshRatio > 2 ? 0.7 : 0.2, impact: data.lhFshRatio > 2 ? "high" : "low", direction: data.lhFshRatio > 2 ? "increases" : "neutral", explanation: data.lhFshRatio > 2 ? "Elevated ratio suggests pituitary-ovarian dysregulation" : "Ratio is not strongly abnormal" },
    { name: "Total Testosterone", value: data.totalTestosterone > 50 ? 0.65 : 0.2, impact: data.totalTestosterone > 50 ? "high" : "low", direction: data.totalTestosterone > 50 ? "increases" : "neutral", explanation: data.totalTestosterone > 50 ? "Biochemical hyperandrogenism" : "Total testosterone remains below the elevated threshold" },
    { name: "HOMA-IR", value: data.homaIr > 2.5 ? 0.6 : 0.15, impact: data.homaIr > 2.5 ? "moderate" : "low", direction: data.homaIr > 2.5 ? "increases" : "neutral", explanation: data.homaIr > 2.5 ? "Insulin resistance amplifies endocrine dysfunction" : "Insulin sensitivity is relatively preserved" },
    { name: "AMH Level", value: data.amh > 6 ? 0.55 : 0.2, impact: data.amh > 6 ? "moderate" : "low", direction: data.amh > 6 ? "increases" : "neutral", explanation: data.amh > 6 ? "Elevated AMH reflects a larger follicle pool" : "AMH is not markedly elevated" },
    { name: "Hirsutism Score", value: data.hirsutism ? 0.5 : 0.1, impact: data.hirsutism ? "moderate" : "low", direction: data.hirsutism ? "increases" : "neutral", explanation: data.hirsutism ? "Clinical hyperandrogenism" : "No hirsutism signal is reported" },
    { name: "BMI", value: data.bmi > 25 ? 0.4 : 0.15, impact: data.bmi > 25 ? "moderate" : "low", direction: data.bmi > 25 ? "increases" : "neutral", explanation: data.bmi > 25 ? "Higher BMI can amplify insulin resistance" : "BMI is not a dominant risk driver" },
    { name: "Ovary Volume", value: data.ovaryVolumeLeft > 10 || data.ovaryVolumeRight > 10 ? 0.6 : 0.15, impact: data.ovaryVolumeLeft > 10 || data.ovaryVolumeRight > 10 ? "high" : "low", direction: data.ovaryVolumeLeft > 10 || data.ovaryVolumeRight > 10 ? "increases" : "neutral", explanation: data.ovaryVolumeLeft > 10 || data.ovaryVolumeRight > 10 ? "Enlarged ovary volume supports PCOM" : "Ovarian size remains below the PCOM threshold" },
    { name: "Skin Darkening", value: data.skinDarkening ? 0.35 : 0.05, impact: data.skinDarkening ? "moderate" : "low", direction: data.skinDarkening ? "increases" : "neutral", explanation: data.skinDarkening ? "Acanthosis nigricans indicates insulin resistance" : "No skin marker of insulin resistance is reported" },
  ].sort((a, b) => b.value - a.value)
}

function buildClusterSnapshot(data: PatientData) {
  const hasOligo = data.irregularPeriods || data.cycleLength > 35
  const hasHa = data.hirsutism || data.acne || data.totalTestosterone > 50
  const hasPcom = data.polycysticAppearance || data.follicleCountLeft >= 12 || data.follicleCountRight >= 12
  const hasIr = data.homaIr > 2.5
  const hasObesity = data.bmi > 25

  const clusters = [
    { id: 0, name: "Classic Metabolic PCOS", description: "Full Rotterdam phenotype with substantial metabolic dysfunction.", characteristics: ["Irregular cycles", "Hyperandrogenism", "Polycystic ovaries", "Insulin resistance"], riskProfile: "Highest metabolic and cardiovascular risk", metabolicRisk: "high", matches: hasOligo && hasHa && hasPcom && hasIr },
    { id: 1, name: "Reproductive PCOS", description: "Predominantly reproductive pattern with lower metabolic burden.", characteristics: ["Irregular cycles", "Hyperandrogenism", "Polycystic ovaries", "Normal insulin sensitivity"], riskProfile: "Moderate reproductive risk, lower metabolic risk", metabolicRisk: "moderate", matches: hasOligo && hasHa && hasPcom && !hasIr && !hasObesity },
    { id: 2, name: "Hyperandrogenic-PCO", description: "Ovulatory phenotype with androgen excess and polycystic morphology.", characteristics: ["Regular cycles", "Hyperandrogenism", "Polycystic ovaries", "Skin manifestations"], riskProfile: "Lower metabolic risk, focus on dermatologic symptoms", metabolicRisk: "moderate", matches: !hasOligo && hasHa && hasPcom },
    { id: 3, name: "Normo-androgenic PCOS", description: "Cycle irregularity and polycystic morphology without overt hyperandrogenism.", characteristics: ["Irregular cycles", "Normal androgens", "Polycystic ovaries"], riskProfile: "Lowest risk profile among PCOS phenotypes", metabolicRisk: "low", matches: hasOligo && !hasHa && hasPcom },
    { id: 4, name: "Non-PCOS Control", description: "Does not meet Rotterdam criteria.", characteristics: ["Regular cycles", "Normal androgens", "Normal ovarian morphology"], riskProfile: "No PCOS diagnosis indicated", metabolicRisk: "low", matches: !hasOligo && !hasHa && !hasPcom },
  ]

  const assignedCluster = clusters.find((cluster) => cluster.matches) ?? clusters[4]

  return {
    assignedCluster: {
      id: assignedCluster.id,
      name: assignedCluster.name,
      description: assignedCluster.description,
      characteristics: assignedCluster.characteristics,
      riskProfile: assignedCluster.riskProfile,
      metabolicRisk: assignedCluster.metabolicRisk,
    },
    allClusters: clusters.map(({ matches, ...cluster }) => ({ id: cluster.id, name: cluster.name, patientCount: matches ? 1 : 0, metabolicRisk: cluster.metabolicRisk })),
  }
}

function buildPathways(data: PatientData, evaluation: RotterdamEvaluation, riskScore: number): PathwayActivity[] {
  const pathways = [
    {
      name: "Insulin Signaling",
      activity: 30 + (data.homaIr > 2.5 ? 32 : 0) + (data.fastingGlucose > 100 ? 8 : 0) + (data.insulinLevel > 15 ? 6 : 0),
      genes: ["INSR", "IRS-1", "PI3K", "AKT"],
      description: "Insulin resistance and downstream signaling disruption",
      icon: "🔋",
    },
    {
      name: "Androgen Synthesis",
      activity: 28 + (evaluation.hyperandrogenism.met ? 28 : 0) + (data.lhFshRatio > 2 ? 8 : 0) + (data.acne || data.hirsutism ? 6 : 0),
      genes: ["CYP17A1", "CYP11A1", "StAR", "3β-HSD"],
      description: "Steroidogenic activity linked to androgen excess",
      icon: "⚡",
    },
    {
      name: "Ovarian Follicle Regulation",
      activity: 30 + (evaluation.polycysticOvaries.met ? 26 : 0) + (data.amh > 6 ? 8 : 0) + (data.cycleLength > 35 ? 6 : 0),
      genes: ["AMH", "FSHR", "LHCGR", "BMP15"],
      description: "Follicle maturation and ovulatory regulation",
      icon: "🫘",
    },
    {
      name: "Inflammatory Signaling",
      activity: 24 + (data.homaIr > 2.5 ? 18 : 0) + (data.bmi > 25 ? 8 : 0) + (data.skinDarkening ? 6 : 0) + (riskScore >= 70 ? 4 : 0),
      genes: ["IL-6", "TNF-α", "CRP", "NF-κB"],
      description: "Low-grade inflammatory activity that can amplify endocrine dysfunction",
      icon: "🔥",
    },
  ]

  return pathways.sort((a, b) => b.activity - a.activity).map((pathway) => ({ ...pathway, activity: roundPercent(pathway.activity) }))
}

function buildCellArchitecture(data: PatientData, evaluation: RotterdamEvaluation, riskScore: number): CellularComposition[] {
  const raw = [
    { name: "Granulosa cells", value: 26 + (evaluation.polycysticOvaries.met ? -3 : 2) - (data.amh > 6 ? 1 : 0), icon: "💜", description: "Follicular support and maturation" },
    { name: "Stromal cells", value: 30 + (data.homaIr > 2.5 ? 8 : 3) + (riskScore >= 70 ? 2 : 0), icon: "🟣", description: "Structural and metabolic support tissue" },
    { name: "Theca cells", value: 18 + (evaluation.hyperandrogenism.met ? 7 : 3) + (data.lhFshRatio > 2 ? 2 : 0), icon: "🔵", description: "Androgen-producing compartment" },
    { name: "Immune cells", value: 12 + (data.homaIr > 2.5 ? 4 : 1) + (data.skinDarkening ? 3 : 0), icon: "🧡", description: "Inflammatory and immune surveillance compartment" },
    { name: "Endothelial cells", value: 14 + (data.bloodPressureSystolic > 130 ? 3 : 0) - (evaluation.diagnosisMet ? 1 : 0), icon: "❤️", description: "Vascular and perfusion support" },
  ]

  return normalizePercentages(raw.map((entry) => ({ ...entry, value: Math.max(entry.value, 1) })))
}

function buildDifferentialDiagnosis(score: number, data: PatientData, evaluation: RotterdamEvaluation): DifferentialDiagnosisItem[] {
  const raw = [
    { condition: "PCOS", value: score, description: "Rotterdam pattern with endocrine and ovarian support", icon: "🫘" },
    { condition: "Endometriosis", value: 18 + (data.periodDuration >= 7 ? 4 : 0) + (data.cycleLength < 28 ? 4 : 0) + (!evaluation.diagnosisMet ? 2 : 0), description: "Competing reproductive diagnosis considered in differential reasoning", icon: "⚕️" },
    { condition: "Healthy ovarian function", value: Math.max(5, 100 - score * 0.8), description: "No major endocrine or structural abnormality suggested by the current dataset", icon: "✓" },
  ]

  return normalizePercentages(raw).map(({ condition, percent, description, icon }) => ({ condition, probability: percent, description, icon })).sort((a, b) => b.probability - a.probability)
}

function buildClinicalInterpretation(
  phenotypeName: string,
  evaluation: RotterdamEvaluation,
  differentialDiagnosis: DifferentialDiagnosisItem[],
  pathways: PathwayActivity[],
  cells: CellularComposition[],
  score: number,
) {
  const dominantPathway = pathways[0]
  const dominantCell = cells[0]
  const diagnosisSentence = evaluation.diagnosisMet
    ? `The patient meets Rotterdam criteria with ${evaluation.criteriaMetCount}/3 criteria present, supporting a PCOS diagnosis.`
    : `The current input set does not fully satisfy Rotterdam diagnostic criteria, so the report remains probabilistic rather than confirmatory.`

  return `${diagnosisSentence} The phenotype assignment is ${phenotypeName}. The leading biological signal is ${dominantPathway.name.toLowerCase()} at ${dominantPathway.activity}%, with ${dominantCell.name.toLowerCase()} predominance at ${dominantCell.percent}%. Differential reasoning currently favors ${differentialDiagnosis[0].condition} at ${differentialDiagnosis[0].probability}%. Overall PCOS probability is ${score}%.`
}

function buildLocalAnalysis(data: PatientData, prediction: PredictionResult): FullAnalysisResult {
  const shapValues = buildShapValues(data)
  const clusterSnapshot = buildClusterSnapshot(data)

  return {
    success: true,
    prediction: {
      pcosRiskScore: prediction.pcosRiskScore,
      riskLevel: prediction.riskLevel,
      contributingFactors: prediction.contributingFactors,
    },
    phenotype: {
      type: prediction.phenotype.type,
      name: prediction.phenotype.name,
      description: prediction.phenotype.description,
    },
    phenotypeDisplay: {
      displayName: prediction.phenotype.name,
      type: prediction.phenotype.type,
      characteristics: prediction.contributingFactors,
    },
    biologicalInsights: {
      pathways: [],
      summary: "Patient-specific biological interpretation is assembled on the report page from the current clinical inputs.",
    },
    nextInvestigations: [],
    shap: {
      values: shapValues,
      topContributors: shapValues.filter((feature) => feature.impact !== "low").map((feature) => ({
        feature: feature.name,
        contribution: feature.value,
        impact: feature.impact,
        direction: feature.direction,
        explanation: feature.explanation,
      })),
    },
    clustering: {
      assignedCluster: clusterSnapshot.assignedCluster,
      allClusters: clusterSnapshot.allClusters,
    },
    confidenceMetrics: prediction.confidenceMetrics,
    recommendations: prediction.recommendations,
    timestamp: new Date().toISOString(),
  }
}

export function ResultsDashboard({ patientData, onBack }: ResultsDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<FullAnalysisResult | null>(null)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const runAnalysis = async () => {
      try {
        setLoading(true)
        const [analysisResult, predictionResult] = await Promise.allSettled([
          healthApi.analyze(patientData),
          healthApi.predict(patientData),
        ])

        if (cancelled) return

        setAnalysis(analysisResult.status === "fulfilled" ? analysisResult.value : null)
        setPrediction(predictionResult.status === "fulfilled" ? predictionResult.value : null)

        try {
          const session = await healthApi.session.create(patientData)
          if (!cancelled && session.session?.id) {
            setSessionId(session.session.id)
          }
        } catch {
          // Session persistence is optional for the report view.
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Analysis failed")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    runAnalysis()

    return () => {
      cancelled = true
    }
  }, [patientData])

  const predictionSnapshot = prediction ?? buildPredictionFallback(patientData)
  const analysisSnapshot = analysis ?? buildLocalAnalysis(patientData, predictionSnapshot)
  const humanReasoning = (analysisSnapshot as any).humanReasoning ?? []
  const suggestedInvestigationsList = (analysisSnapshot as any).suggestedInvestigations ?? (analysisSnapshot.nextInvestigations ?? [])
  const rotterdam = predictionSnapshot.rotterdamEvaluation
  const shap = analysisSnapshot.shap ?? { values: buildShapValues(patientData), topContributors: [] }
  const clustering = analysisSnapshot.clustering ?? buildClusterSnapshot(patientData)
  const confidenceMetrics = analysisSnapshot.confidenceMetrics ?? predictionSnapshot.confidenceMetrics
  const recommendations = Array.isArray(analysisSnapshot.recommendations) && analysisSnapshot.recommendations.length > 0
    ? analysisSnapshot.recommendations
    : predictionSnapshot.recommendations
  const differentialDiagnosis = buildDifferentialDiagnosis(predictionSnapshot.pcosRiskScore, patientData, rotterdam)
  const pathways = buildPathways(patientData, rotterdam, predictionSnapshot.pcosRiskScore)
  const cellComposition = buildCellArchitecture(patientData, rotterdam, predictionSnapshot.pcosRiskScore)
  const clinicalInterpretation = buildClinicalInterpretation(
    predictionSnapshot.phenotype.name,
    rotterdam,
    differentialDiagnosis,
    pathways,
    cellComposition,
    predictionSnapshot.pcosRiskScore,
  )
  const builtSymptoms = buildSymptomsForPatient(patientData, analysisSnapshot)
  const severeFindings = builtSymptoms.filter((symptom) => symptom.severity === "severe").length
  const affectedRegions = builtSymptoms.length

  const primaryDiagnosisName = predictionSnapshot.phenotype.name
  const primaryDiagnosisConfidence = Math.round(confidenceMetrics.pcosClassification || predictionSnapshot.pcosRiskScore || 0)
  const primaryDiagnosisBadge = predictionSnapshot.riskLevel === "high" ? "High Confidence" : predictionSnapshot.riskLevel === "moderate" ? "Moderate Confidence" : "Low Confidence"

  const criteriaMetPieces: string[] = []
  if (rotterdam.hyperandrogenism.met) criteriaMetPieces.push("Hyperandrogenism")
  if (rotterdam.ovulatoryDysfunction.met) criteriaMetPieces.push("Ovulatory dysfunction")
  if (rotterdam.polycysticOvaries.met) criteriaMetPieces.push("Polycystic ovaries")
  const criteriaMetText = criteriaMetPieces.length > 0 ? criteriaMetPieces.join(" + ") : "No Rotterdam criteria clearly met"

  // Build symptom category counts from builtSymptoms
  const categoryMap: Record<string, number> = { Reproductive: 0, Dermatological: 0, Metabolic: 0, Hormonal: 0 }
  builtSymptoms.forEach((s) => {
    if (s.region === "reproductive" || s.region === "pelvis") categoryMap.Reproductive += 1
    else if (s.region === "face" || s.region === "scalp" || s.id === "hirsutism") categoryMap.Dermatological += 1
    else if (s.region === "abdomen" || s.id === "skin-tags") categoryMap.Metabolic += 1
    else categoryMap.Hormonal += 1
  })

  const symptomCategories = [
    { name: "Reproductive", count: categoryMap.Reproductive, color: "bg-primary" },
    { name: "Dermatological", count: categoryMap.Dermatological, color: "bg-accent" },
    { name: "Metabolic", count: categoryMap.Metabolic, color: "bg-secondary" },
    { name: "Hormonal", count: categoryMap.Hormonal, color: "bg-purple-500" },
  ]

  // Prepare render nodes for SHAP or human-readable reasoning to avoid complex inline JSX
  const shapNodes = shap.values && shap.values.length > 0
    ? shap.values.map((feature: any, index: number) => (
        <motion.div key={feature.name + index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + index * 0.05 }} className="flex items-center gap-4">
          <span className="w-36 text-sm text-muted-foreground shrink-0">{feature.name}</span>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${feature.value * 100}%` }} transition={{ duration: 0.8, delay: 0.55 + index * 0.05 }} className={`h-full rounded-full ${feature.impact === "high" ? "bg-gradient-to-r from-pink-500 to-pink-400" : feature.impact === "moderate" ? "bg-gradient-to-r from-yellow-500 to-yellow-400" : "bg-gradient-to-r from-green-500 to-green-400"}`} />
            </div>
            <span className={`text-sm font-mono w-12 ${feature.impact === "high" ? "text-pink-400" : feature.impact === "moderate" ? "text-yellow-400" : "text-green-400"}`}>
              {(feature.value * 100).toFixed(0)}%
            </span>
          </div>
        </motion.div>
      ))
    : (
      <div className="p-3 rounded-lg bg-muted/10 border border-border/50 text-sm text-muted-foreground">No SHAP feature contributions were returned by the backend.</div>
    )

  const humanReasoningNodes = humanReasoning && humanReasoning.length > 0
    ? humanReasoning.map((line: string, index: number) => (
        <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + index * 0.05 }} className="flex items-start gap-4">
          <span className="w-36 text-sm text-muted-foreground shrink-0">{index + 1}.</span>
          <div className="flex-1">
            <div className="text-sm text-foreground">{line}</div>
          </div>
        </motion.div>
      ))
    : null

  const handleSaveResults = async () => {
    if (!sessionId) return
    setSaving(true)
    try {
      await healthApi.session.saveResult(sessionId, {
        pcos_risk_score: predictionSnapshot.pcosRiskScore,
        phenotype: predictionSnapshot.phenotype.type,
        phenotype_name: predictionSnapshot.phenotype.name,
        phenotype_description: predictionSnapshot.phenotype.description,
        risk_level: predictionSnapshot.riskLevel,
        contributing_factors: predictionSnapshot.contributingFactors,
        shap_values: shap.values,
        cluster_assignment: clustering.assignedCluster,
        confidence_metrics: confidenceMetrics,
        recommendations,
      })
    } catch {
      // Silently handle save errors.
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

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Analysis Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={onBack} variant="outline">Back to Analysis</Button>
        </div>
      </div>
    )
  }

  const riskColor = predictionSnapshot.riskLevel === "high" ? "pink" : predictionSnapshot.riskLevel === "moderate" ? "yellow" : "green"

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">Patient Results </span>
            <span className="text-gradient-purple-pink">Report</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Individualized endocrine intelligence report driven by the current patient inputs, model outputs, SHAP explainability, and phenotype clustering.
          </p>
        </motion.div>

        {/* Clinical disclaimer — prominent, top-of-report */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-200">
            <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-400" />
            <span>
              <strong className="text-yellow-300">Clinical decision-support only.</strong> This report is designed to assist — not replace — clinician judgment. Results are prototype-level and require validation before clinical deployment. Always correlate findings with a full clinical assessment and consult a qualified healthcare provider before acting on this output.
            </span>
          </div>
        </motion.div>

        {/* Plain-language summary card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-8">
          <Card className="glass border-purple-500/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Plain-Language Summary</h3>
                <p className="text-sm text-muted-foreground">Quick-read interpretation for clinicians and care teams</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${predictionSnapshot.riskLevel === "high" ? "bg-pink-400" : predictionSnapshot.riskLevel === "moderate" ? "bg-yellow-400" : "bg-green-400"}`} />
                  <span className="text-foreground">
                    <strong>Risk level:</strong>{" "}
                    {predictionSnapshot.riskLevel === "high"
                      ? "High — clinical follow-up is recommended."
                      : predictionSnapshot.riskLevel === "moderate"
                      ? "Moderate — further investigation may be warranted."
                      : "Low — routine monitoring is suggested."}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 w-2 h-2 rounded-full flex-shrink-0 bg-cyan-400" />
                  <span className="text-foreground">
                    <strong>Rotterdam criteria:</strong>{" "}
                    {rotterdam?.criteriaMetCount ?? 0}/3 criteria met.{" "}
                    {rotterdam?.diagnosisMet
                      ? "PCOS diagnosis is supported."
                      : "Insufficient criteria for a Rotterdam diagnosis — probabilistic assessment only."}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="mt-1 w-2 h-2 rounded-full flex-shrink-0 bg-purple-400" />
                  <span className="text-foreground">
                    <strong>Phenotype:</strong> Type {predictionSnapshot.phenotype.type} — {predictionSnapshot.phenotype.name}.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 w-2 h-2 rounded-full flex-shrink-0 bg-pink-400" />
                  <span className="text-foreground">
                    <strong>Suggested action:</strong>{" "}
                    {predictionSnapshot.recommendations[0] ?? "Review full report below for clinical next steps."}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass border-purple-500/30 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">PCOS Probability</h3>
                  <p className="text-sm text-muted-foreground">Patient-specific model output</p>
                </div>
              </div>
              <div className="relative mb-6">
                <div className="text-6xl font-bold text-center mb-2">
                  <span className={riskColor === "pink" ? "text-pink-400" : riskColor === "yellow" ? "text-yellow-400" : "text-green-400"}>
                    {predictionSnapshot.pcosRiskScore}
                  </span>
                  <span className="text-2xl text-muted-foreground">%</span>
                </div>
                <Progress value={predictionSnapshot.pcosRiskScore} className="h-3" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                riskColor === "pink" ? "bg-pink-500/20 text-pink-300" : riskColor === "yellow" ? "bg-yellow-500/20 text-yellow-300" : "bg-green-500/20 text-green-300"
              }`}>
                {riskColor === "pink" ? <AlertTriangle className="w-4 h-4" /> : riskColor === "yellow" ? <TrendingUp className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                {predictionSnapshot.riskLevel.charAt(0).toUpperCase() + predictionSnapshot.riskLevel.slice(1)} Risk
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass border-cyan-500/30 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                  <Dna className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Phenotype Prediction</h3>
                  <p className="text-sm text-muted-foreground">Individualized subtype assignment</p>
                </div>
              </div>
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 mb-3">
                  <span className="text-3xl font-bold text-cyan-300">{predictionSnapshot.phenotype.type}</span>
                </div>
                <h4 className="text-xl font-bold text-foreground">{predictionSnapshot.phenotype.name}</h4>
              </div>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">{predictionSnapshot.phenotype.description}</p>
              <p className="mt-4 text-xs text-cyan-300 text-center leading-relaxed">{predictionSnapshot.phenotype.clinicalReasoning}</p>
            </Card>
          </motion.div>

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

        {/* Innovation lens — signals considered */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }} className="mb-6">
          <Card className="glass border-cyan-500/10 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">Multi-Signal Synthesis</p>
                <p className="text-sm text-muted-foreground">
                  This risk view is formed by synthesising up to <strong className="text-foreground">six clinical domains</strong> simultaneously — not a single test or symptom checklist. Each domain contributes a weighted signal to the overall score and phenotype assignment below.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:gap-1.5 flex-shrink-0">
                {[
                  { label: "Demographics", active: true, color: "purple" },
                  { label: "Menstrual", active: true, color: "purple" },
                  { label: "Symptoms", active: true, color: "purple" },
                  {
                    label: "Metabolic",
                    active: patientData.fastingGlucose !== 95 || patientData.insulinLevel !== 12 || patientData.waistCircumference !== 80,
                    color: "cyan",
                  },
                  {
                    label: "Ultrasound",
                    active: patientData.follicleCountLeft !== 10 || patientData.follicleCountRight !== 12 || patientData.polycysticAppearance,
                    color: "cyan",
                  },
                  {
                    label: "Lab Biomarkers",
                    active: patientData.lh !== 10 || patientData.totalTestosterone !== 45 || patientData.amh !== 4.5,
                    color: "cyan",
                  },
                ].map((sig) => (
                  <span
                    key={sig.label}
                    className={`text-xs px-2 py-1 rounded-full border font-medium whitespace-nowrap ${
                      sig.active
                        ? sig.color === "purple"
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                          : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                        : "bg-zinc-800/50 text-zinc-500 border-zinc-700/50"
                    }`}
                  >
                    {sig.active ? "✓ " : "– "}{sig.label}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }} className="mb-8">
          <Card className="glass border-purple-500/20 p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Body Visualization</h3>
                <p className="text-sm text-muted-foreground">Interactive Symptom Mapping</p>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary">
                <Activity className="h-3 w-3 mr-1" />
                Live Analysis
              </Badge>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 min-w-0">
                <InteractiveBodyViewer symptoms={builtSymptoms} />
              </div>

              <div className="space-y-6">
                <Card className="glass rounded-2xl p-6 border border-border/50">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI Analysis Summary
                  </h2>

                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Primary Diagnosis</span>
                        <Badge className="bg-primary/20 text-primary border-primary/30">{primaryDiagnosisBadge}</Badge>
                      </div>
                      <p className="text-lg font-bold text-primary">{primaryDiagnosisName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{criteriaMetText}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-card border border-border">
                        <span className="text-xs text-muted-foreground">Affected Regions</span>
                        <p className="text-2xl font-bold text-secondary">{affectedRegions}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-card border border-border">
                        <span className="text-xs text-muted-foreground">Severe Findings</span>
                        <p className="text-2xl font-bold text-accent">{severeFindings}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="glass rounded-2xl p-6 border border-border/50">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Dna className="h-5 w-5 text-secondary" />
                    Symptom Categories
                  </h2>

                  <div className="space-y-3">
                    {symptomCategories.map((category) => (
                      <div key={category.name} className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-border/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${category.color}`} />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <Badge variant="outline">{category.count} findings</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="glass border-cyan-500/30 p-6 h-full space-y-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">Rotterdam Criteria Evaluation</h3>
                  <p className="text-sm text-muted-foreground">Patient-specific criterion status</p>
                </div>
              </div>

              {[
                { label: "Hyperandrogenism", result: rotterdam.hyperandrogenism },
                { label: "Ovulatory dysfunction", result: rotterdam.ovulatoryDysfunction },
                { label: "Polycystic ovarian morphology", result: rotterdam.polycysticOvaries },
              ].map((criterion) => (
                <div key={criterion.label} className={`rounded-lg border p-4 ${criterion.result.met ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-900/30 border-slate-700/40"}`}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="font-semibold text-foreground">{criterion.label}</div>
                    <Badge className={criterion.result.met ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-slate-500/20 text-slate-300 border-slate-500/30"}>
                      {criterion.result.met ? "Met" : "Not met"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{criterion.result.reasoning}</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {criterion.result.subcriteria.map((subcriterion) => (
                      <div key={subcriterion.name} className="flex items-start justify-between gap-3">
                        <span>{subcriterion.name}</span>
                        <span className="text-right">{subcriterion.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className={`rounded-lg border-2 p-4 text-center ${rotterdam.diagnosisMet ? "bg-emerald-500/10 border-emerald-500/30" : "bg-yellow-500/10 border-yellow-500/30"}`}>
                <div className="text-sm font-semibold text-muted-foreground mb-1">Criteria Met</div>
                <div className={`text-3xl font-bold ${rotterdam.diagnosisMet ? "text-emerald-400" : "text-yellow-400"}`}>
                  {rotterdam.criteriaMetCount} / 3
                </div>
                <div className={`text-xs mt-2 font-medium ${rotterdam.diagnosisMet ? "text-emerald-300" : "text-yellow-300"}`}>
                  {rotterdam.diagnosisMet ? "PCOS diagnosis supported by Rotterdam criteria" : "Insufficient criteria for a Rotterdam diagnosis"}
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                {rotterdam.exclusionNotes.map((note) => (
                  <p key={note}>• {note}</p>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass border-pink-500/30 p-6 h-full space-y-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-pink-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">Differential Diagnosis</h3>
                  <p className="text-sm text-muted-foreground">Patient-specific probability distribution</p>
                </div>
              </div>

              <div className="space-y-4">
                {differentialDiagnosis.map((diagnosis) => (
                  <div key={diagnosis.condition} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-lg flex-shrink-0">{diagnosis.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm text-foreground truncate">{diagnosis.condition}</div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{diagnosis.description}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold flex-shrink-0 w-12 text-right text-pink-300">{diagnosis.probability}%</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-pink-400" style={{ width: `${diagnosis.probability}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900/40 border border-pink-500/30 rounded-lg p-4 text-xs text-foreground space-y-2">
                <div className="font-semibold text-pink-400">Clinical Interpretation</div>
                <p className="text-muted-foreground">
                  {clinicalInterpretation}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-8">
          <Card className="glass border-cyan-500/30 p-6">
            <div className="flex items-start gap-3 mb-6">
              <Users className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-foreground">Metabolic Subtype</h3>
                <p className="text-sm text-muted-foreground">Cluster assignment and phenotype context</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <h4 className="font-semibold text-foreground mb-2">{clustering.assignedCluster?.name ?? "Unassigned"}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{clustering.assignedCluster?.description ?? "No cluster information available from the current analysis response."}</p>
                  <div className="flex flex-wrap gap-2">
                    {(clustering.assignedCluster?.characteristics ?? []).map((characteristic) => (
                      <Badge key={characteristic} variant="outline" className="border-cyan-500/30 text-cyan-300 text-xs">{characteristic}</Badge>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/20 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Metabolic Risk</span>
                    <Badge className={(clustering.assignedCluster?.metabolicRisk ?? predictionSnapshot.riskLevel) === "high" ? "bg-pink-500/20 text-pink-300" : (clustering.assignedCluster?.metabolicRisk ?? predictionSnapshot.riskLevel) === "moderate" ? "bg-yellow-500/20 text-yellow-300" : "bg-green-500/20 text-green-300"}>
                      {(clustering.assignedCluster?.metabolicRisk ?? predictionSnapshot.riskLevel).toUpperCase()}
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

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="glass border-pink-500/20 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">SHAP Feature Contribution</h3>
                  <p className="text-sm text-muted-foreground">Patient-level explainability output</p>
                </div>
              </div>
              <div className="space-y-4">
                {humanReasoning && humanReasoning.length > 0 ? humanReasoningNodes : shapNodes}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="glass border-cyan-500/20 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                  <Dna className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Clinical Recommendations</h3>
                  <p className="text-sm text-muted-foreground">Patient-specific next steps</p>
                </div>
              </div>
              <div className="space-y-3">
                {recommendations.length > 0 ? recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs text-cyan-300">{index + 1}</span>
                    </div>
                    <span className="text-sm text-foreground">{recommendation}</span>
                  </div>
                )) : (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">No additional recommendations returned.</span>
                  </div>
                )}
                {suggestedInvestigationsList && suggestedInvestigationsList.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-foreground mb-2">Suggested Next Investigations</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {suggestedInvestigationsList.map((inv: string, idx: number) => (
                        <div key={inv + idx} className="flex items-start gap-2 p-2 rounded-lg bg-muted/10 border border-border text-sm">
                          <span className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center text-xs text-cyan-300 mt-0.5">{idx + 1}</span>
                          <span className="text-sm text-foreground">{inv}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Public health note — why early awareness matters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="mb-8">
          <Card className={`glass p-5 border ${
            predictionSnapshot.riskLevel === "high"
              ? "border-pink-500/30 bg-pink-500/5"
              : predictionSnapshot.riskLevel === "moderate"
              ? "border-amber-500/30 bg-amber-500/5"
              : "border-green-500/30 bg-green-500/5"
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                predictionSnapshot.riskLevel === "high"
                  ? "bg-pink-500/20 border border-pink-500/30"
                  : predictionSnapshot.riskLevel === "moderate"
                  ? "bg-amber-500/20 border border-amber-500/30"
                  : "bg-green-500/20 border border-green-500/30"
              }`}>
                <Users className={`w-4 h-4 ${
                  predictionSnapshot.riskLevel === "high" ? "text-pink-400"
                  : predictionSnapshot.riskLevel === "moderate" ? "text-amber-400"
                  : "text-green-400"
                }`} />
              </div>
              <div className="space-y-2 flex-1 min-w-0">
                <p className={`text-xs font-semibold uppercase tracking-wider ${
                  predictionSnapshot.riskLevel === "high" ? "text-pink-400"
                  : predictionSnapshot.riskLevel === "moderate" ? "text-amber-400"
                  : "text-green-400"
                }`}>
                  Why Early Awareness Matters
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {predictionSnapshot.riskLevel === "high"
                    ? "A high-risk pattern like this one — particularly when multiple Rotterdam criteria are met — is associated with long-term cardiometabolic and reproductive health implications if left unaddressed. Earlier follow-up with a clinician can support timely lifestyle, metabolic, and hormonal intervention before complications develop."
                    : predictionSnapshot.riskLevel === "moderate"
                    ? "A moderate-risk pattern suggests some clinically relevant signals are present. Even without a confirmed diagnosis, earlier awareness can support proactive monitoring, lifestyle adjustments, and a structured conversation with a GP or specialist about next steps."
                    : "A low-risk pattern is reassuring, but monitoring cycle health, metabolic indicators, and androgen symptoms over time remains valuable — particularly if the pattern evolves or additional data becomes available."}
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>When to seek professional care:</strong> If this report flags moderate or high risk, consider sharing it with a GP or endocrinologist to guide follow-up. This output is decision-support only and does not constitute a clinical diagnosis.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card className="glass border-pink-500/30 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Molecular Pathway Activity</h3>
                  <p className="text-sm text-muted-foreground">Patient-specific pathway scores</p>
                </div>
              </div>
              <div className="space-y-4">
                {pathways.map((pathway) => (
                  <div key={pathway.name} className="rounded-lg border border-border/50 bg-muted/10 p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{pathway.icon}</span>
                        <div>
                          <div className="font-semibold text-foreground">{pathway.name}</div>
                          <p className="text-sm text-muted-foreground">{pathway.description}</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-foreground">{pathway.activity}%</span>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden mb-3">
                      <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: `${pathway.activity}%` }} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {pathway.genes.map((gene) => (
                        <Badge key={gene} variant="outline" className="text-xs bg-slate-900/40 text-foreground border-slate-600/50">
                          {gene}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Card className="glass border-cyan-500/30 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Ovarian Cellular Architecture</h3>
                  <p className="text-sm text-muted-foreground">Patient-specific cell composition estimate</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cellComposition.map((cell) => (
                  <div key={cell.name} className="rounded-lg border border-border/50 bg-muted/10 p-4 text-center">
                    <div className="text-2xl mb-1">{cell.icon}</div>
                    <div className="font-semibold text-sm text-foreground">{cell.name}</div>
                    <div className="text-2xl font-bold text-foreground">{cell.percent}%</div>
                    <div className="text-xs text-muted-foreground mt-1">{cell.description}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs text-foreground space-y-2">
                <strong className="text-cyan-400">Biological Interpretation:</strong>
                <p className="text-muted-foreground">
                  {predictionSnapshot.pcosRiskScore >= 70
                    ? "The patient’s profile shows a strongly PCOS-consistent endocrine pattern with dominant ovarian and metabolic signals."
                    : "The patient’s ovarian architecture is being interpreted in the context of a partial or evolving PCOS signal rather than a textbook explanation."}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="outline" onClick={onBack} className="border-purple-500/50 text-foreground hover:bg-purple-500/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Modify Analysis
          </Button>
          <Button variant="outline" onClick={handleSaveResults} disabled={saving || !sessionId} className="border-cyan-500/50 text-foreground hover:bg-cyan-500/10">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Results
          </Button>
          <Button variant="outline" onClick={() => window.print()} className="border-green-500/50 text-foreground hover:bg-green-500/10">
            <Printer className="w-4 h-4 mr-2" />
            Print / Export PDF
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
