import { problemCards } from "../content/landing-content"

export function ProblemSection() {
  return (
    <section className="bg-acent relative flex w-full flex-col items-center gap-15 py-30">
      <div className="flex max-w-3xl flex-col gap-6 md:items-center md:text-center">
        <h2 className="font-heading text-5xl font-medium tracking-tight">
          <span className="text-primary">Everyday expenses</span> deserve a
          clearer picture
        </h2>
      </div>

      <div className="grid max-w-6xl gap-6 md:grid-cols-3">
        {problemCards.map((card, index) => {
          const Icon = card.icon
          return (
            <article
              key={card.title}
              className="group rounded-2xl border border-border/70 bg-card/30 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 sm:p-8"
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
      </div>
    </section>
  )
}
