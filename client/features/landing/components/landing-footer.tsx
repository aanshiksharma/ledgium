import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { landingNavigation } from "../content/landing-content"
import { TemporaryLogo } from "@/components/common/temporary-logo"

export function LandingFooter() {
  return (
    <footer className="relative border-t border-border/70 bg-background pt-12 pb-6">
      <div className="mx-auto max-w-360 space-y-10 px-4 lg:px-6">
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="max-w-md">
            <Link href="/" aria-label="Ledgium home">
              <TemporaryLogo />
            </Link>
            <h2 className="my-4 text-sm font-medium text-foreground">
              Shared finances, kept clear.
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A shared household financial system for tracking expenses,
              understanding obligations, and recording settlements.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Explore</h3>
            <ul className="mt-4 space-y-3">
              {landingNavigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/about-ledgium"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  About Ledgium
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Your account</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Log in
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
                >
                  Get started <ArrowUpRight className="size-3.5" />
                </Link>
              </li>
            </ul>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <h2 className="text-[clamp(3.5rem,21vw,19rem)] leading-tight font-bold tracking-tight opacity-15">
            LEDGIUM
          </h2>
        </section>

        <section className="flex flex-col gap-4 border-t py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Ledgium. All rights reserved.</p>
          <p>Shared expenses. Clear records. Better understanding.</p>
        </section>
      </div>
    </footer>
  )
}
