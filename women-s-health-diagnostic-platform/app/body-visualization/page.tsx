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
import { bodyViewerSymptoms, patientSymptomData, buildSymptomsForPatient } from "@/components/body-viewer/pcos-body-viewer-data";

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
                symptoms={buildSymptomsForPatient(null, null)}
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
