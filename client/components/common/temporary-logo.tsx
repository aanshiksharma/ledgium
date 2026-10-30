export function TemporaryLogo({
  variant = "default",
}: {
  variant?: "default" | "icon"
}) {
  if (variant === "icon")
    return (
      <figure className="flex size-9 items-center justify-center rounded-md bg-primary/80 font-heading font-bold">
        L
      </figure>
    )

  return (
    <div className="flex items-center gap-2 p-2">
      <figure className="flex size-9 items-center justify-center rounded-md bg-primary/80 font-heading font-bold">
        L
      </figure>

      <span>Ledgium</span>
    </div>
  )
}
