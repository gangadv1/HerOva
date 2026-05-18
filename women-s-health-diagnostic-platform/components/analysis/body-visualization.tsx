"use client"

import React, { useState } from "react"

export function BodyVisualization({ patientData }: { patientData?: any }) {
  const [selected, setSelected] = useState<string | null>(null)

  const regions = [
    { id: "ovaries", label: "Ovaries" },
    { id: "abdomen", label: "Abdomen" },
    { id: "face", label: "Face" },
  ]

  return (
    <div className="w-full flex items-center justify-center p-4">
      <div className="glass rounded-xl p-4 text-center max-w-lg w-full">
        <h3 className="text-lg font-bold mb-2">Interactive Body Map</h3>
        <p className="text-sm text-muted-foreground mb-4">Click regions to highlight; this viewer is a lightweight, Turbopack-safe SVG.</p>

        <div className="mx-auto" style={{ maxWidth: 320 }}>
          <svg viewBox="0 0 200 400" width="100%" height={400} role="img" aria-label="Body visualization">
            <title>Body visualization</title>
            {/* simple silhouette */}
            <rect x="60" y="20" width="80" height="60" rx="12" fill="#f8fafc" stroke="#e6eef6" />
            <rect x="50" y="80" width="100" height="160" rx="20" fill="#fff" stroke="#e6eef6" />
            <rect x="70" y="240" width="60" height="100" rx="16" fill="#f8fafc" stroke="#e6eef6" />

            {/* regions (ovaries) */}
            <circle
              cx="80"
              cy="160"
              r="12"
              fill={selected === "ovaries" ? "#7c3aed" : "#fde68a"}
              stroke="#b091ea"
              onClick={() => setSelected(selected === "ovaries" ? null : "ovaries")}
              style={{ cursor: "pointer" }}
            />
            <circle
              cx="120"
              cy="160"
              r="12"
              fill={selected === "ovaries" ? "#7c3aed" : "#fde68a"}
              stroke="#b091ea"
              onClick={() => setSelected(selected === "ovaries" ? null : "ovaries")}
              style={{ cursor: "pointer" }}
            />

            {/* abdomen */}
            <ellipse
              cx="100"
              cy="200"
              rx="28"
              ry="18"
              fill={selected === "abdomen" ? "#06b6d4" : "#c7f9ff"}
              stroke="#7dd3fc"
              onClick={() => setSelected(selected === "abdomen" ? null : "abdomen")}
              style={{ cursor: "pointer" }}
            />

            {/* face */}
            <circle
              cx="100"
              cy="40"
              r="10"
              fill={selected === "face" ? "#f97316" : "#ffe7d6"}
              stroke="#fbbf77"
              onClick={() => setSelected(selected === "face" ? null : "face")}
              style={{ cursor: "pointer" }}
            />
          </svg>

          <div className="mt-3 text-sm">
            <strong>Selected:</strong> {selected ? regions.find(r => r.id === selected)?.label : "None"}
          </div>

          {patientData && (
            <div className="mt-2 text-xs text-muted-foreground">
              {patientData.age ? `Age: ${patientData.age}` : ""}
              {patientData.bmi ? ` • BMI: ${patientData.bmi}` : ""}
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                const report = {
                  generatedAt: new Date().toISOString(),
                  selectedRegion: selected,
                  selectedRegionLabel: selected ? regions.find(r => r.id === selected)?.label : null,
                  patientData: patientData ?? null,
                }

                const json = JSON.stringify(report, null, 2)
                const blob = new Blob([json], { type: "application/json" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                const ts = new Date().toISOString().replace(/[:.]/g, "-")
                a.download = `herova-report-${ts}.json`
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(url)
              }}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:opacity-95"
            >
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BodyVisualization
