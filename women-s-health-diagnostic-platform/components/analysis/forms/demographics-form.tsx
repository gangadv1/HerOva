"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PatientData } from "../patient-analysis"

interface FormProps {
  data: PatientData
  updateData: (data: Partial<PatientData>) => void
}

export function DemographicsForm({ data, updateData }: FormProps) {
  const calculateBMI = (weight: number, height: number) => {
    const heightM = height / 100
    return Number((weight / (heightM * heightM)).toFixed(1))
  }

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="age" className="text-foreground">Age (years)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="age"
              value={[data.age]}
              onValueChange={([value]) => updateData({ age: value })}
              min={18}
              max={50}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.age}
              onChange={(e) => updateData({ age: Number(e.target.value) })}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ethnicity" className="text-foreground">Ethnicity</Label>
          <Select value={data.ethnicity} onValueChange={(value) => updateData({ ethnicity: value })}>
            <SelectTrigger className="bg-muted/50 border-purple-500/30">
              <SelectValue placeholder="Select ethnicity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="caucasian">Caucasian</SelectItem>
              <SelectItem value="african">African/African American</SelectItem>
              <SelectItem value="hispanic">Hispanic/Latino</SelectItem>
              <SelectItem value="asian">Asian</SelectItem>
              <SelectItem value="south-asian">South Asian</SelectItem>
              <SelectItem value="middle-eastern">Middle Eastern</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="weight" className="text-foreground">Weight (kg)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="weight"
              value={[data.weight]}
              onValueChange={([value]) => {
                const bmi = calculateBMI(value, data.height)
                updateData({ weight: value, bmi })
              }}
              min={40}
              max={150}
              step={0.5}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.weight}
              onChange={(e) => {
                const weight = Number(e.target.value)
                const bmi = calculateBMI(weight, data.height)
                updateData({ weight, bmi })
              }}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="height" className="text-foreground">Height (cm)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="height"
              value={[data.height]}
              onValueChange={([value]) => {
                const bmi = calculateBMI(data.weight, value)
                updateData({ height: value, bmi })
              }}
              min={140}
              max={200}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.height}
              onChange={(e) => {
                const height = Number(e.target.value)
                const bmi = calculateBMI(data.weight, height)
                updateData({ height, bmi })
              }}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Calculated BMI</Label>
          <div className="h-10 px-3 rounded-md bg-muted/50 border border-purple-500/30 flex items-center">
            <span className={`font-mono ${
              data.bmi < 18.5 ? "text-cyan-400" :
              data.bmi < 25 ? "text-green-400" :
              data.bmi < 30 ? "text-yellow-400" :
              "text-pink-400"
            }`}>
              {data.bmi}
            </span>
            <span className="text-muted-foreground ml-2 text-sm">kg/m²</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {data.bmi < 18.5 ? "Underweight" :
             data.bmi < 25 ? "Normal weight" :
             data.bmi < 30 ? "Overweight" : "Obese"}
          </p>
        </div>
      </div>
    </div>
  )
}
