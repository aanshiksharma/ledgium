import { AboutSection } from "./landing-about-section"
import { ClosingCta } from "./landing-closing-cta"
import { FeaturesSection } from "./landing-features-section"
import { HowItWorksSection } from "./landing-how-it-works-section"
import { LandingHero } from "./landing-hero"
import { ProblemSection } from "./landing-problem-section"

export function LandingPage() {
  return (
    <>
      <LandingHero />
      {/* <ProblemSection /> */}
      <FeaturesSection />
      <HowItWorksSection />
      <AboutSection />
      <ClosingCta />
    </>
  )
}
