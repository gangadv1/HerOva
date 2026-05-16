"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import type { PatientData } from "../patient-analysis"

interface FormProps {
  data: PatientData
  updateData: (data: Partial<PatientData>) => void
}

export function MetabolicIndicatorsForm({ data, updateData }: FormProps) {
  return (
    <div className="grid gap-6">
      {/* Glucose & Insulin */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="glucose" className="text-foreground">Fasting Glucose (mg/dL)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="glucose"
              value={[data.fastingGlucose]}
              onValueChange={([value]) => updateData({ fastingGlucose: value })}
              min={60}
              max={200}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.fastingGlucose}
              onChange={(e) => updateData({ fastingGlucose: Number(e.target.value) })}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
          <p className={`text-xs ${
            data.fastingGlucose < 100 ? "text-green-400" :
            data.fastingGlucose < 126 ? "text-yellow-400" : "text-pink-400"
          }`}>
            {data.fastingGlucose < 100 ? "Normal" :
             data.fastingGlucose < 126 ? "Pre-diabetic range" : "Diabetic range"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="insulin" className="text-foreground">Fasting Insulin (µIU/mL)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="insulin"
              value={[data.insulinLevel]}
              onValueChange={([value]) => {
                const homaIr = Number(((value * data.fastingGlucose) / 405).toFixed(1))
                updateData({ insulinLevel: value, homaIr })
              }}
              min={2}
              max={50}
              step={0.5}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.insulinLevel}
              onChange={(e) => {
                const insulin = Number(e.target.value)
                const homaIr = Number(((insulin * data.fastingGlucose) / 405).toFixed(1))
                updateData({ insulinLevel: insulin, homaIr })
              }}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
        </div>
      </div>

      {/* HOMA-IR */}
      <div className="glass rounded-xl p-6 border border-cyan-500/20">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-foreground text-lg">HOMA-IR (Insulin Resistance)</Label>
          <span className={`font-mono text-xl ${
            data.homaIr < 2 ? "text-green-400" :
            data.homaIr < 2.9 ? "text-yellow-400" : "text-pink-400"
          }`}>
            {data.homaIr}
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-pink-500"
            style={{ width: `${Math.min(data.homaIr / 5 * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {data.homaIr < 2 ? "Normal insulin sensitivity" :
           data.homaIr < 2.9 ? "Borderline insulin resistance" :
           "Significant insulin resistance"}
        </p>
      </div>

      {/* Waist & Blood Pressure */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="waist" className="text-foreground">Waist Circumference (cm)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="waist"
              value={[data.waistCircumference]}
              onValueChange={([value]) => updateData({ waistCircumference: value })}
              min={50}
              max={150}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.waistCircumference}
              onChange={(e) => updateData({ waistCircumference: Number(e.target.value) })}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
          <p className={`text-xs ${data.waistCircumference <= 88 ? "text-green-400" : "text-yellow-400"}`}>
            {data.waistCircumference <= 88 ? "Normal" : "Elevated (>88cm for women)"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="systolic" className="text-foreground">Systolic BP (mmHg)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="systolic"
              value={[data.bloodPressureSystolic]}
              onValueChange={([value]) => updateData({ bloodPressureSystolic: value })}
              min={80}
              max={180}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.bloodPressureSystolic}
              onChange={(e) => updateData({ bloodPressureSystolic: Number(e.target.value) })}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="diastolic" className="text-foreground">Diastolic BP (mmHg)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="diastolic"
              value={[data.bloodPressureDiastolic]}
              onValueChange={([value]) => updateData({ bloodPressureDiastolic: value })}
              min={50}
              max={120}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.bloodPressureDiastolic}
              onChange={(e) => updateData({ bloodPressureDiastolic: Number(e.target.value) })}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
