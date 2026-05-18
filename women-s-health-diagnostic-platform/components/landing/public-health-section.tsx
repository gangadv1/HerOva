"use client"

import SymptomsEducation from "@/components/education/symptoms-education"

export function PublicHealthSection() {
  return (
    <section className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-4xl mx-auto text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Early identification of underserved women at risk for endocrine disorders</h2>
        <p className="text-sm text-muted-foreground mt-2">Accessible, scalable triage for telehealth, low-resource clinics, and community screening.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-2xl p-4 sm:p-6 border border-border/30">
          <h3 className="font-semibold">Designed for Accessibility</h3>
          <ul className="mt-3 text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Telehealth workflows</li>
            <li>Low-resource clinics</li>
            <li>Rural screening campaigns</li>
            <li>Symptom-only quick screening</li>
            <li>Minimal infrastructure requirements</li>
          </ul>
        </div>

        <div className="glass rounded-2xl p-4 sm:p-6 border border-border/30">
          <h3 className="font-semibold">Long-Term Health Outlook</h3>
          <p className="text-sm text-muted-foreground mt-2">Potential associated risks: insulin resistance, fertility complications, metabolic syndrome, cardiovascular risk, and mental health impacts.</p>
          <p className="text-sm text-muted-foreground mt-3">Our platform provides guidance on long-term risk reduction and suggested follow-up pathways.</p>
        </div>

        <div className="glass rounded-2xl p-4 sm:p-6 border border-border/30">
          <h3 className="font-semibold">Population Impact</h3>
          <p className="text-sm text-muted-foreground mt-2">Support screening campaigns (schools, clinics) to identify high-risk patients and prioritize interventions at scale.</p>
        </div>
      </div>

      <div className="mb-6">
        <SymptomsEducation />
      </div>
    </section>
  )
}
