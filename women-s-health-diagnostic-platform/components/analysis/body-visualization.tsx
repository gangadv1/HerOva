"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"
import type { PatientData } from "./patient-analysis"

interface BodyVisualizationProps {
  patientData: PatientData
}

type BodyRegion = "ovaries" | "uterus" | "skin" | "scalp" | "abdomen" | null

const regionData = {
  ovaries: {
    title: "Ovaries",
    color: "purple",
    description: "Primary site of follicle development and hormone production",
    symptoms: ["Polycystic morphology", "Enlarged volume", "Elevated follicle count"],
    biology: "In PCOS, the ovaries may develop numerous small follicles that fail to release eggs regularly. This leads to anovulation and accumulation of fluid-filled cysts.",
    pathways: ["Androgen overproduction", "LH hypersecretion", "Impaired folliculogenesis"],
    relevance: "Key diagnostic criterion per Rotterdam criteria. Polycystic appearance on ultrasound, combined with hyperandrogenism and irregular cycles, confirms PCOS diagnosis."
  },
  uterus: {
    title: "Uterus & Endometrium",
    color: "pink",
    description: "Site of menstrual cycle regulation and potential endometriosis",
    symptoms: ["Irregular bleeding", "Endometrial thickening", "Dysmenorrhea"],
    biology: "Chronic anovulation in PCOS leads to unopposed estrogen exposure, potentially causing endometrial hyperplasia. Endometriosis involves ectopic endometrial tissue.",
    pathways: ["Estrogen dominance", "Progesterone deficiency", "Inflammatory pathways"],
    relevance: "Monitoring endometrial thickness is important to prevent hyperplasia in anovulatory patients."
  },
  skin: {
    title: "Skin & Hair",
    color: "cyan",
    description: "Visible manifestations of hormonal imbalances",
    symptoms: ["Acne (jawline)", "Hirsutism", "Acanthosis nigricans"],
    biology: "Elevated androgens stimulate sebaceous glands and hair follicles. Insulin resistance causes skin darkening in body folds.",
    pathways: ["5α-reductase activity", "Androgen receptor sensitivity", "Insulin signaling"],
    relevance: "Clinical hyperandrogenism is a key diagnostic feature. Modified Ferriman-Gallwey score >8 indicates clinical hirsutism."
  },
  scalp: {
    title: "Scalp",
    color: "purple",
    description: "Site of androgenic alopecia and hormonal hair changes",
    symptoms: ["Female pattern hair loss", "Thinning at crown", "Widening part line"],
    biology: "Dihydrotestosterone (DHT) miniaturizes hair follicles over time, leading to progressive thinning.",
    pathways: ["DHT conversion", "Follicle miniaturization", "Hair growth cycle disruption"],
    relevance: "Androgenic alopecia can indicate hyperandrogenism and may warrant investigation for PCOS."
  },
  abdomen: {
    title: "Abdominal Region",
    color: "pink",
    description: "Central obesity and metabolic health indicators",
    symptoms: ["Visceral fat accumulation", "Insulin resistance markers", "Metabolic dysfunction"],
    biology: "Central adiposity is strongly linked to insulin resistance and cardiovascular risk in PCOS patients.",
    pathways: ["Adipokine dysregulation", "Hepatic insulin resistance", "Lipid metabolism"],
    relevance: "Waist circumference >88cm in women is a metabolic risk factor. Weight management is first-line treatment."
  }
}

export function BodyVisualization({ patientData }: BodyVisualizationProps) {
  const [selectedRegion, setSelectedRegion] = useState<BodyRegion>(null)
  const [hoveredRegion, setHoveredRegion] = useState<BodyRegion>(null)

  const getRegionRisk = (region: BodyRegion): "low" | "moderate" | "high" => {
    if (!region) return "low"
    
    switch (region) {
      case "ovaries":
        if (patientData.polycysticAppearance || 
            patientData.follicleCountLeft >= 12 || 
            patientData.follicleCountRight >= 12 ||
            patientData.ovaryVolumeLeft > 10 ||
            patientData.ovaryVolumeRight > 10) return "high"
        if (patientData.amh > 6 || patientData.lhFshRatio > 2) return "moderate"
        return "low"
      case "uterus":
        if (patientData.irregularPeriods && patientData.cycleLength > 45) return "high"
        if (patientData.irregularPeriods) return "moderate"
        return "low"
      case "skin":
        if (patientData.hirsutism || patientData.acne || patientData.skinDarkening) return "high"
        return "low"
      case "scalp":
        if (patientData.hairLoss) return "high"
        return "low"
      case "abdomen":
        if (patientData.homaIr > 2.9 || patientData.waistCircumference > 88) return "high"
        if (patientData.homaIr > 2 || patientData.bmi > 25) return "moderate"
        return "low"
      default:
        return "low"
    }
  }

  const getRiskColor = (risk: "low" | "moderate" | "high") => {
    switch (risk) {
      case "high": return "rgb(236, 72, 153)"
      case "moderate": return "rgb(234, 179, 8)"
      default: return "rgb(34, 197, 94)"
    }
  }

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
      {/* Body Visualization */}
      <Card className="glass border-purple-500/20 p-8 relative overflow-hidden">
        <h3 className="text-xl font-bold text-foreground mb-6">Interactive Body Map</h3>
        <p className="text-sm text-muted-foreground mb-8">
          Click on body regions to explore symptoms and affected pathways
        </p>
        
        <div className="relative aspect-[3/4] max-w-xs mx-auto">
          {/* Body Silhouette SVG */}
          <svg viewBox="0 0 200 300" className="w-full h-full">
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(168, 85, 247, 0.3)" />
                <stop offset="100%" stopColor="rgba(34, 211, 238, 0.3)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Body outline */}
            <path
              d="M100 20 
                 C120 20 130 30 130 40
                 L130 50
                 C145 55 155 65 155 80
                 L155 90 C160 95 165 100 165 115
                 L165 180 C165 190 160 195 155 200
                 L155 250 C155 260 150 270 145 275
                 L145 295 L130 295 L130 275
                 C125 270 120 265 115 260
                 L100 260
                 L85 260
                 C80 265 75 270 70 275
                 L70 295 L55 295 L55 275
                 C50 270 45 260 45 250
                 L45 200 C40 195 35 190 35 180
                 L35 115 C35 100 40 95 45 90
                 L45 80 C45 65 55 55 70 50
                 L70 40 C70 30 80 20 100 20"
              fill="url(#bodyGradient)"
              stroke="rgba(168, 85, 247, 0.5)"
              strokeWidth="1"
            />

            {/* Interactive regions */}
            {/* Scalp */}
            <ellipse
              cx="100" cy="30"
              rx="25" ry="15"
              fill={hoveredRegion === "scalp" || selectedRegion === "scalp" 
                ? getRiskColor(getRegionRisk("scalp")) 
                : "rgba(168, 85, 247, 0.2)"}
              stroke={getRiskColor(getRegionRisk("scalp"))}
              strokeWidth="2"
              filter={selectedRegion === "scalp" ? "url(#glow)" : undefined}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredRegion("scalp")}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion("scalp")}
              opacity={hoveredRegion === "scalp" || selectedRegion === "scalp" ? 0.8 : 0.4}
            />

            {/* Skin (face area) */}
            <circle
              cx="100" cy="50"
              r="12"
              fill={hoveredRegion === "skin" || selectedRegion === "skin"
                ? getRiskColor(getRegionRisk("skin"))
                : "rgba(34, 211, 238, 0.2)"}
              stroke={getRiskColor(getRegionRisk("skin"))}
              strokeWidth="2"
              filter={selectedRegion === "skin" ? "url(#glow)" : undefined}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredRegion("skin")}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion("skin")}
              opacity={hoveredRegion === "skin" || selectedRegion === "skin" ? 0.8 : 0.4}
            />

            {/* Abdomen */}
            <ellipse
              cx="100" cy="150"
              rx="35" ry="40"
              fill={hoveredRegion === "abdomen" || selectedRegion === "abdomen"
                ? getRiskColor(getRegionRisk("abdomen"))
                : "rgba(236, 72, 153, 0.2)"}
              stroke={getRiskColor(getRegionRisk("abdomen"))}
              strokeWidth="2"
              filter={selectedRegion === "abdomen" ? "url(#glow)" : undefined}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredRegion("abdomen")}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion("abdomen")}
              opacity={hoveredRegion === "abdomen" || selectedRegion === "abdomen" ? 0.8 : 0.4}
            />

            {/* Uterus */}
            <ellipse
              cx="100" cy="185"
              rx="18" ry="15"
              fill={hoveredRegion === "uterus" || selectedRegion === "uterus"
                ? getRiskColor(getRegionRisk("uterus"))
                : "rgba(236, 72, 153, 0.2)"}
              stroke={getRiskColor(getRegionRisk("uterus"))}
              strokeWidth="2"
              filter={selectedRegion === "uterus" ? "url(#glow)" : undefined}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredRegion("uterus")}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion("uterus")}
              opacity={hoveredRegion === "uterus" || selectedRegion === "uterus" ? 0.8 : 0.4}
            />

            {/* Ovaries (left and right) */}
            <circle
              cx="75" cy="180"
              r="10"
              fill={hoveredRegion === "ovaries" || selectedRegion === "ovaries"
                ? getRiskColor(getRegionRisk("ovaries"))
                : "rgba(168, 85, 247, 0.2)"}
              stroke={getRiskColor(getRegionRisk("ovaries"))}
              strokeWidth="2"
              filter={selectedRegion === "ovaries" ? "url(#glow)" : undefined}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredRegion("ovaries")}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion("ovaries")}
              opacity={hoveredRegion === "ovaries" || selectedRegion === "ovaries" ? 0.8 : 0.4}
            />
            <circle
              cx="125" cy="180"
              r="10"
              fill={hoveredRegion === "ovaries" || selectedRegion === "ovaries"
                ? getRiskColor(getRegionRisk("ovaries"))
                : "rgba(168, 85, 247, 0.2)"}
              stroke={getRiskColor(getRegionRisk("ovaries"))}
              strokeWidth="2"
              filter={selectedRegion === "ovaries" ? "url(#glow)" : undefined}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredRegion("ovaries")}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion("ovaries")}
              opacity={hoveredRegion === "ovaries" || selectedRegion === "ovaries" ? 0.8 : 0.4}
            />
          </svg>

          {/* Hotspot labels */}
          <div className="absolute top-[8%] left-1/2 -translate-x-1/2 text-xs text-purple-300">Scalp</div>
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 text-xs text-cyan-300">Skin</div>
          <div className="absolute top-[48%] left-1/2 -translate-x-1/2 text-xs text-pink-300">Abdomen</div>
          <div className="absolute top-[60%] left-1/2 -translate-x-1/2 text-xs text-pink-300">Uterus</div>
          <div className="absolute top-[58%] left-[30%] text-xs text-purple-300">Ovaries</div>
        </div>

        {/* Legend */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500" />
            <span className="text-muted-foreground">High Risk</span>
          </div>
        </div>
      </Card>

      {/* Region Details Panel */}
      <AnimatePresence mode="wait">
        {selectedRegion ? (
          <motion.div
            key={selectedRegion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`glass p-6 border-${regionData[selectedRegion].color}-500/30 h-full`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{regionData[selectedRegion].title}</h3>
                  <p className="text-muted-foreground">{regionData[selectedRegion].description}</p>
                </div>
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Risk Assessment */}
                <div className="glass rounded-xl p-4 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Risk Assessment</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      getRegionRisk(selectedRegion) === "high" 
                        ? "bg-pink-500/20 text-pink-300"
                        : getRegionRisk(selectedRegion) === "moderate"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-green-500/20 text-green-300"
                    }`}>
                      {getRegionRisk(selectedRegion).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Symptoms */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Associated Symptoms</h4>
                  <div className="flex flex-wrap gap-2">
                    {regionData[selectedRegion].symptoms.map((symptom) => (
                      <span
                        key={symptom}
                        className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Biological Explanation */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Biological Mechanism</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {regionData[selectedRegion].biology}
                  </p>
                </div>

                {/* Hormonal Pathways */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Affected Pathways</h4>
                  <div className="space-y-2">
                    {regionData[selectedRegion].pathways.map((pathway) => (
                      <div
                        key={pathway}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span className="text-muted-foreground">{pathway}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clinical Relevance */}
                <div className="glass rounded-xl p-4 border border-cyan-500/20">
                  <h4 className="text-sm font-semibold text-cyan-300 mb-2">Clinical Relevance</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {regionData[selectedRegion].relevance}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="glass border-purple-500/20 p-8 h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Select a Body Region</h3>
              <p className="text-muted-foreground max-w-xs">
                Click on any highlighted area of the body to learn about associated symptoms, biological mechanisms, and clinical relevance.
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
