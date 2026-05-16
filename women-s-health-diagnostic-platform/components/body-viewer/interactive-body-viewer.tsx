"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  AlertTriangle,
  ChevronRight,
  X,
  Maximize2,
} from "lucide-react";

export interface SymptomHotspot {
  id: string;
  name: string;
  region: string;
  x: number;
  y: number;
  severity: "mild" | "moderate" | "severe";
  description: string;
  relatedSymptoms: string[];
  zoomArea: {
    x: number;
    y: number;
    scale: number;
  };
}

const defaultSymptoms: SymptomHotspot[] = [
  {
    id: "scalp",
    name: "Scalp - Hair Loss",
    region: "scalp",
    x: 200,
    y: 45,
    severity: "moderate",
    description:
      "Androgenic alopecia presenting as diffuse thinning at the crown and temporal regions. Pattern consistent with hormonal imbalance due to elevated androgens.",
    relatedSymptoms: [
      "Male-pattern hair thinning",
      "Increased hair shedding",
      "Widening part line",
      "Receding hairline",
    ],
    zoomArea: { x: 200, y: 80, scale: 3 },
  },
  {
    id: "face",
    name: "Face - Acne & Hirsutism",
    region: "face",
    x: 200,
    y: 95,
    severity: "severe",
    description:
      "Hormonal acne concentrated along jawline and chin area. Hirsutism observed on upper lip, chin, and sideburn areas indicating elevated androgen levels.",
    relatedSymptoms: [
      "Cystic acne on jawline",
      "Excess facial hair",
      "Oily skin",
      "Dark coarse hair on chin",
    ],
    zoomArea: { x: 200, y: 100, scale: 3.5 },
  },
  {
    id: "thyroid",
    name: "Thyroid Region",
    region: "neck",
    x: 200,
    y: 155,
    severity: "mild",
    description:
      "Thyroid function assessment recommended. PCOS patients have 3x higher incidence of thyroid dysfunction including Hashimoto's thyroiditis.",
    relatedSymptoms: [
      "Fatigue",
      "Weight fluctuations",
      "Temperature sensitivity",
      "Dry skin",
    ],
    zoomArea: { x: 200, y: 160, scale: 3 },
  },
  {
    id: "chest",
    name: "Chest & Breast",
    region: "chest",
    x: 200,
    y: 220,
    severity: "mild",
    description:
      "Hormonal fluctuations may cause breast tenderness, fibrocystic changes, and cyclical pain related to menstrual irregularities.",
    relatedSymptoms: [
      "Breast tenderness",
      "Cyclical pain",
      "Fibrocystic changes",
    ],
    zoomArea: { x: 200, y: 230, scale: 2.5 },
  },
  {
    id: "skin-arms",
    name: "Skin - Acanthosis Nigricans",
    region: "arms",
    x: 118,
    y: 280,
    severity: "moderate",
    description:
      "Dark, velvety patches indicating insulin resistance. Commonly found in skin folds including armpits, neck creases, and groin area.",
    relatedSymptoms: [
      "Hyperpigmentation in folds",
      "Skin tags",
      "Velvety texture",
      "Insulin resistance marker",
    ],
    zoomArea: { x: 130, y: 260, scale: 2.8 },
  },
  {
    id: "abdomen",
    name: "Abdomen - Central Adiposity",
    region: "abdomen",
    x: 200,
    y: 320,
    severity: "moderate",
    description:
      "Central adiposity with increased visceral fat distribution. Waist-to-hip ratio indicates metabolic risk. Apple-shaped body pattern common in PCOS.",
    relatedSymptoms: [
      "Visceral fat accumulation",
      "Insulin resistance",
      "Difficulty losing weight",
      "Bloating",
    ],
    zoomArea: { x: 200, y: 320, scale: 2.5 },
  },
  {
    id: "ovary-left",
    name: "Left Ovary - Polycystic",
    region: "reproductive",
    x: 160,
    y: 390,
    severity: "severe",
    description:
      "Polycystic morphology detected. Multiple peripheral follicles (>12) with increased stromal echogenicity. Classic 'string of pearls' appearance on ultrasound.",
    relatedSymptoms: [
      "Follicle count: 18",
      "Ovarian volume: 12.4 mL",
      "Peripheral distribution",
      "Thickened capsule",
    ],
    zoomArea: { x: 170, y: 400, scale: 3.5 },
  },
  {
    id: "ovary-right",
    name: "Right Ovary - Polycystic",
    region: "reproductive",
    x: 240,
    y: 390,
    severity: "severe",
    description:
      "Polycystic morphology confirmed. String of pearls appearance with thickened capsule. Bilateral polycystic ovaries meeting Rotterdam criteria.",
    relatedSymptoms: [
      "Follicle count: 22",
      "Ovarian volume: 14.1 mL",
      "Thickened stroma",
      "Anovulation",
    ],
    zoomArea: { x: 230, y: 400, scale: 3.5 },
  },
  {
    id: "uterus",
    name: "Uterus - Menstrual Issues",
    region: "reproductive",
    x: 200,
    y: 420,
    severity: "moderate",
    description:
      "Endometrial thickness assessment shows irregular pattern consistent with anovulatory cycles. Risk of endometrial hyperplasia with prolonged anovulation.",
    relatedSymptoms: [
      "Oligomenorrhea",
      "Irregular cycle length",
      "Heavy periods",
      "Amenorrhea",
    ],
    zoomArea: { x: 200, y: 420, scale: 3.2 },
  },
  {
    id: "legs",
    name: "Lower Body - Hirsutism",
    region: "legs",
    x: 200,
    y: 580,
    severity: "mild",
    description:
      "Excess hair growth on thighs and lower legs indicating hyperandrogenism. Monitor for circulation issues related to metabolic syndrome.",
    relatedSymptoms: [
      "Dark coarse hair on thighs",
      "Excess leg hair",
      "Slower circulation",
    ],
    zoomArea: { x: 200, y: 550, scale: 2 },
  },
];

interface InteractiveBodyViewerProps {
  symptoms?: SymptomHotspot[];
  onSymptomSelect?: (symptom: SymptomHotspot) => void;
}

export function InteractiveBodyViewer({
  symptoms = defaultSymptoms,
  onSymptomSelect,
}: InteractiveBodyViewerProps) {
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomHotspot | null>(null);
  const [hoveredSymptom, setHoveredSymptom] = useState<string | null>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 400, height: 700 });
  const [isZoomed, setIsZoomed] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleSymptomClick = (symptom: SymptomHotspot) => {
    setSelectedSymptom(symptom);
    onSymptomSelect?.(symptom);

    // Zoom to affected area
    const zoomWidth = 400 / symptom.zoomArea.scale;
    const zoomHeight = 700 / symptom.zoomArea.scale;
    setViewBox({
      x: symptom.zoomArea.x - zoomWidth / 2,
      y: symptom.zoomArea.y - zoomHeight / 2,
      width: zoomWidth,
      height: zoomHeight,
    });
    setIsZoomed(true);
  };

  const handleReset = () => {
    setViewBox({ x: 0, y: 0, width: 400, height: 700 });
    setIsZoomed(false);
    setSelectedSymptom(null);
  };

  const handleZoomIn = () => {
    setViewBox((prev) => ({
      x: prev.x + prev.width * 0.125,
      y: prev.y + prev.height * 0.125,
      width: prev.width * 0.75,
      height: prev.height * 0.75,
    }));
    setIsZoomed(true);
  };

  const handleZoomOut = () => {
    const newWidth = Math.min(viewBox.width * 1.33, 400);
    const newHeight = Math.min(viewBox.height * 1.33, 700);
    setViewBox({
      x: Math.max(0, viewBox.x - (newWidth - viewBox.width) / 2),
      y: Math.max(0, viewBox.y - (newHeight - viewBox.height) / 2),
      width: newWidth,
      height: newHeight,
    });
    if (newWidth >= 400) setIsZoomed(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "severe":
        return { fill: "#ec4899", stroke: "#ec4899", glow: "0 0 20px rgba(236, 72, 153, 0.8)" };
      case "moderate":
        return { fill: "#a855f7", stroke: "#a855f7", glow: "0 0 20px rgba(168, 85, 247, 0.8)" };
      case "mild":
        return { fill: "#22d3ee", stroke: "#22d3ee", glow: "0 0 20px rgba(34, 211, 238, 0.8)" };
      default:
        return { fill: "#a855f7", stroke: "#a855f7", glow: "0 0 20px rgba(168, 85, 247, 0.8)" };
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto">
      {/* Main Body Viewer */}
      <div className="flex-1 relative">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
          {/* Controls */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={handleZoomIn}
              className="bg-background/80 backdrop-blur-sm border-purple-500/30 hover:border-purple-500/60"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={handleZoomOut}
              className="bg-background/80 backdrop-blur-sm border-purple-500/30 hover:border-purple-500/60"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={handleReset}
              className="bg-background/80 backdrop-blur-sm border-purple-500/30 hover:border-purple-500/60"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Zoom indicator */}
          <div className="absolute top-4 right-4 z-20">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-cyan-500/30">
              {Math.round((400 / viewBox.width) * 100)}% zoom
            </Badge>
          </div>

          {/* Body SVG Container */}
          <div className="relative w-full aspect-[4/7] min-h-[600px] overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-background to-cyan-950/30" />

            {/* Animated background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
            </div>

            <svg
              ref={svgRef}
              viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
              className="w-full h-full relative z-10"
              preserveAspectRatio="xMidYMid meet"
              style={{ transition: "viewBox 0.5s ease-out" }}
            >
              <defs>
                {/* Gradient for body outline */}
                <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9" />
                  <stop offset="30%" stopColor="#22d3ee" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#ec4899" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9" />
                </linearGradient>

                {/* Glow filter for body */}
                <filter id="bodyGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Hotspot glow filters */}
                <filter id="hotspotGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Elegant Female Body Silhouette - Clean anatomical outline */}
              <g filter="url(#bodyGlow)">
                <path
                  d="
                    M 200 25
                    C 175 25, 160 45, 160 70
                    C 160 95, 175 115, 200 115
                    C 225 115, 240 95, 240 70
                    C 240 45, 225 25, 200 25
                    Z
                  "
                  fill="none"
                  stroke="url(#bodyGradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                />

                {/* Neck */}
                <path
                  d="
                    M 185 115
                    C 185 125, 183 140, 180 155
                    M 215 115
                    C 215 125, 217 140, 220 155
                  "
                  fill="none"
                  stroke="url(#bodyGradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Shoulders and Torso (narrower shoulders, broader lower torso) */}
                <path
                  d="
                    M 197 155
                    C 182 158, 146 165, 126 180
                    C 112 192, 106 210, 110 240
                    L 114 300
                    C 116 320, 120 340, 124 360
                    
                    M 203 155
                    C 218 158, 254 165, 274 180
                    C 288 192, 294 210, 290 240
                    L 286 300
                    C 284 320, 280 340, 276 360
                  "
                  fill="none"
                  stroke="url(#bodyGradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Arms - Left (moved inward) */}
                <path
                  d="
                    M 126 180
                    C 110 190, 90 220, 84 260
                    C 79 300, 79 340, 84 380
                    C 87 410, 89 440, 87 470
                    L 84 500
                    C 82 515, 79 525, 81 530
                    C 84 540, 94 542, 99 538
                    C 104 535, 107 525, 109 510
                    L 114 470
                  "
                  fill="none"
                  stroke="url(#bodyGradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Arms - Right (moved inward) */}
                <path
                  d="
                    M 274 180
                    C 290 190, 310 220, 316 260
                    C 321 300, 321 340, 316 380
                    C 313 410, 311 440, 313 470
                    L 316 500
                    C 318 515, 321 525, 319 530
                    C 316 540, 306 542, 301 538
                    C 296 535, 293 525, 291 510
                    L 286 470
                  "
                  fill="none"
                  stroke="url(#bodyGradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Torso sides continuing to hips (broader around the ovary region) */}
                <path
                  d="
                    M 116 360
                    C 121 382, 135 402, 148 424
                    C 158 442, 166 460, 171 480
                    
                    M 284 360
                    C 279 382, 265 402, 252 424
                    C 242 442, 234 460, 229 480
                  "
                  fill="none"
                  stroke="url(#bodyGradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Inner torso lines - chest (adjusted) */}
                <path
                  d="
                    M 193 160
                    C 197 180, 201 200, 201 220
                    C 201 250, 196 280, 192 300
                    L 188 340
                    C 184 370, 183 400, 188 430
                    C 191 450, 195 465, 198 475
                    
                    M 207 160
                    C 203 180, 199 200, 199 220
                    C 199 250, 204 280, 208 300
                    L 212 340
                    C 216 370, 217 400, 212 430
                    C 209 450, 205 465, 202 475
                  "
                  fill="none"
                  stroke="url(#bodyGradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Pelvis/Hip area */}
                <path
                  d="
                    M 148 481
                    C 160 487, 179 493, 200 493
                    C 221 493, 240 487, 252 481
                  "
                  fill="none"
                  stroke="url(#bodyGradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Legs - Left */}
                <path
                  d="
                    M 168 481
                    C 164 499, 160 519, 156 546
                    C 152 586, 150 626, 148 666
                    C 146 697, 143 725, 138 755
                    C 136 773, 133 793, 130 813
                    L 128 833
                    C 126 853, 123 868, 118 878
                    C 113 888, 103 893, 94 891
                    L 90 888
                    C 85 885, 85 878, 90 873
                    L 104 868
                    C 114 863, 119 853, 121 838
                    L 124 813
                  "
                  fill="none"
                  stroke="url(#bodyGradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Legs - Right */}
                <path
                  d="
                    M 232 481
                    C 236 499, 240 519, 244 546
                    C 248 586, 250 626, 252 666
                    C 254 697, 257 725, 262 755
                    C 264 773, 267 793, 270 813
                    L 272 833
                    C 274 853, 277 868, 282 878
                    C 287 888, 297 893, 306 891
                    L 310 888
                    C 315 885, 315 878, 310 873
                    L 296 868
                    C 286 863, 281 853, 279 838
                    L 276 813
                  "
                  fill="none"
                  stroke="url(#bodyGradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Inner leg lines */}
                <path
                  d="
                    M 168 491
                    L 164 546
                    C 162 586, 161 626, 162 666
                    C 163 706, 166 746, 169 786
                    L 172 826
                    
                    M 232 491
                    L 236 546
                    C 238 586, 239 626, 238 666
                    C 237 706, 234 746, 231 786
                    L 228 826
                  "
                  fill="none"
                  stroke="url(#bodyGradient)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0.6"
                />

                {/* Subtle anatomical details - collarbone */}
                <path
                  d="
                    M 130 175
                    Q 165 165, 200 168
                    Q 235 165, 270 175
                  "
                  fill="none"
                  stroke="url(#bodyGradient)"
                  strokeWidth="0.8"
                  opacity="0.5"
                />

                {/* Waist definition */}
                <path
                  d="
                    M 126 340
                    Q 166 334, 200 337
                    Q 234 334, 274 340
                  "
                  fill="none"
                  stroke="url(#bodyGradient)"
                  strokeWidth="0.8"
                  opacity="0.4"
                />

                {/* Hip bones */}
                <path
                  d="
                    M 138 430
                    Q 169 419, 200 421
                    Q 231 419, 262 430
                  "
                  fill="none"
                  stroke="url(#bodyGradient)"
                  strokeWidth="0.8"
                  opacity="0.4"
                />
              </g>

              {/* Internal organ outlines - subtle */}
              <g opacity="0.3">
                {/* Ovaries */}
                <ellipse cx="160" cy="400" rx="15" ry="10" fill="none" stroke="#ec4899" strokeWidth="0.8" />
                <ellipse cx="240" cy="400" rx="15" ry="10" fill="none" stroke="#ec4899" strokeWidth="0.8" />
                
                {/* Uterus outline */}
                <path
                  d="M 175 395 Q 200 380 225 395 L 220 420 Q 200 435 180 420 Z"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="0.8"
                />
              </g>

              {/* Symptom Hotspots */}
              {symptoms.map((symptom) => {
                const colors = getSeverityColor(symptom.severity);
                const isHovered = hoveredSymptom === symptom.id;
                const isSelected = selectedSymptom?.id === symptom.id;
                const isActive = isHovered || isSelected;

                return (
                  <g key={symptom.id} className="cursor-pointer">
                    {/* Outer pulse ring */}
                    <circle
                      cx={symptom.x}
                      cy={symptom.y}
                      r={isActive ? 18 : 14}
                      fill="none"
                      stroke={colors.stroke}
                      strokeWidth="1"
                      opacity="0.3"
                      className="animate-ping"
                      style={{ transformOrigin: `${symptom.x}px ${symptom.y}px` }}
                    />

                    {/* Middle glow ring */}
                    <circle
                      cx={symptom.x}
                      cy={symptom.y}
                      r={isActive ? 14 : 10}
                      fill={colors.fill}
                      opacity="0.2"
                      filter="url(#hotspotGlow)"
                    />

                    {/* Main hotspot */}
                    <circle
                      cx={symptom.x}
                      cy={symptom.y}
                      r={isActive ? 10 : 7}
                      fill={colors.fill}
                      opacity={isActive ? 0.9 : 0.7}
                      filter="url(#hotspotGlow)"
                      onClick={() => handleSymptomClick(symptom)}
                      onMouseEnter={() => setHoveredSymptom(symptom.id)}
                      onMouseLeave={() => setHoveredSymptom(null)}
                      style={{
                        transition: "r 0.2s ease, opacity 0.2s ease",
                        cursor: "pointer",
                      }}
                    />

                    {/* Inner bright core */}
                    <circle
                      cx={symptom.x}
                      cy={symptom.y}
                      r={isActive ? 4 : 3}
                      fill="white"
                      opacity={isActive ? 1 : 0.8}
                      style={{ pointerEvents: "none" }}
                    />

                    {/* Crosshair lines for active state */}
                    {isActive && (
                      <g opacity="0.6" stroke={colors.stroke} strokeWidth="0.5">
                        <line x1={symptom.x - 25} y1={symptom.y} x2={symptom.x - 15} y2={symptom.y} />
                        <line x1={symptom.x + 15} y1={symptom.y} x2={symptom.x + 25} y2={symptom.y} />
                        <line x1={symptom.x} y1={symptom.y - 25} x2={symptom.x} y2={symptom.y - 15} />
                        <line x1={symptom.x} y1={symptom.y + 15} x2={symptom.x} y2={symptom.y + 25} />
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover tooltip */}
            <AnimatePresence>
              {hoveredSymptom && !selectedSymptom && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30"
                >
                  <div className="bg-background/95 backdrop-blur-sm border border-purple-500/30 rounded-lg px-4 py-2 shadow-lg shadow-purple-500/10">
                    <p className="text-sm font-medium text-foreground">
                      {symptoms.find((s) => s.id === hoveredSymptom)?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">Click to zoom and view details</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-border/50 bg-background/50">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                <span className="text-muted-foreground">Severe</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                <span className="text-muted-foreground">Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                <span className="text-muted-foreground">Mild</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Symptom Details Panel */}
      <div className="w-full lg:w-96">
        <AnimatePresence mode="wait">
          {selectedSymptom ? (
            <motion.div
              key={selectedSymptom.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge
                        className={`mb-2 ${
                          selectedSymptom.severity === "severe"
                            ? "bg-pink-500/20 text-pink-400 border-pink-500/50"
                            : selectedSymptom.severity === "moderate"
                            ? "bg-purple-500/20 text-purple-400 border-purple-500/50"
                            : "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                        }`}
                      >
                        {selectedSymptom.severity.toUpperCase()} SEVERITY
                      </Badge>
                      <h3 className="text-xl font-semibold text-foreground">
                        {selectedSymptom.name}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {selectedSymptom.region} Region
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleReset}
                      className="text-muted-foreground hover:text-foreground hover:bg-purple-500/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                      <div className="flex items-start gap-2 mb-2">
                        <Info className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                        <p className="text-sm font-medium text-foreground">Clinical Assessment</p>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedSymptom.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-cyan-400" />
                        Associated Findings
                      </h4>
                      <ul className="space-y-2">
                        {selectedSymptom.relatedSymptoms.map((symptom, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <ChevronRight className="w-3 h-3 text-pink-400" />
                            {symptom}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                      onClick={handleReset}
                    >
                      <Maximize2 className="w-4 h-4 mr-2" />
                      View Full Body
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Symptom Map</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click on any glowing marker to zoom into the affected area and view detailed clinical information.
                  </p>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {symptoms.map((symptom) => (
                      <button
                        key={symptom.id}
                        onClick={() => handleSymptomClick(symptom)}
                        className="w-full p-3 rounded-lg bg-muted/20 hover:bg-purple-500/10 border border-border/50 hover:border-purple-500/50 transition-all text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                symptom.severity === "severe"
                                  ? "bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]"
                                  : symptom.severity === "moderate"
                                  ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                                  : "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                              }`}
                            />
                            <span className="text-sm font-medium text-foreground">{symptom.name}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-purple-400 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default InteractiveBodyViewer;
