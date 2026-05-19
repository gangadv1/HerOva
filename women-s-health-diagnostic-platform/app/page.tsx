
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { ProblemSection } from "@/components/landing/problem-section"
import { DatasetSection } from "@/components/landing/dataset-section"
import { TechnologySection } from "@/components/landing/technology-section"
import { CTASection } from "@/components/landing/cta-section"
import { Navigation } from "@/components/landing/navigation"
import { ParticleBackground } from "@/components/landing/particle-background"
import { FlyingButterflies } from "@/components/landing/flying-butterflies"
import HomeSections from "@/components/landing/home-sections"
import PublicHealthSection from "@/components/landing/public-health-section"
import { InnovationSection } from "@/components/landing/innovation-section"
import { EarlyAwarenessSection } from "@/components/landing/early-awareness-section"
import { Card } from "@/components/ui/card"

export default function Home() {

  return (

    <main className="relative min-h-screen overflow-hidden bg-black">

      <ParticleBackground />
      <FlyingButterflies />

      <Navigation />

      <HeroSection />

      <ProblemSection />

      <InnovationSection />

      <FeaturesSection />

      <DatasetSection />

      <TechnologySection />

      <HomeSections />

      <PublicHealthSection />

      <EarlyAwarenessSection />

      <section className="max-w-7xl mx-auto px-6 py-20 space-y-8">
        <div className="text-center max-w-3xl mx-auto mb-4">
          <h1 className="text-5xl font-bold text-white mb-4">Clinical Intelligence Overview</h1>
          <p className="text-zinc-400 text-lg">
            System-wide educational reference for Rotterdam criteria, phenotype taxonomy, molecular pathways,
            SHAP explainability, ovarian cellular architecture, and high-level clinical reasoning.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-zinc-950/80 border border-purple-500/20 p-6">
            <h2 className="text-2xl font-bold text-white mb-3">General Clinical Overview</h2>
            <p className="text-zinc-400 leading-7">
              The dashboard is an informational reference layer. It describes the clinical framework used by the platform,
              but it does not contain patient-level predictions, percentages, or personalized recommendations.
            </p>
          </Card>

          <Card className="bg-zinc-950/80 border border-cyan-500/20 p-6">
            <h2 className="text-2xl font-bold text-white mb-3">Rotterdam Criteria</h2>
            <p className="text-zinc-400 leading-7">
              PCOS is assessed using the Rotterdam framework: hyperandrogenism, ovulatory dysfunction, and polycystic ovarian
              morphology. Educational content explains the criteria and how they are interpreted in clinical practice.
            </p>
          </Card>

          <Card className="bg-zinc-950/80 border border-pink-500/20 p-6">
            <h2 className="text-2xl font-bold text-white mb-3">Phenotype Categories</h2>
            <p className="text-zinc-400 leading-7">
              The phenotype model covers the major PCOS presentation patterns at a population level, including classic,
              ovulatory, non-hyperandrogenic, and mixed metabolic phenotypes.
            </p>
          </Card>

          <Card className="bg-zinc-950/80 border border-amber-500/20 p-6">
            <h2 className="text-2xl font-bold text-white mb-3">Molecular Pathways</h2>
            <p className="text-zinc-400 leading-7">
              The educational overview describes inflammation, insulin signaling, androgen synthesis, and ovarian follicle
              regulation as system-level pathways relevant to PCOS biology.
            </p>
          </Card>

          <Card className="bg-zinc-950/80 border border-teal-500/20 p-6">
            <h2 className="text-2xl font-bold text-white mb-3">SHAP Importance</h2>
            <p className="text-zinc-400 leading-7">
              SHAP visualizations explain how features influence model behavior across the dataset. On the dashboard, this is
              presented as a general interpretability concept rather than a patient-specific ranking.
            </p>
          </Card>

          <Card className="bg-zinc-950/80 border border-rose-500/20 p-6">
            <h2 className="text-2xl font-bold text-white mb-3">Ovarian Cellular Architecture</h2>
            <p className="text-zinc-400 leading-7">
              The architecture summary explains stromal, granulosa, theca, immune, and endothelial compartments in a generic
              ovarian context and how those populations relate to endocrine physiology.
            </p>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-700/60 p-8">
          <h2 className="text-2xl font-bold text-white mb-3">High-Level Clinical Analysis Summary</h2>
          <p className="text-zinc-400 leading-7 max-w-4xl">
            This dashboard is intentionally informational only. It explains the diagnostic framework, phenotypic structure,
            and biological reasoning used by the system so clinicians can orient themselves before reviewing a separate
            patient report. All individualized findings live exclusively on the single-patient results page.
          </p>
        </Card>
      </section>

      <CTASection />

    </main>

  )
}