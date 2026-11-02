import { workflowSteps } from "../content/landing-content"

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative flex w-full flex-col items-center gap-40 py-40"
    >
      <h2 className="text-center font-heading text-3xl leading-tight font-medium tracking-tight lg:text-5xl">
        A simple setup and
        <div className="text-primary">Ledgium tracks everything</div>
      </h2>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="sticky top-0 flex h-svh items-center justify-center text-center font-heading text-9xl text-[clamp(3.5rem,21vw,11.5rem)] leading-tight font-bold tracking-tight uppercase opacity-3">
          how it works?
        </div>
      </div>

      <div className="grid w-full max-w-6xl gap-30">
        {workflowSteps.map((step, index) => (
          <article
            key={step.number}
            className={`flex w-full flex-col-reverse gap-6 md:items-end md:gap-12 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
          >
            <div className="flex flex-2 flex-col gap-4">
              <h3 className="font-heading text-2xl md:text-3xl">
                {step.title}
              </h3>

              <p className="max-w-lg text-muted-foreground">
                {step.description}
              </p>
            </div>

            <div className="aspect-video flex-5 overflow-hidden rounded-2xl bg-accent shadow-lg ring shadow-accent/40 ring-ring/30">
              <video src="/product-video.mp4" autoPlay muted loop />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
