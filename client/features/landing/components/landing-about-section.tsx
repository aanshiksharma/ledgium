import Link from "next/link"
import { ArrowUpRight, GitBranch, Handshake, Scale } from "lucide-react"

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-10">
        <div className="relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-primary/8 blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-border/70 pb-5">
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-primary">THE LEDGIUM PRINCIPLE</p>
                <h3 className="mt-2 text-lg font-semibold">One expense. A connected record.</h3>
              </div>
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GitBranch className="size-5" />
              </span>
            </div>
            <div className="space-y-3 py-6">
              {[
                { icon: Scale, title: "Shared expense", subtitle: "Record what was spent" },
                { icon: Handshake, title: "Individual shares", subtitle: "Understand each person's part" },
                { icon: GitBranch, title: "Debt and settlement", subtitle: "Track what remains to be paid" },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="flex items-center gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/5 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.subtitle}</p>
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-muted-foreground/60">0{index + 1}</span>
                  </div>
                )
              })}
            </div>
            <div className="rounded-2xl bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
              Financial clarity starts with connected records.
            </div>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-primary">ABOUT LEDGIUM</p>
          <h2 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Money shared should be money understood.
          </h2>
          <p className="mt-6 text-base leading-8 text-muted-foreground">
            Sharing expenses should not mean losing track of contributions, relying on memory, or repeatedly calculating who owes whom.
          </p>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            Ledgium is built around a simple idea: a household should have a clear, consistent record of its shared finances. By connecting expenses, individual contributions, debt obligations, and settlements, Ledgium helps people understand their financial responsibilities without unnecessary complexity.
          </p>
          <Link href="/about-ledgium" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80">
            Discover the thinking behind Ledgium <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
