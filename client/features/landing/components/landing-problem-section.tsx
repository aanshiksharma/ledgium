"use client"

import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger)

import { problemCards } from "../content/landing-content"

export function ProblemSection() {
  useGSAP(() => {
    const textContainers: Element[] = gsap.utils.toArray(".reveal-text")

    textContainers.forEach((container: Element) => {
      const tl = gsap.timeline({ paused: true })

      tl.from(container, {
        opacity: 0,
        yPercent: -40,
        ease: "power2.inOut",
        duration: 0.3,
      })

      ScrollTrigger.create({
        trigger: container,
        scroller: "body",
        start: "top 70%",
        end: "bottom 70%",
        onEnter: () => tl.play(),
        onLeaveBack: () => tl.reverse(),
      })
    })
  })

  return (
    <section className="relative flex w-full flex-col items-stretch gap-30">
      <div className="flex min-h-[70svh] items-center py-30 md:max-w-4/5">
        <div className="font-heading text-4xl leading-[1.1] md:text-5xl lg:text-6xl">
          <div className="reveal-text">Shared bills, uneven splits,</div>
          <div className="reveal-text">and payments at different times,</div>
          <div className="reveal-text">make it hard to keep track</div>
          <div className="reveal-text">of who owes whom.</div>
        </div>
      </div>

      {/* <div className="mx-auto flex max-w-5xl items-center gap-6 max-md:flex-col">
        {problemCards.map((card, index) => {
          const Icon = card.icon
          return (
            <article
              data-scroll
              data-scroll-speed={`${(index - 1) * -0.2}`}
              key={card.title}
              className="w-full flex-1 rounded-2xl border border-border/70 bg-card/30 p-6 shadow-xl shadow-accent/5 backdrop-blur-md transition-colors duration-300 hover:border-primary/30 hover:shadow-primary/5 sm:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-semibold text-muted-foreground/60 tabular-nums">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-7 text-xl font-semibold tracking-tight">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {card.description}
              </p>
            </article>
          )
        })}
      </div> */}

      <div className="min-[70svh] flex items-center justify-center py-30">
        <h2 className="font-heading text-3xl font-medium">
          <span className="text-primary">The problem</span> with the current
          system
        </h2>
      </div>

      <div className="flex min-h-[70svh] max-w-5xl items-center self-center py-30">
        <h2 className="flex flex-col gap-4 text-center font-heading text-5xl font-medium tracking-tight text-foreground lg:text-7xl">
          <span className="reveal-text font-medium text-primary">
            Ledgium brings it all together,
          </span>
          <span className="reveal-text">so you don't have to.</span>
        </h2>
      </div>
    </section>
  )
}
