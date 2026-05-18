"use client"

import { useState } from "react"

const SYMPTOM_CONTENT: Record<string, { title: string; summary: string; pathway: string; whenToSeek: string }> = {
  acne: {
    title: "Acne",
    summary: "Acne can be a sign of increased androgen activity and clinical hyperandrogenism.",
    pathway: "Androgen excess increases sebum production and follicular keratinization leading to acne.",
    whenToSeek: "See a clinician if acne is sudden, severe, or accompanied by other endocrine symptoms (irregular periods, hair growth).",
  },
  irregular_cycles: {
    title: "Irregular cycles",
    summary: "Irregular or infrequent menstrual cycles suggest ovulatory dysfunction, a core feature in many endocrine disorders.",
    pathway: "Disordered hypothalamic–pituitary–ovarian signalling can disrupt follicle maturation and ovulation frequency.",
    whenToSeek: "Seek care if cycles are consistently >35 days, absent for several months, or you have fertility concerns.",
  },
  hair_growth: {
    title: "Excess hair growth (hirsutism)",
    summary: "Hirsutism indicates androgen action on pilosebaceous units and may reflect ovarian or adrenal androgen excess.",
    pathway: "Elevated testosterone/DHEAS increases hair follicle sensitivity producing terminal hair in a male-pattern distribution.",
    whenToSeek: "See a clinician for evaluation if hair growth is rapidly progressive or affecting quality of life.",
  },
}

export default function SymptomsEducation() {
  const [selected, setSelected] = useState<string | null>(null)

  const items = [
    { key: "acne", label: "Acne" },
    { key: "irregular_cycles", label: "Irregular cycles" },
    { key: "hair_growth", label: "Hair growth" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-3">
        <h4 className="text-lg font-semibold">Understanding Your Symptoms</h4>
        <p className="text-sm text-muted-foreground">Tap a symptom to learn the hormonal explanation, affected pathways, and when to seek care.</p>
        <div className="mt-4 space-y-3">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => setSelected(it.key)}
              aria-pressed={selected === it.key}
              className={`w-full text-left p-4 rounded-lg border transition-flex focus:outline-none focus:ring-2 focus:ring-purple-400 ${selected === it.key ? "bg-purple-500/10 border-purple-500" : "bg-muted/10 border-border"}`}
            >
              <div className="font-medium text-base">{it.label}</div>
              <div className="text-sm text-muted-foreground">Tap to learn more</div>
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-2">
        {selected ? (
          <div className="p-4 rounded-lg border bg-white/5">
            <h5 className="text-lg font-bold mb-2">{SYMPTOM_CONTENT[selected].title}</h5>
            <p className="text-sm text-muted-foreground mb-3">{SYMPTOM_CONTENT[selected].summary}</p>
            <h6 className="text-sm font-semibold">Endocrine pathway</h6>
            <p className="text-sm text-muted-foreground mb-3">{SYMPTOM_CONTENT[selected].pathway}</p>
            <h6 className="text-sm font-semibold">When to seek care</h6>
            <p className="text-sm text-muted-foreground">{SYMPTOM_CONTENT[selected].whenToSeek}</p>
          </div>
        ) : (
          <div className="p-6 rounded-lg border bg-muted/10 text-sm text-muted-foreground">Select a symptom to view educational content.</div>
        )}
      </div>
    </div>
  )
}
