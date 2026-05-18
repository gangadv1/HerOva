"use client"

export function PublicHealthSection() {
  return (
    <section className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-4xl mx-auto text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Early identification of at-risk women</h2>
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
          <p className="text-sm text-muted-foreground mt-2">Potential associated risks: insulin resistance, metabolic syndrome, fertility complications, and cardiovascular risk.</p>
        </div>

        <div className="glass rounded-2xl p-4 sm:p-6 border border-border/30">
          <h3 className="font-semibold">Community Impact</h3>
          <p className="text-sm text-muted-foreground mt-2">Designed to guide follow-up testing and referrals where needed, with simple actionable recommendations for non-specialist settings.</p>
        </div>
      </div>
    </section>
  )
}
