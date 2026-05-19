"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ScanLine } from "lucide-react"
import type { PatientData } from "../patient-analysis"

interface FormProps {
  data: PatientData
  updateData: (data: Partial<PatientData>) => void
}

export function UltrasoundForm({ data, updateData }: FormProps) {
  return (
    <div className="grid gap-6">
      {/* Optional step notice */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm text-amber-300">
        <ScanLine className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          <strong>Optional — </strong>enter ultrasound measurements if a pelvic scan has been performed. If no ultrasound is available (e.g. primary care or community settings), skip this step. The system will still run a risk assessment using clinical and symptom data only.
        </span>
      </div>
      {/* Ovary Volumes */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="leftVolume" className="text-foreground">Left Ovary Volume (mL)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="leftVolume"
              value={[data.ovaryVolumeLeft]}
              onValueChange={([value]) => updateData({ ovaryVolumeLeft: value })}
              min={2}
              max={25}
              step={0.5}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.ovaryVolumeLeft}
              onChange={(e) => updateData({ ovaryVolumeLeft: Number(e.target.value) })}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
          <p className={`text-xs ${data.ovaryVolumeLeft <= 10 ? "text-green-400" : "text-pink-400"}`}>
            {data.ovaryVolumeLeft <= 10 ? "Normal" : "Enlarged (>10mL)"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rightVolume" className="text-foreground">Right Ovary Volume (mL)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="rightVolume"
              value={[data.ovaryVolumeRight]}
              onValueChange={([value]) => updateData({ ovaryVolumeRight: value })}
              min={2}
              max={25}
              step={0.5}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.ovaryVolumeRight}
              onChange={(e) => updateData({ ovaryVolumeRight: Number(e.target.value) })}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
          <p className={`text-xs ${data.ovaryVolumeRight <= 10 ? "text-green-400" : "text-pink-400"}`}>
            {data.ovaryVolumeRight <= 10 ? "Normal" : "Enlarged (>10mL)"}
          </p>
        </div>
      </div>

      {/* Follicle Counts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="leftFollicles" className="text-foreground">Left Ovary Follicle Count</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="leftFollicles"
              value={[data.follicleCountLeft]}
              onValueChange={([value]) => updateData({ follicleCountLeft: value })}
              min={0}
              max={30}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.follicleCountLeft}
              onChange={(e) => updateData({ follicleCountLeft: Number(e.target.value) })}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
          <p className={`text-xs ${data.follicleCountLeft < 12 ? "text-green-400" : "text-pink-400"}`}>
            {data.follicleCountLeft < 12 ? "Normal" : "Elevated (≥12 per ovary)"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rightFollicles" className="text-foreground">Right Ovary Follicle Count</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="rightFollicles"
              value={[data.follicleCountRight]}
              onValueChange={([value]) => updateData({ follicleCountRight: value })}
              min={0}
              max={30}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.follicleCountRight}
              onChange={(e) => updateData({ follicleCountRight: Number(e.target.value) })}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
          <p className={`text-xs ${data.follicleCountRight < 12 ? "text-green-400" : "text-pink-400"}`}>
            {data.follicleCountRight < 12 ? "Normal" : "Elevated (≥12 per ovary)"}
          </p>
        </div>
      </div>

      {/* Polycystic Appearance */}
      <div className="glass rounded-xl p-6 border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-foreground text-lg">Polycystic Ovarian Morphology</Label>
            <p className="text-sm text-muted-foreground mt-1">
              String of pearls appearance on ultrasound
            </p>
          </div>
          <Switch
            checked={data.polycysticAppearance}
            onCheckedChange={(checked) => updateData({ polycysticAppearance: checked })}
          />
        </div>
      </div>

      {/* Endometrial Thickness */}
      <div className="space-y-2">
        <Label htmlFor="endometrial" className="text-foreground">Endometrial Thickness (mm)</Label>
        <div className="flex items-center gap-4">
          <Slider
            id="endometrial"
            value={[data.endometrialThickness]}
            onValueChange={([value]) => updateData({ endometrialThickness: value })}
            min={2}
            max={20}
            step={0.5}
            className="flex-1"
          />
          <Input
            type="number"
            value={data.endometrialThickness}
            onChange={(e) => updateData({ endometrialThickness: Number(e.target.value) })}
            className="w-20 bg-muted/50 border-purple-500/30"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Varies with menstrual cycle phase (4-14mm typical)
        </p>
      </div>
    </div>
  )
}
