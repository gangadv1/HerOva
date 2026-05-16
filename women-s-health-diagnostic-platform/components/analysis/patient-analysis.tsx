"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Logo from "@/components/branding/logo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { DemographicsForm } from "./forms/demographics-form"
import { MenstrualHealthForm } from "./forms/menstrual-health-form"
import { HormonalSymptomsForm } from "./forms/hormonal-symptoms-form"
import { MetabolicIndicatorsForm } from "./forms/metabolic-indicators-form"
import { UltrasoundForm } from "./forms/ultrasound-form"
import { LabBiomarkersForm } from "./forms/lab-biomarkers-form"
import { BodyVisualization } from "./body-visualization"
import { ResultsDashboard } from "./results-dashboard"

const steps = [
  { id: "demographics", title: "Demographics", component: DemographicsForm },
  { id: "menstrual", title: "Menstrual Health", component: MenstrualHealthForm },
  { id: "hormonal", title: "Hormonal Symptoms", component: HormonalSymptomsForm },
  { id: "metabolic", title: "Metabolic Indicators", component: MetabolicIndicatorsForm },
  { id: "ultrasound", title: "Ultrasound Findings", component: UltrasoundForm },
  { id: "biomarkers", title: "Lab Biomarkers", component: LabBiomarkersForm },
]

export type PatientData = {
  // Demographics
  age: number
  weight: number
  height: number
  bmi: number
  ethnicity: string
  
  // Menstrual Health
  cycleLength: number
  cycleLengthVariability: string
  periodDuration: number
  ageAtMenarche: number
  irregularPeriods: boolean
  
  // Hormonal Symptoms
  acne: boolean
  acneSeverity: string
  hirsutism: boolean
  hirsutismScore: number
  hairLoss: boolean
  skinDarkening: boolean
  
  // Metabolic
  fastingGlucose: number
  insulinLevel: number
  homaIr: number
  waistCircumference: number
  bloodPressureSystolic: number
  bloodPressureDiastolic: number
  
  // Ultrasound
  ovaryVolumeLeft: number
  ovaryVolumeRight: number
  follicleCountLeft: number
  follicleCountRight: number
  polycysticAppearance: boolean
  endometrialThickness: number
  
  // Biomarkers
  lh: number
  fsh: number
  lhFshRatio: number
  totalTestosterone: number
  freeTestosterone: number
  dheas: number
  amh: number
  prolactin: number
  tsh: number
}

const initialPatientData: PatientData = {
  age: 28,
  weight: 65,
  height: 165,
  bmi: 23.9,
  ethnicity: "",
  cycleLength: 35,
  cycleLengthVariability: "moderate",
  periodDuration: 5,
  ageAtMenarche: 13,
  irregularPeriods: true,
  acne: false,
  acneSeverity: "none",
  hirsutism: false,
  hirsutismScore: 0,
  hairLoss: false,
  skinDarkening: false,
  fastingGlucose: 95,
  insulinLevel: 12,
  homaIr: 2.8,
  waistCircumference: 80,
  bloodPressureSystolic: 120,
  bloodPressureDiastolic: 80,
  ovaryVolumeLeft: 8,
  ovaryVolumeRight: 9,
  follicleCountLeft: 10,
  follicleCountRight: 12,
  polycysticAppearance: false,
  endometrialThickness: 8,
  lh: 10,
  fsh: 6,
  lhFshRatio: 1.67,
  totalTestosterone: 45,
  freeTestosterone: 2.5,
  dheas: 250,
  amh: 4.5,
  prolactin: 15,
  tsh: 2.0,
}

export function PatientAnalysis() {
  const [currentStep, setCurrentStep] = useState(0)
  const [patientData, setPatientData] = useState<PatientData>(initialPatientData)
  const [showResults, setShowResults] = useState(false)
  const [showBodyView, setShowBodyView] = useState(false)

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updatePatientData = (data: Partial<PatientData>) => {
    setPatientData((prev) => ({ ...prev, ...data }))
  }

  const CurrentForm = steps[currentStep].component

  if (showResults) {
    return <ResultsDashboard patientData={patientData} onBack={() => setShowResults(false)} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 glass sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Logo size="sm" />
          </Link>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBodyView(!showBodyView)}
              className="border-purple-500/50 text-foreground hover:bg-purple-500/10"
            >
              {showBodyView ? "Form View" : "Body View"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Progress */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Patient Analysis</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  index <= currentStep ? "text-purple-400" : "text-muted-foreground"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep
                    ? "bg-purple-500 text-white"
                    : index === currentStep
                    ? "bg-purple-500/20 border-2 border-purple-500 text-purple-400"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className="text-xs hidden sm:block">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <AnimatePresence mode="wait">
          {showBodyView ? (
            <motion.div
              key="body-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BodyVisualization patientData={patientData} />
            </motion.div>
          ) : (
            <motion.div
              key={`form-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="glass border-purple-500/20 p-8">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">
                    {currentStep + 1}
                  </span>
                  {steps[currentStep].title}
                </h2>
                
                <CurrentForm data={patientData} updateData={updatePatientData} />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="max-w-4xl mx-auto mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="border-purple-500/50 text-foreground hover:bg-purple-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0"
          >
            {currentStep === steps.length - 1 ? "View Results" : "Next"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
