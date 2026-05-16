"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import type { PatientData } from "../patient-analysis"

interface FormProps {
  data: PatientData
  updateData: (data: Partial<PatientData>) => void
}

export function LabBiomarkersForm({ data, updateData }: FormProps) {
  return (
    <div className="grid gap-6">
      {/* LH & FSH */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="lh" className="text-foreground">LH (mIU/mL)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="lh"
              value={[data.lh]}
              onValueChange={([value]) => {
                const ratio = Number((value / data.fsh).toFixed(2))
                updateData({ lh: value, lhFshRatio: ratio })
              }}
              min={1}
              max={30}
              step={0.5}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.lh}
              onChange={(e) => {
                const lh = Number(e.target.value)
                const ratio = Number((lh / data.fsh).toFixed(2))
                updateData({ lh, lhFshRatio: ratio })
              }}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fsh" className="text-foreground">FSH (mIU/mL)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="fsh"
              value={[data.fsh]}
              onValueChange={([value]) => {
                const ratio = Number((data.lh / value).toFixed(2))
                updateData({ fsh: value, lhFshRatio: ratio })
              }}
              min={1}
              max={20}
              step={0.5}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.fsh}
              onChange={(e) => {
                const fsh = Number(e.target.value)
                const ratio = Number((data.lh / fsh).toFixed(2))
                updateData({ fsh, lhFshRatio: ratio })
              }}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
        </div>

        <div className="glass rounded-xl p-4 border border-cyan-500/20">
          <Label className="text-foreground">LH:FSH Ratio</Label>
          <div className={`text-2xl font-mono mt-2 ${
            data.lhFshRatio > 2 ? "text-pink-400" : "text-green-400"
          }`}>
            {data.lhFshRatio}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.lhFshRatio > 2 ? "Elevated (typical in PCOS)" : "Normal range"}
          </p>
        </div>
      </div>

      {/* Androgens */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="totalT" className="text-foreground">Total Testosterone (ng/dL)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="totalT"
              value={[data.totalTestosterone]}
              onValueChange={([value]) => updateData({ totalTestosterone: value })}
              min={10}
              max={100}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.totalTestosterone}
              onChange={(e) => updateData({ totalTestosterone: Number(e.target.value) })}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
          <p className={`text-xs ${data.totalTestosterone <= 50 ? "text-green-400" : "text-pink-400"}`}>
            {data.totalTestosterone <= 50 ? "Normal" : "Elevated"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="freeT" className="text-foreground">Free Testosterone (ng/dL)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="freeT"
              value={[data.freeTestosterone]}
              onValueChange={([value]) => updateData({ freeTestosterone: value })}
              min={0.1}
              max={10}
              step={0.1}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.freeTestosterone}
              onChange={(e) => updateData({ freeTestosterone: Number(e.target.value) })}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
        </div>
      </div>

      {/* DHEA-S & AMH */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="dheas" className="text-foreground">DHEA-S (µg/dL)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="dheas"
              value={[data.dheas]}
              onValueChange={([value]) => updateData({ dheas: value })}
              min={50}
              max={500}
              step={10}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.dheas}
              onChange={(e) => updateData({ dheas: Number(e.target.value) })}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amh" className="text-foreground">AMH (ng/mL)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="amh"
              value={[data.amh]}
              onValueChange={([value]) => updateData({ amh: value })}
              min={0.5}
              max={15}
              step={0.1}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.amh}
              onChange={(e) => updateData({ amh: Number(e.target.value) })}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
          <p className={`text-xs ${data.amh <= 6 ? "text-green-400" : "text-pink-400"}`}>
            {data.amh <= 6 ? "Normal" : "Elevated (common in PCOS)"}
          </p>
        </div>
      </div>

      {/* Prolactin & TSH */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="prolactin" className="text-foreground">Prolactin (ng/mL)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="prolactin"
              value={[data.prolactin]}
              onValueChange={([value]) => updateData({ prolactin: value })}
              min={2}
              max={50}
              step={0.5}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.prolactin}
              onChange={(e) => updateData({ prolactin: Number(e.target.value) })}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Helps rule out other causes of irregular periods
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tsh" className="text-foreground">TSH (mIU/L)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="tsh"
              value={[data.tsh]}
              onValueChange={([value]) => updateData({ tsh: value })}
              min={0.4}
              max={10}
              step={0.1}
              className="flex-1"
            />
            <Input
              type="number"
              value={data.tsh}
              onChange={(e) => updateData({ tsh: Number(e.target.value) })}
              className="w-20 bg-muted/50 border-purple-500/30"
            />
          </div>
          <p className={`text-xs ${
            data.tsh >= 0.4 && data.tsh <= 4.0 ? "text-green-400" : "text-yellow-400"
          }`}>
            {data.tsh >= 0.4 && data.tsh <= 4.0 ? "Normal" : "Outside normal range"}
          </p>
        </div>
      </div>
    </div>
  )
}
