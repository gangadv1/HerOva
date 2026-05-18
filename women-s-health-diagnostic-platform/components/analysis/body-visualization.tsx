"use client"

import React from "react"

// Provide both a named and default export so consumers can import either
export function BodyVisualization({ patientData }: { patientData?: any }) {
  return (
    <div className="w-full flex items-center justify-center p-8">
      <div className="glass rounded-xl p-6 text-center max-w-md">
        <h3 className="text-lg font-bold mb-2">Interactive Body Map</h3>
        <p className="text-sm text-muted-foreground mb-4">The interactive body visualization is temporarily disabled to ensure stability. Use the analysis form to run the workflow.</p>
        <div className="h-48 bg-gradient-to-b from-purple-50 to-cyan-50 rounded-md flex items-center justify-center text-sm text-muted-foreground">Body viewer disabled (placeholder)</div>
      </div>
    </div>
  )
}

export default BodyVisualization
