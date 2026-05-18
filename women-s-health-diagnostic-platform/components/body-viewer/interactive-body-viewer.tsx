"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BodyVisualization } from "@/components/analysis/body-visualization";
import type { PatientData } from "@/components/analysis/patient-analysis";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function InteractiveBodyViewer() {
  // This component now renders the canonical BodyVisualization after single-patient analysis.
  // It no longer implements a separate interactive SVG. Pages that need to show
  // a body view should render this component after analysis is complete.
  const examplePatient = {
    age: 28,
    weight: 65,
    height: 165,
    bmi: 23.9,
    ethnicity: "",
    cycleLength: 35,
    cycleLengthVariability: "moderate",
    periodDuration: 5,
    ageAtMenarche: 13,
    irregularPeriods: false,
    acne: false,
    acneSeverity: "none",
    hirsutism: false,
    hirsutismScore: 0,
    hairLoss: false,
    skinDarkening: false,
    fastingGlucose: 95,
    insulinLevel: 12,
    homaIr: 2.0,
    waistCircumference: 80,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    ovaryVolumeLeft: 8,
    ovaryVolumeRight: 8,
    follicleCountLeft: 8,
    follicleCountRight: 8,
    polycysticAppearance: false,
    endometrialThickness: 8,
    lh: 8,
    fsh: 5,
    lhFshRatio: 1.6,
    totalTestosterone: 40,
    freeTestosterone: 2.0,
    dheas: 200,
    amh: 3.0,
    prolactin: 12,
    tsh: 2.0,
  } as PatientData;

  return (
    <div className="w-full">
      <BodyVisualization patientData={examplePatient} />
    </div>
  );
}
