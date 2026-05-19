
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { ProblemSection } from "@/components/landing/problem-section"
import { DatasetSection } from "@/components/landing/dataset-section"
import { TechnologySection } from "@/components/landing/technology-section"
import { CTASection } from "@/components/landing/cta-section"
import { Navigation } from "@/components/landing/navigation"
import { ParticleBackground } from "@/components/landing/particle-background"
import { FlyingButterflies } from "@/components/landing/flying-butterflies"

import { RotterdamCriteria } from "@/components/analysis/rotterdam-criteria"
import { DifferentialDiagnosis } from "@/components/analysis/differential-diagnosis"
import { PhenotypeCard } from "@/components/PhenotypeCard"
import { BiologicalInsights } from "@/components/analysis/biological-insights"

export default function Home() {

  return (

    <main className="relative min-h-screen overflow-hidden bg-black">

      <ParticleBackground />
      <FlyingButterflies />

      <Navigation />

      <HeroSection />

      <ProblemSection />

      <FeaturesSection />

      <DatasetSection />

      <TechnologySection />

      {/* ========================================= */}
      {/* CLINICAL AI RESULTS SECTION */}
      {/* ========================================= */}

      <section className="max-w-6xl mx-auto px-6 py-20 space-y-8">

        <div className="text-center mb-12">

          <h1 className="text-5xl font-bold text-white mb-4">

            AI-Powered Clinical Intelligence

          </h1>

          <p className="text-zinc-400 text-lg">

            Phenotype-aware endocrine diagnostic platform
            integrating explainable AI, differential diagnosis,
            and biological pathway interpretation.

          </p>

        </div>

        <RotterdamCriteria />

        <PhenotypeCard />

        <DifferentialDiagnosis />

        <BiologicalInsights />

      </section>

      <CTASection />

    </main>

  )
}