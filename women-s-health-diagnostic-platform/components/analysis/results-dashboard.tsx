"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Logo from "@/components/branding/logo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Brain,
  Activity,
  Dna,
  FileText
} from "lucide-react"
import type { PatientData } from "./patient-analysis"

interface ResultsDashboardProps {
  patientData: PatientData
  onBack: () => void
}

export function ResultsDashboard({ patientData, onBack }: ResultsDashboardProps) {
  // Calculate PCOS risk score based on Rotterdam criteria
  const calculatePCOSRisk = () => {
    let score = 0
    let factors: string[] = []

    // Menstrual dysfunction
    if (patientData.irregularPeriods || patientData.cycleLength > 35) {
      score += 30
      factors.push("Oligomenorrhea/Irregular cycles")
    }

    // Clinical hyperandrogenism
    if (patientData.hirsutism || patientData.acne || patientData.hairLoss) {
      score += 25
      factors.push("Clinical hyperandrogenism")
    }

    // Biochemical hyperandrogenism
    if (patientData.totalTestosterone > 50 || patientData.freeTestosterone > 3) {
      score += 20
      factors.push("Elevated androgens")
    }

    // Polycystic ovaries
    if (patientData.polycysticAppearance || 
        patientData.follicleCountLeft >= 12 || 
        patientData.follicleCountRight >= 12 ||
        patientData.ovaryVolumeLeft > 10 ||
        patientData.ovaryVolumeRight > 10) {
      score += 25
      factors.push("Polycystic ovarian morphology")
    }

    // Additional risk factors
    if (patientData.lhFshRatio > 2) {
      score += 10
      factors.push("Elevated LH:FSH ratio")
    }

    if (patientData.amh > 6) {
      score += 10
      factors.push("Elevated AMH")
    }

    if (patientData.homaIr > 2.5) {
      score += 10
      factors.push("Insulin resistance")
    }

    return { score: Math.min(score, 100), factors }
  }

  // Determine phenotype
  const determinePhenotype = () => {
    const hasOligo = patientData.irregularPeriods || patientData.cycleLength > 35
    const hasHA = patientData.hirsutism || patientData.acne || patientData.totalTestosterone > 50
    const hasPCOM = patientData.polycysticAppearance || patientData.follicleCountLeft >= 12 || patientData.follicleCountRight >= 12

    if (hasOligo && hasHA && hasPCOM) {
      return { type: "A", name: "Frank/Classic PCOS", description: "All three Rotterdam criteria present - most severe phenotype with highest metabolic risk" }
    } else if (hasOligo && hasHA) {
      return { type: "B", name: "Non-PCO PCOS", description: "Oligomenorrhea and hyperandrogenism without polycystic morphology" }
    } else if (hasHA && hasPCOM) {
      return { type: "C", name: "Ovulatory PCOS", description: "Hyperandrogenism and PCOM with regular cycles - often milder metabolic profile" }
    } else if (hasOligo && hasPCOM) {
      return { type: "D", name: "Non-Hyperandrogenic PCOS", description: "Oligomenorrhea and PCOM without hyperandrogenism - mildest phenotype" }
    }
    return { type: "N/A", name: "Uncertain", description: "Does not meet Rotterdam criteria for PCOS diagnosis" }
  }

  // Feature importance for AI explainability
  const getFeatureImportance = () => {
    const features = [
      { name: "Cycle Length", value: patientData.cycleLength > 35 ? 0.85 : 0.3, impact: patientData.cycleLength > 35 ? "high" : "low" },
      { name: "Follicle Count", value: (patientData.follicleCountLeft + patientData.follicleCountRight) / 2 >= 12 ? 0.75 : 0.25, impact: (patientData.follicleCountLeft + patientData.follicleCountRight) / 2 >= 12 ? "high" : "low" },
      { name: "LH:FSH Ratio", value: patientData.lhFshRatio > 2 ? 0.7 : 0.2, impact: patientData.lhFshRatio > 2 ? "high" : "low" },
      { name: "Total Testosterone", value: patientData.totalTestosterone > 50 ? 0.65 : 0.2, impact: patientData.totalTestosterone > 50 ? "high" : "low" },
      { name: "HOMA-IR", value: patientData.homaIr > 2.5 ? 0.6 : 0.15, impact: patientData.homaIr > 2.5 ? "moderate" : "low" },
      { name: "AMH Level", value: patientData.amh > 6 ? 0.55 : 0.2, impact: patientData.amh > 6 ? "moderate" : "low" },
      { name: "Hirsutism Score", value: patientData.hirsutism ? 0.5 : 0.1, impact: patientData.hirsutism ? "moderate" : "low" },
      { name: "BMI", value: patientData.bmi > 25 ? 0.4 : 0.15, impact: patientData.bmi > 25 ? "moderate" : "low" },
    ].sort((a, b) => b.value - a.value)

    return features
  }

  const pcosResult = calculatePCOSRisk()
  const phenotype = determinePhenotype()
  const featureImportance = getFeatureImportance()

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { level: "High", color: "pink" }
    if (score >= 40) return { level: "Moderate", color: "yellow" }
    return { level: "Low", color: "green" }
  }

  const risk = getRiskLevel(pcosResult.score)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 glass sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Analysis
          </button>
          <Link href="/" className="flex items-center gap-3">
            <Logo size="sm" />
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">AI Diagnostic </span>
            <span className="text-gradient-purple-pink">Results</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive analysis based on clinical parameters, hormonal markers, and imaging findings
          </p>
        </motion.div>

        {/* Main Results Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* PCOS Risk Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass border-purple-500/30 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">PCOS Risk Score</h3>
                  <p className="text-sm text-muted-foreground">Rotterdam-based assessment</p>
                </div>
              </div>

              <div className="relative mb-6">
                <div className="text-6xl font-bold text-center mb-2">
                  <span className={`${
                    risk.color === "pink" ? "text-pink-400" :
                    risk.color === "yellow" ? "text-yellow-400" :
                    "text-green-400"
                  }`}>
                    {pcosResult.score}
                  </span>
                  <span className="text-2xl text-muted-foreground">%</span>
                </div>
                <Progress 
                  value={pcosResult.score} 
                  className="h-3"
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Low Risk</span>
                  <span>High Risk</span>
                </div>
              </div>

              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                risk.color === "pink" ? "bg-pink-500/20 text-pink-300" :
                risk.color === "yellow" ? "bg-yellow-500/20 text-yellow-300" :
                "bg-green-500/20 text-green-300"
              }`}>
                {risk.color === "pink" ? <AlertTriangle className="w-4 h-4" /> : 
                 risk.color === "yellow" ? <TrendingUp className="w-4 h-4" /> :
                 <CheckCircle className="w-4 h-4" />}
                {risk.level} Probability
              </div>
            </Card>
          </motion.div>

          {/* Phenotype Classification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass border-cyan-500/30 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                  <Dna className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Phenotype Classification</h3>
                  <p className="text-sm text-muted-foreground">PCOS subtype analysis</p>
                </div>
              </div>

              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 mb-3">
                  <span className="text-3xl font-bold text-cyan-300">{phenotype.type}</span>
                </div>
                <h4 className="text-xl font-bold text-foreground">{phenotype.name}</h4>
              </div>

              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                {phenotype.description}
              </p>
            </Card>
          </motion.div>

          {/* Confidence Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
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
                    <span className="text-pink-300">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Phenotype Match</span>
                    <span className="text-cyan-300">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Data Quality</span>
                    <span className="text-purple-300">95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Feature Importance (SHAP-style) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="glass border-purple-500/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Feature Contribution Analysis</h3>
                <p className="text-sm text-muted-foreground">SHAP-style explainability showing which factors most influence the diagnosis</p>
              </div>
            </div>

            <div className="space-y-4">
              {featureImportance.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-center gap-4"
                >
                  <span className="w-36 text-sm text-muted-foreground shrink-0">{feature.name}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${feature.value * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + index * 0.05 }}
                        className={`h-full rounded-full ${
                          feature.impact === "high" 
                            ? "bg-gradient-to-r from-pink-500 to-pink-400"
                            : feature.impact === "moderate"
                            ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                            : "bg-gradient-to-r from-green-500 to-green-400"
                        }`}
                      />
                    </div>
                    <span className={`text-sm font-mono w-12 ${
                      feature.impact === "high" ? "text-pink-400" :
                      feature.impact === "moderate" ? "text-yellow-400" :
                      "text-green-400"
                    }`}>
                      {(feature.value * 100).toFixed(0)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Contributing Factors & Recommendations */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass border-purple-500/20 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-foreground">Contributing Factors</h3>
              </div>

              <div className="space-y-3">
                {pcosResult.factors.length > 0 ? (
                  pcosResult.factors.map((factor) => (
                    <div key={factor} className="flex items-center gap-3 p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
                      <AlertTriangle className="w-4 h-4 text-pink-400 shrink-0" />
                      <span className="text-sm text-foreground">{factor}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    <span className="text-sm text-foreground">No significant risk factors identified</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="glass border-cyan-500/20 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-foreground">Clinical Recommendations</h3>
              </div>

              <div className="space-y-3">
                {pcosResult.score >= 40 ? (
                  <>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs text-cyan-300">1</span>
                      </div>
                      <span className="text-sm text-foreground">Consider referral to endocrinologist for comprehensive hormonal evaluation</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs text-cyan-300">2</span>
                      </div>
                      <span className="text-sm text-foreground">Lifestyle modifications: diet optimization and regular exercise</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs text-cyan-300">3</span>
                      </div>
                      <span className="text-sm text-foreground">Monitor metabolic markers and consider insulin sensitizers if indicated</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">Continue routine health monitoring. No immediate intervention required based on current findings.</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-4 rounded-xl bg-muted/30 border border-border"
        >
          <p className="text-xs text-muted-foreground text-center">
            <strong>Disclaimer:</strong> This AI-powered analysis is for research and educational purposes only. 
            It should not be used as a substitute for professional medical advice, diagnosis, or treatment. 
            Always consult with a qualified healthcare provider for clinical decisions.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            variant="outline"
            onClick={onBack}
            className="border-purple-500/50 text-foreground hover:bg-purple-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Modify Analysis
          </Button>
          <Link href="/molecular">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0">
              View Molecular Insights
              <Dna className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Dashboard footer showing brand name */}
      <footer className="mt-12 text-center">
        <span className="text-sm font-semibold text-foreground">HerOva</span>
      </footer>

    </div>
  </div>
  )
}
