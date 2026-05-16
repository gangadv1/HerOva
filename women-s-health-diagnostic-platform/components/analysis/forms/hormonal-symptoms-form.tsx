"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PatientData } from "../patient-analysis"

interface FormProps {
  data: PatientData
  updateData: (data: Partial<PatientData>) => void
}

export function HormonalSymptomsForm({ data, updateData }: FormProps) {
  return (
    <div className="grid gap-6">
      {/* Acne */}
      <div className="glass rounded-xl p-6 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label className="text-foreground text-lg">Acne</Label>
            <p className="text-sm text-muted-foreground">
              Presence of hormonal acne, especially along jawline
            </p>
          </div>
          <Switch
            checked={data.acne}
            onCheckedChange={(checked) => updateData({ acne: checked })}
          />
        </div>
        
        {data.acne && (
          <div className="space-y-2 mt-4 pt-4 border-t border-purple-500/20">
            <Label className="text-foreground">Acne Severity</Label>
            <Select 
              value={data.acneSeverity} 
              onValueChange={(value) => updateData({ acneSeverity: value })}
            >
              <SelectTrigger className="bg-muted/50 border-purple-500/30">
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mild">Mild - Few comedones, occasional papules</SelectItem>
                <SelectItem value="moderate">Moderate - Multiple papules/pustules</SelectItem>
                <SelectItem value="severe">Severe - Nodules, cysts, scarring</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Hirsutism */}
      <div className="glass rounded-xl p-6 border border-cyan-500/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label className="text-foreground text-lg">Hirsutism</Label>
            <p className="text-sm text-muted-foreground">
              Excessive male-pattern hair growth in women
            </p>
          </div>
          <Switch
            checked={data.hirsutism}
            onCheckedChange={(checked) => updateData({ hirsutism: checked })}
          />
        </div>
        
        {data.hirsutism && (
          <div className="space-y-2 mt-4 pt-4 border-t border-cyan-500/20">
            <div className="flex items-center justify-between">
              <Label className="text-foreground">Modified Ferriman-Gallwey Score</Label>
              <span className="text-cyan-400 font-mono">{data.hirsutismScore}</span>
            </div>
            <Slider
              value={[data.hirsutismScore]}
              onValueChange={([value]) => updateData({ hirsutismScore: value })}
              min={0}
              max={36}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Score {">"} 8 is typically considered clinical hirsutism
            </p>
          </div>
        )}
      </div>

      {/* Hair Loss & Skin Darkening */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6 border border-pink-500/20">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground text-lg">Hair Loss</Label>
              <p className="text-sm text-muted-foreground">
                Androgenic alopecia pattern
              </p>
            </div>
            <Switch
              checked={data.hairLoss}
              onCheckedChange={(checked) => updateData({ hairLoss: checked })}
            />
          </div>
        </div>

        <div className="glass rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground text-lg">Acanthosis Nigricans</Label>
              <p className="text-sm text-muted-foreground">
                Skin darkening in folds
              </p>
            </div>
            <Switch
              checked={data.skinDarkening}
              onCheckedChange={(checked) => updateData({ skinDarkening: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
