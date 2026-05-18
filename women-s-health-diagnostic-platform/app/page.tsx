
import { HeroSection } from "@/components/landing/hero-section"
import { HomeSections } from "@/components/landing/home-sections"
import { FeaturesSection } from "@/components/landing/features-section"
import { ProblemSection } from "@/components/landing/problem-section"
import { DatasetSection } from "@/components/landing/dataset-section"
import { TechnologySection } from "@/components/landing/technology-section"
import { CTASection } from "@/components/landing/cta-section"
import { Navigation } from "@/components/landing/navigation"
import { ParticleBackground } from "@/components/landing/particle-background"
import { FlyingButterflies } from "@/components/landing/flying-butterflies"

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <ParticleBackground />
      <FlyingButterflies />
      <Navigation />
      <HeroSection />
      <HomeSections />
      <ProblemSection />
      <FeaturesSection />
      <DatasetSection />
      <TechnologySection />
      <CTASection />
    </main>
  )
}
