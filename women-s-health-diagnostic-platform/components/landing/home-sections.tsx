"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

export function HomeSections() {
  const sections = [
    { title: "Hero section", href: "#hero" },
    { title: "Single patient assessment", href: "/analysis" },
    { title: "Differential diagnosis", href: "/analysis#differential" },
    { title: "Phenotype classification", href: "/analysis#phenotype" },
    { title: "AI reasoning", href: "/analysis#ai-reasoning" },
    { title: "Interactive anatomy", href: "/body-visualization" },
    { title: "Biological insights", href: "/analysis#biology" },
    { title: "Clinical recommendations", href: "/analysis#recommendations" },
    { title: "Batch screening", href: "/csv-upload" },
  ]

  return (
    <section className="container mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-6">Key Sections</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((s) => (
          <Card key={s.title} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.title} — view or launch</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={s.href} className="text-sm text-cyan-400 flex items-center gap-2">
                  Open <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
