import Link from "next/link"
import { ArrowRight, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LandingVideo } from "./landing-video"

export function LandingHero() {
  return (
    <section className="relative flex w-full flex-col items-center gap-15 py-30">
      <div
        data-scroll
        data-scroll-speed="-0.3"
        className="flex max-w-3xl flex-col gap-6 md:items-center md:py-20 md:text-center"
      >
        <h1 className="font-heading text-5xl leading-none font-medium tracking-tighter text-balance md:text-7xl">
          {`A shared life deserves a `}
          <span className="text-primary">shared ledger</span>
        </h1>

        <p className="max-w-2xl leading-relaxed text-balance text-muted-foreground max-md:text-sm">
          Track household expenses, split costs fairly, and see exactly who owes
          whom. Ledgium brings your shared finances into one clear, organized
          place.
        </p>

        <div className="flex grid-cols-2 gap-2 max-[28rem]:grid">
          <Button
            asChild
            size="lg"
            className="gap-2 rounded-full px-6 text-sm shadow-lg shadow-primary/15"
          >
            <Link href="/register">
              <span>Get started</span>
              <ArrowRight />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="gap-2 rounded-full border-border/80 bg-background/70 px-6 text-sm"
          >
            <Link href="/download">
              <span>Download</span>
              <Download />
            </Link>
          </Button>
        </div>
      </div>

      <div
        data-scroll
        data-scroll-speed="0.3"
        className="relative w-full overflow-hidden rounded-2xl bg-background shadow-2xl ring-2 shadow-background/12 ring-ring/20"
      >
        <LandingVideo />
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-12 -right-32 size-112 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-64 -left-48 size-96 rounded-full bg-emerald-200/20 blur-3xl dark:bg-emerald-900/10" />
        <div className="mask-linear-gradient(to_bottom,black,transparent_82%) absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[56px_56px] opacity-[0.22]" />

        <div className="absolute inset-0 bg-linear-to-b from-transparent from-60% via-background/60 via-80% to-background" />
      </div>
    </section>
  )
}
