"use client"

import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import { featureCards } from "../content/landing-content"

gsap.registerPlugin(ScrollTrigger)

export function FeaturesSection() {
  useGSAP(() => {
    const cards: Element[] = gsap.utils.toArray(".features-card")
    const pin = () => getComputedStyle(cards[0]).top

    cards.forEach((card, index) => {
      const depth = cards.length - 1 - index
      if (!depth) return

      const st = {
        trigger: card,
        start: () => `top ${pin()}`,
        end: () => `top ${pin()}`,
        endTrigger: cards.at(-1),
        scrub: 1,
        invalidateOnRefresh: true,
      }

      const tl = gsap.timeline()

      tl.to(card, {
        scale: 1 - 0.1 * depth,
        y: -20 * depth,
        ease: "none",
        scrollTrigger: { ...st },
      })

      tl.to(card.querySelector(".feature-card-content"), {
        opacity: 0,
        ease: "none",
        scrollTrigger: { ...st },
      })
    })
  })

  return (
    <section
      id="features"
      className="h-auto min-h-svh w-full max-w-6xl overflow-visible py-30"
    >
      <div
        id="features-layout"
        className="flex items-start gap-16 max-md:flex-col-reverse"
      >
        <div id="features-container" className="flex flex-1 flex-col gap-8">
          {featureCards.map((feature, index) => (
            <article
              key={index}
              className="features-card group sticky top-30 min-h-70 origin-[center_top] overflow-hidden rounded-2xl border border-border/70 bg-card p-10"
            >
              <div className="absolute top-0 right-0 h-36 w-36 rounded-full bg-primary/5 blur-3xl transition-colors group-hover:bg-primary/10" />

              <div className="feature-card-content grid gap-4">
                <h3 className="relative text-2xl tracking-tight capitalize">
                  {feature.title}
                </h3>

                <p className="relative max-w-md leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>

                <span className="absolute right-8 bottom-8 font-mono text-8xl text-muted-foreground opacity-20">
                  0{index + 1}
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="top-36 flex flex-1 flex-col items-end gap-6 text-end md:sticky">
          <h2 className="max-w-lg font-heading text-3xl leading-tight font-medium tracking-tight lg:text-5xl">
            Everything you
            <div>need to manage</div>
            <div>everyday finances.</div>
          </h2>

          <p className="max-w-md leading-7 text-muted-foreground">
            From the first shared expense to the final payment, keep the
            financial details organized and connected.
          </p>
        </div>
      </div>
    </section>
  )
}
