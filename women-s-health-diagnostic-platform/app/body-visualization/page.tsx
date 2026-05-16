"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Activity, Brain, Dna, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/branding/logo";
import { Badge } from "@/components/ui/badge";
import {
  InteractiveBodyViewer,
  type SymptomHotspot,
} from "@/components/body-viewer/interactive-body-viewer";

interface SymptomData {
  id: string;
  name: string;
  region: string;
  description: string;
  severity: "mild" | "moderate" | "severe";
  symptoms: string[];
}

// Patient-specific symptom data based on PCOS diagnosis
const patientSymptomData: SymptomData[] = [
  {
    id: "scalp",
    name: "Scalp & Hair",
    region: "head",
    description: "Androgenic alopecia - Hair thinning at the crown and temples due to elevated DHT levels. Pattern consistent with hyperandrogenism.",
    severity: "moderate",
    symptoms: ["Diffuse hair thinning", "Receding hairline", "Increased shedding", "Oily scalp"],
  },
  {
    id: "face-acne",
    name: "Facial Acne",
    region: "face",
    description: "Hormonal acne concentrated along the jawline and chin - classic pattern associated with elevated androgens in PCOS.",
    severity: "moderate",
    symptoms: ["Cystic acne", "Inflammatory lesions", "Jawline breakouts", "Chin acne"],
  },
  {
    id: "hirsutism",
    name: "Hirsutism",
    region: "face",
    description: "Excess terminal hair growth in androgen-dependent areas. Ferriman-Gallwey score indicates moderate hirsutism.",
    severity: "mild",
    symptoms: ["Upper lip hair", "Chin hair", "Sideburn area", "Chest hair"],
  },
  {
    id: "thyroid",
    name: "Thyroid",
    region: "neck",
    description: "TSH levels within normal range but monitoring recommended. Thyroid dysfunction commonly co-occurs with PCOS.",
    severity: "mild",
    symptoms: ["Fatigue", "Cold intolerance", "Dry skin"],
  },
  {
    id: "abdomen",
    name: "Central Adiposity",
    region: "abdomen",
    description: "Visceral fat accumulation indicative of insulin resistance. Waist-to-hip ratio elevated. Key metabolic marker for PCOS.",
    severity: "moderate",
    symptoms: ["Abdominal weight gain", "Bloating", "Difficulty losing weight", "Insulin resistance markers"],
  },
  {
    id: "ovary-left",
    name: "Left Ovary",
    region: "reproductive",
    description: "Polycystic morphology confirmed via ultrasound. Volume: 12.3 mL. Antral follicle count: 14. Multiple peripheral follicles in 'string of pearls' pattern.",
    severity: "severe",
    symptoms: ["Multiple small follicles (2-9mm)", "Enlarged ovarian volume", "Peripheral follicle distribution", "Increased stromal echogenicity"],
  },
  {
    id: "ovary-right",
    name: "Right Ovary",
    region: "reproductive",
    description: "Polycystic morphology confirmed via ultrasound. Volume: 11.8 mL. Antral follicle count: 12. Evidence of anovulation.",
    severity: "severe",
    symptoms: ["Multiple small follicles (2-9mm)", "Enlarged ovarian volume", "Absent dominant follicle", "Thickened ovarian capsule"],
  },
  {
    id: "uterus",
    name: "Uterus",
    region: "reproductive",
    description: "Endometrial thickness: 8mm. Some irregularity noted. Prolonged anovulation may lead to endometrial hyperplasia - monitoring recommended.",
    severity: "moderate",
    symptoms: ["Irregular periods", "Heavy menstrual bleeding", "Prolonged cycles", "Amenorrhea episodes"],
  },
  {
    id: "pelvic",
    name: "Pelvic Region",
    region: "pelvis",
    description: "Chronic pelvic discomfort reported. May be related to ovarian enlargement or concurrent endometriosis (differential diagnosis).",
    severity: "mild",
    symptoms: ["Dull pelvic ache", "Discomfort during ovulation", "Lower back pain"],
  },
  {
    id: "skin-tags",
    name: "Acanthosis Nigricans",
    region: "neck-skin",
    description: "Darkened, velvety skin patches in neck folds and underarms - classic sign of insulin resistance and hyperinsulinemia.",
    severity: "moderate",
    symptoms: ["Dark skin patches", "Velvety texture", "Neck folds affected", "Axillary involvement"],
  },
];

const bodyViewerCoordinates: Record<
  string,
  Pick<SymptomHotspot, "x" | "y" | "zoomArea" | "region">
> = {
  scalp: { x: 200, y: 45, region: "scalp", zoomArea: { x: 200, y: 80, scale: 3 } },
  "face-acne": { x: 200, y: 95, region: "face", zoomArea: { x: 200, y: 100, scale: 3.5 } },
  hirsutism: { x: 190, y: 105, region: "face", zoomArea: { x: 190, y: 105, scale: 3.5 } },
  thyroid: { x: 200, y: 155, region: "neck", zoomArea: { x: 200, y: 160, scale: 3 } },
  abdomen: { x: 200, y: 320, region: "abdomen", zoomArea: { x: 200, y: 320, scale: 2.5 } },
  "ovary-left": { x: 160, y: 390, region: "reproductive", zoomArea: { x: 170, y: 400, scale: 3.5 } },
  "ovary-right": { x: 240, y: 390, region: "reproductive", zoomArea: { x: 230, y: 400, scale: 3.5 } },
  uterus: { x: 200, y: 420, region: "reproductive", zoomArea: { x: 200, y: 420, scale: 3.2 } },
  pelvic: { x: 200, y: 455, region: "pelvis", zoomArea: { x: 200, y: 455, scale: 2.8 } },
  "skin-tags": { x: 220, y: 165, region: "neck", zoomArea: { x: 220, y: 165, scale: 3 } },
};

const bodyViewerSymptoms: SymptomHotspot[] = patientSymptomData.map((symptom) => {
  const coordinates = bodyViewerCoordinates[symptom.id];

  return {
    id: symptom.id,
    name: symptom.name,
    region: coordinates.region,
    x: coordinates.x,
    y: coordinates.y,
    severity: symptom.severity,
    description: symptom.description,
    relatedSymptoms: symptom.symptoms,
    zoomArea: coordinates.zoomArea,
  };
});

export default function BodyVisualizationPage() {
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomHotspot | null>(null);

  const severeFindings = patientSymptomData.filter((symptom) => symptom.severity === "severe").length;
  const affectedRegions = patientSymptomData.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 bg-mesh opacity-30 pointer-events-none" />
      
      {/* Header */}
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
                  <span>Body Visualization</span>
                </h1>
                <p className="text-sm text-muted-foreground">Interactive Symptom Mapping</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/30 text-primary">
                <Activity className="h-3 w-3 mr-1" />
                Live Analysis
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Visualization */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-[700px]"
            >
              <InteractiveBodyViewer
                symptoms={bodyViewerSymptoms}
                onSymptomSelect={setSelectedSymptom}
              />
            </motion.div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Patient Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6 border border-border/50"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Analysis Summary
              </h2>
              
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Primary Diagnosis</span>
                    <Badge className="bg-primary/20 text-primary border-primary/30">High Confidence</Badge>
                  </div>
                  <p className="text-lg font-bold text-primary">PCOS - Phenotype A</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hyperandrogenism + Oligo/Anovulation + Polycystic Ovaries
                  </p>
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
            </motion.div>

            {/* Symptom Categories */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6 border border-border/50"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Dna className="h-5 w-5 text-secondary" />
                Symptom Categories
              </h2>
              
              <div className="space-y-3">
                {[
                  { name: "Reproductive", count: 3, color: "bg-primary" },
                  { name: "Dermatological", count: 3, color: "bg-accent" },
                  { name: "Metabolic", count: 2, color: "bg-secondary" },
                  { name: "Hormonal", count: 2, color: "bg-purple-500" },
                ].map((category) => (
                  <div key={category.name} className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <Badge variant="outline">{category.count} findings</Badge>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6 border border-border/50"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                Actions
              </h2>
              
              <div className="space-y-3">
                <Link href="/analysis">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    View Full Analysis
                  </Button>
                </Link>
                <Button variant="outline" className="w-full border-secondary/50 text-secondary hover:bg-secondary/10">
                  Download Report
                </Button>
                <Button variant="outline" className="w-full border-accent/50 text-accent hover:bg-accent/10">
                  Share with Clinician
                </Button>
              </div>
            </motion.div>

            {/* Selected Symptom Detail (if any) */}
            {selectedSymptom && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl p-6 border border-primary/30"
              >
                <h3 className="font-semibold mb-2">{selectedSymptom.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{selectedSymptom.description}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptom.relatedSymptoms.slice(0, 3).map((s, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
