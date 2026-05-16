"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PatientData } from "../patient-analysis"

interface FormProps {
  data: PatientData
  updateData: (data: Partial<PatientData>) => void
}

export function MenstrualHealthForm({ data, updateData }: FormProps) {
  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="cycleLength" className="text-foreground">Average Cycle Length (days)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="cycleLength"
              value={[data.cycleLength]}
              onValueChange={([value]) => updateData({ cycleLength: value })}
              min={21}
              max={90}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.cycleLength}
              onChange={(e) => updateData({ cycleLength: Number(e.target.value) })}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Normal: 21-35 days. {">"} 35 days may indicate oligomenorrhea
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="variability" className="text-foreground">Cycle Length Variability</Label>
          <Select 
            value={data.cycleLengthVariability} 
            onValueChange={(value) => updateData({ cycleLengthVariability: value })}
          >
            <SelectTrigger className="bg-muted/50 border-purple-500/30">
              <SelectValue placeholder="Select variability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular (±2 days)</SelectItem>
              <SelectItem value="mild">Mildly Variable (±3-5 days)</SelectItem>
              <SelectItem value="moderate">Moderately Variable (±6-9 days)</SelectItem>
              <SelectItem value="irregular">Highly Irregular (±10+ days)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="periodDuration" className="text-foreground">Period Duration (days)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="periodDuration"
              value={[data.periodDuration]}
              onValueChange={([value]) => updateData({ periodDuration: value })}
              min={1}
              max={10}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.periodDuration}
              onChange={(e) => updateData({ periodDuration: Number(e.target.value) })}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="menarche" className="text-foreground">Age at Menarche</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="menarche"
              value={[data.ageAtMenarche]}
              onValueChange={([value]) => updateData({ ageAtMenarche: value })}
              min={8}
              max={18}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.ageAtMenarche}
              onChange={(e) => updateData({ ageAtMenarche: Number(e.target.value) })}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-4 border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="irregular" className="text-foreground">History of Irregular Periods</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Fewer than 8 periods per year or cycles {">"} 35 days
            </p>
          </div>
          <Switch
            id="irregular"
            checked={data.irregularPeriods}
            onCheckedChange={(checked) => updateData({ irregularPeriods: checked })}
          />
        </div>
      </div>
    </div>
  )
}
