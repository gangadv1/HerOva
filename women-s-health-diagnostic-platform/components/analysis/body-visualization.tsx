"use client"

import { useState } from "react"
        <motion.div className="relative aspect-[3/4] max-w-xs mx-auto" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <svg viewBox="0 0 200 300" className="w-full h-full">
            <defs>
              <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(168, 85, 247, 0.3)" />
                <stop offset="100%" stopColor="rgba(34, 211, 238, 0.3)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Body outline (original blob) */}
            <path
              d="M100 20 
                 C120 20 130 30 130 40
                 L130 50
                 C145 55 155 65 155 80
                 L155 90 C160 95 165 100 165 115
                 L165 180 C165 190 160 195 155 200
                 L155 250 C155 260 150 270 145 275
                 L145 295 L130 295 L130 275
                 C125 270 120 265 115 260
                 L100 260
                 L85 260
                 C80 265 75 270 70 275
                 L70 295 L55 295 L55 275
                 C50 270 45 260 45 250
                 L45 200 C40 195 35 190 35 180
                 L35 115 C35 100 40 95 45 90
                 L45 80 C45 65 55 55 70 50
                 L70 40 C70 30 80 20 100 20"
              fill="url(#bodyGradient)"
              stroke="rgba(168, 85, 247, 0.5)"
              strokeWidth="1"
            />

            {/* Interactive regions (original hotspots) */}
            {/* Scalp */}
            <ellipse
              cx="100" cy="30"
              rx="25" ry="15"
              fill={hoveredRegion === "scalp" || selectedRegion === "scalp" 
                ? getRegionRiskForDisplay("scalp") === 'high' ? 'rgba(236,72,153,0.28)' : getRegionRiskForDisplay("scalp") === 'moderate' ? 'rgba(245,158,11,0.22)' : 'rgba(6,182,212,0.18)'
                : "rgba(168, 85, 247, 0.08)"}
              stroke={getRiskColor(getRegionRiskForDisplay("scalp"))}
              strokeWidth={selectedRegion === 'scalp' ? 2 : 1}
              filter={selectedRegion === "scalp" ? "url(#glow)" : undefined}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredRegion("scalp")}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion("scalp")}
              opacity={hoveredRegion === "scalp" || selectedRegion === "scalp" ? 0.9 : 0.45}
            />

            {/* Skin (face area) */}
            <circle
              cx="100" cy="50"
              r="12"
              fill={hoveredRegion === "skin" || selectedRegion === "skin"
                ? getRegionRiskForDisplay("skin") === 'high' ? 'rgba(236,72,153,0.22)' : getRegionRiskForDisplay("skin") === 'moderate' ? 'rgba(245,158,11,0.18)' : 'rgba(6,182,212,0.14)'
                : "rgba(34, 211, 238, 0.12)"}
              stroke={getRiskColor(getRegionRiskForDisplay("skin"))}
              strokeWidth={selectedRegion === 'skin' ? 2 : 1}
              filter={selectedRegion === "skin" ? "url(#glow)" : undefined}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredRegion("skin")}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion("skin")}
              opacity={hoveredRegion === "skin" || selectedRegion === "skin" ? 0.9 : 0.45}
            />

            {/* Abdomen */}
            <ellipse
              cx="100" cy="150"
              rx="35" ry="40"
              fill={hoveredRegion === "abdomen" || selectedRegion === "abdomen"
                ? getRegionRiskForDisplay("abdomen") === 'high' ? 'rgba(236,72,153,0.22)' : getRegionRiskForDisplay("abdomen") === 'moderate' ? 'rgba(245,158,11,0.18)' : 'rgba(6,182,212,0.14)'
                : "rgba(236, 72, 153, 0.08)"}
              stroke={getRiskColor(getRegionRiskForDisplay("abdomen"))}
              strokeWidth={selectedRegion === 'abdomen' ? 2 : 1}
              filter={selectedRegion === "abdomen" ? "url(#glow)" : undefined}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredRegion("abdomen")}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion("abdomen")}
              opacity={hoveredRegion === "abdomen" || selectedRegion === "abdomen" ? 0.9 : 0.45}
            />

            {/* Uterus */}
            <ellipse
              cx="100" cy="185"
              rx="18" ry="15"
              fill={hoveredRegion === "uterus" || selectedRegion === "uterus"
                ? getRegionRiskForDisplay("uterus") === 'high' ? 'rgba(236,72,153,0.22)' : getRegionRiskForDisplay("uterus") === 'moderate' ? 'rgba(245,158,11,0.18)' : 'rgba(6,182,212,0.14)'
                : "rgba(236, 72, 153, 0.08)"}
              stroke={getRiskColor(getRegionRiskForDisplay("uterus"))}
              strokeWidth={selectedRegion === 'uterus' ? 2 : 1}
              filter={selectedRegion === "uterus" ? "url(#glow)" : undefined}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredRegion("uterus")}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion("uterus")}
              opacity={hoveredRegion === "uterus" || selectedRegion === "uterus" ? 0.9 : 0.45}
            />

            {/* Ovaries (left and right) */}
            <circle
              cx="75" cy="180"
              r="10"
              fill={hoveredRegion === "ovaries" || selectedRegion === "ovaries"
                ? getRegionRiskForDisplay("ovaries") === 'high' ? 'rgba(124,58,237,0.22)' : getRegionRiskForDisplay("ovaries") === 'moderate' ? 'rgba(124,58,237,0.16)' : 'rgba(124,58,237,0.12)'
                : "rgba(168, 85, 247, 0.12)"}
              stroke={getRiskColor(getRegionRiskForDisplay("ovaries"))}
              strokeWidth={selectedRegion === 'ovaries' ? 2 : 1}
              filter={selectedRegion === "ovaries" ? "url(#glow)" : undefined}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredRegion("ovaries")}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion("ovaries")}
              opacity={hoveredRegion === "ovaries" || selectedRegion === "ovaries" ? 0.9 : 0.45}
            />
            <circle
              cx="125" cy="180"
              r="10"
              fill={hoveredRegion === "ovaries" || selectedRegion === "ovaries"
                ? getRegionRiskForDisplay("ovaries") === 'high' ? 'rgba(124,58,237,0.22)' : getRegionRiskForDisplay("ovaries") === 'moderate' ? 'rgba(124,58,237,0.16)' : 'rgba(124,58,237,0.12)'
                : "rgba(168, 85, 247, 0.12)"}
              stroke={getRiskColor(getRegionRiskForDisplay("ovaries"))}
              strokeWidth={selectedRegion === 'ovaries' ? 2 : 1}
              filter={selectedRegion === "ovaries" ? "url(#glow)" : undefined}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredRegion("ovaries")}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion("ovaries")}
              opacity={hoveredRegion === "ovaries" || selectedRegion === "ovaries" ? 0.9 : 0.45}
            />
          </svg>

          {/* Hotspot labels */}
          <div className="absolute top-[8%] left-1/2 -translate-x-1/2 text-xs text-purple-300">Scalp</div>
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 text-xs text-cyan-300">Skin</div>
          <div className="absolute top-[48%] left-1/2 -translate-x-1/2 text-xs text-pink-300">Abdomen</div>
          <div className="absolute top-[60%] left-1/2 -translate-x-1/2 text-xs text-pink-300">Uterus</div>
          <div className="absolute top-[58%] left-[30%] text-xs text-purple-300">Ovaries</div>

          {/* Legend */}
          <div className="mt-8 absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#06b6d4' }} />
              <span className="text-muted-foreground">Low Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
              <span className="text-muted-foreground">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#ec4899' }} />
              <span className="text-muted-foreground">High Risk</span>
            </div>
          </div>
        </motion.div>
      const override = phenotypeMap[phenotype]?.[region]
      if (override) return override
    }
    return base
  }

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
      {/* LEFT: SVG Silhouette */}
      <Card className="glass border-purple-500/20 p-6 relative overflow-hidden">
        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">Interactive Body Map</h3>
        <p className="text-sm text-muted-foreground mb-4">Tap or click regions to open AI insights on the right.</p>

        <motion.div
          className="relative w-full h-[480px] sm:h-[560px] flex items-center justify-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <svg viewBox="0 0 200 400" className="w-full h-full max-w-xs">
            <defs>
              <linearGradient id="silGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.06" />
              </linearGradient>
              <filter id="softGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Elegant medical silhouette (minimal) */}
            <path
              d="M100 10 C118 10 130 26 130 44 L130 70 C145 78 155 96 155 118 L155 180 C155 204 150 214 145 220 L145 260 C145 282 138 298 130 308 L130 350 L70 350 L70 308 C62 298 55 282 55 260 L55 220 C50 214 45 204 45 180 L45 118 C45 96 55 78 70 70 L70 44 C70 26 82 10 100 10 Z"
              fill="url(#silGradient)"
              stroke="#6d28d9"
              strokeOpacity={0.18}
              strokeWidth={1}
            />

            {/* Regions (simplified shapes) */}
            <motion.g whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="cursor-pointer">
              {/* Scalp */}
              <motion.ellipse
                cx={100}
                cy={30}
                rx={24}
                ry={12}
                fill={(selectedRegion === 'scalp' || hoveredRegion === 'scalp') ? 'rgba(124,58,237,0.18)' : 'transparent'}
                stroke={getRiskColor(getRegionRiskForDisplay('scalp'))}
                strokeWidth={selectedRegion === 'scalp' || (phenotype && phenotypeMap[phenotype]?.scalp === 'high') ? 2.6 : 1.2}
                onMouseEnter={() => setHoveredRegion('scalp')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => setSelectedRegion('scalp')}
              />

              {/* Skin */}
              <motion.circle
                cx={100}
                cy={56}
                r={14}
                fill={(selectedRegion === 'skin' || hoveredRegion === 'skin') ? 'rgba(6,182,212,0.12)' : 'transparent'}
                stroke={getRiskColor(getRegionRiskForDisplay('skin'))}
                strokeWidth={selectedRegion === 'skin' || (phenotype && phenotypeMap[phenotype]?.skin === 'high') ? 2.6 : 1.2}
                onMouseEnter={() => setHoveredRegion('skin')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => setSelectedRegion('skin')}
              />

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
