import { workflowSteps } from "../content/landing-content"

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="flex w-full scroll-mt-24 flex-col items-center gap-30 py-30"
    >
      <h2 className="text-center font-heading text-3xl leading-tight font-medium tracking-tight lg:text-5xl">
        A simple setup and
        <div className="text-primary">Ledgium tracks everything</div>
      </h2>

      <div className="grid w-full max-w-6xl gap-30">
        {workflowSteps.map((step, index) => (
          <article
            key={step.number}
            className={`flex w-full flex-col-reverse items-end gap-6 md:gap-12 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
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
