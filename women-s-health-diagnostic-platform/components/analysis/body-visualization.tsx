"use client"

import React from "react"

export default function BodyVisualizationPlaceholder() {
  return (
    <div className="w-full flex items-center justify-center p-8">
      <div className="glass rounded-xl p-6 text-center max-w-md">
        <h3 className="text-lg font-bold mb-2">Interactive Body Map</h3>
        <p className="text-sm text-muted-foreground mb-4">The interactive body visualization is temporarily unavailable. You can still use the form view to enter patient data and run the screening workflow.</p>
        <div className="h-48 bg-gradient-to-b from-purple-50 to-cyan-50 rounded-md flex items-center justify-center text-sm text-muted-foreground">Body viewer disabled (placeholder)</div>
      </div>
    </div>
  )
}

              {/* Abdomen */}
              <motion.ellipse
                cx={100}
                cy={170}
                rx={36}
                ry={44}
                fill={(selectedRegion === 'abdomen' || hoveredRegion === 'abdomen') ? 'rgba(236,72,153,0.08)' : 'transparent'}
                stroke={getRiskColor(getRegionRiskForDisplay('abdomen'))}
                strokeWidth={selectedRegion === 'abdomen' || (phenotype && phenotypeMap[phenotype]?.abdomen === 'high') ? 2.6 : 1.2}
                onMouseEnter={() => setHoveredRegion('abdomen')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => setSelectedRegion('abdomen')}
              />

              {/* Uterus */}
              <motion.ellipse
                cx={100}
                cy={214}
                rx={18}
                ry={14}
                fill={(selectedRegion === 'uterus' || hoveredRegion === 'uterus') ? 'rgba(236,72,153,0.08)' : 'transparent'}
                stroke={getRiskColor(getRegionRiskForDisplay('uterus'))}
                strokeWidth={selectedRegion === 'uterus' || (phenotype && phenotypeMap[phenotype]?.uterus === 'high') ? 2.6 : 1.2}
                onMouseEnter={() => setHoveredRegion('uterus')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => setSelectedRegion('uterus')}
              />

              {/* Ovaries (left/right clickable group) */}
              <motion.circle
                cx={78}
                cy={208}
                r={10}
                fill={(selectedRegion === 'ovaries' || hoveredRegion === 'ovaries') ? 'rgba(124,58,237,0.12)' : 'transparent'}
                stroke={getRiskColor(getRegionRiskForDisplay('ovaries'))}
                strokeWidth={selectedRegion === 'ovaries' || (phenotype && phenotypeMap[phenotype]?.ovaries === 'high') ? 2.6 : 1.2}
                onMouseEnter={() => setHoveredRegion('ovaries')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => setSelectedRegion('ovaries')}
              />
              <motion.circle
                cx={122}
                cy={208}
                r={10}
                fill={(selectedRegion === 'ovaries' || hoveredRegion === 'ovaries') ? 'rgba(124,58,237,0.12)' : 'transparent'}
                stroke={getRiskColor(getRegionRiskForDisplay('ovaries'))}
                strokeWidth={selectedRegion === 'ovaries' || (phenotype && phenotypeMap[phenotype]?.ovaries === 'high') ? 2.6 : 1.2}
                onMouseEnter={() => setHoveredRegion('ovaries')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => setSelectedRegion('ovaries')}
              />
            </motion.g>
          </svg>

          {/* Animated premium glow / pulse for selected region */}
          {selectedRegion && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <motion.div
                className="rounded-full"
                style={{
                  width: 220,
                  height: 220,
                  background: getRegionRisk(selectedRegion) === 'high' ? 'radial-gradient(circle,#ec4899,transparent)' : getRegionRisk(selectedRegion) === 'moderate' ? 'radial-gradient(circle,#f59e0b,transparent)' : 'radial-gradient(circle,#06b6d4,transparent)',
                  filter: 'blur(28px)',
                }}
                animate={{ scale: [0.9, 1.06, 0.9], opacity: [0.6, 0.18, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
              />

              <motion.div
                className="rounded-full absolute"
                style={{
                  width: 120,
                  height: 120,
                  background: getRegionRisk(selectedRegion) === 'high' ? 'radial-gradient(circle, rgba(236,72,153,0.28), transparent 60%)' : getRegionRisk(selectedRegion) === 'moderate' ? 'radial-gradient(circle, rgba(245,158,11,0.28), transparent 60%)' : 'radial-gradient(circle, rgba(6,182,212,0.28), transparent 60%)',
                  filter: 'blur(12px)'
                }}
                animate={{ scale: [1, 0.96, 1], opacity: [0.9, 0.4, 0.9] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              />
            </div>
          )}
        </motion.div>
      </Card>

      {/* RIGHT: AI Insights Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedRegion || 'panel' }
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.28 }}
        >
          <Card className="glass p-6 h-full">
            <div className="flex items-start justify-between mb-4 gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">AI Insights</h3>
                <p className="text-sm text-muted-foreground">Clinically interpretable endocrine diagnostic reasoning and explanations.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground mr-2">Phenotype Mode</div>
                {['Type A','Type B','Type C','Type D'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setPhenotype(phenotype === t ? null : t)}
                    className={`px-2 py-1 text-xs rounded-md border ${phenotype === t ? 'border-purple-400 bg-purple-500/10' : 'border-transparent hover:bg-muted/10'}`}
                  >
                    {t}
                  </button>
                ))}
                {selectedRegion && (
                  <button onClick={() => setSelectedRegion(null)} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {selectedRegion ? (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-semibold">{regionData[selectedRegion].title}</h4>
                    <p className="text-sm text-muted-foreground">{regionData[selectedRegion].description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRegionRiskForDisplay(selectedRegion) === 'high' ? 'bg-pink-500/20 text-pink-300' : getRegionRiskForDisplay(selectedRegion) === 'moderate' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>
                    {getRegionRiskForDisplay(selectedRegion).toUpperCase()}
                  </div>
                </div>

                <div className="glass rounded-xl p-4 border border-border/20">
                  <h5 className="text-sm font-semibold mb-2">Clinical Relevance</h5>
                  <p className="text-sm text-muted-foreground">{regionData[selectedRegion].relevance}</p>
                </div>

                <div>
                  <h5 className="text-sm font-semibold mb-2">Biological Mechanism</h5>
                  <p className="text-sm text-muted-foreground">{regionData[selectedRegion].biology}</p>
                </div>

                <div>
                  <h5 className="text-sm font-semibold mb-2">Affected Pathways</h5>
                  <div className="flex flex-wrap gap-2">
                    {regionData[selectedRegion].pathways.map((p) => (
                      <span key={p} className="px-2 py-1 bg-muted/10 rounded text-xs text-muted-foreground">{p}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-semibold mb-2">Suggested Next Steps</h5>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Consider targeted labs (hormone panel, AMH, fasting insulin)</li>
                    <li>Pelvic ultrasound if ovarian morphology unclear</li>
                    <li>Refer to endocrinology for metabolic risk if high</li>
                  </ul>
                </div>

                {/* SHAP-style contributors */}
                <div>
                  <h5 className="text-sm font-semibold mb-2">Top contributing factors</h5>
                  <div className="space-y-3">
                    {getTopContributors(selectedRegion).map((factor, idx) => {
                      const pct = Math.max(18, 80 - idx * 14)
                      const color = getRegionRiskForDisplay(selectedRegion) === 'high' ? '#ec4899' : getRegionRiskForDisplay(selectedRegion) === 'moderate' ? '#f59e0b' : '#06b6d4'
                      return (
                        <div key={factor} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="text-sm text-foreground">{factor}</div>
                            <div className="h-2 rounded-full bg-muted/10 mt-1 overflow-hidden">
                              <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: color }} />
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground w-10 text-right">{pct}%</div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">These factors connect model explainability to anatomy and clinical interpretation.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col items-start justify-center">
                <h4 className="text-md font-semibold">Select a region</h4>
                <p className="text-sm text-muted-foreground">Click any region on the left to see clinically interpretable AI reasoning, pathway visualizations, and recommended next investigations.</p>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
