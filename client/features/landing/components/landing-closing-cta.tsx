import Link from "next/link"
import { ArrowRight, Check, Download } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ClosingCta() {
  return (
    <section className="relative flex w-full items-center gap-8 overflow-hidden rounded-3xl bg-linear-to-br from-primary/80 to-primary px-6 pt-20 pb-6 text-primary-foreground max-md:flex-col md:pb-20 lg:px-10">
      <div className="pointer-events-none absolute -top-40 -right-20 size-96 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -top-24 -right-4 size-72 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -bottom-48 left-1/3 size-96 rounded-full bg-white/5 blur-3xl" />

      <div className="relative flex flex-2 flex-col gap-10">
        <h2 className="font-heading text-4xl leading-tight font-medium tracking-tight text-balance max-md:text-center lg:text-5xl">
          Bring clarity to shared finances
          <div>with Ledgium.</div>
        </h2>

        <div className="flex w-full items-center gap-2 max-sm:flex-col max-sm:justify-center">
          <Button
            asChild
            size="lg"
            className="h-12 bg-background px-6 hover:bg-background/90"
          >
            <Link href="/register">
              Get started now <ArrowRight />
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 bg-transparent px-6"
          >
            <Link href="/download">
              Download App <Download />
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative flex-2 overflow-hidden rounded-xl border border-border shadow-2xl">
        <img
          src="/ledgium-dashboard.png"
          alt="dashboard-image"
          className="h-full object-cover object-left"
        />
      </div>
    </section>
  )
}
