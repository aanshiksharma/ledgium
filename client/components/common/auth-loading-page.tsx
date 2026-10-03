"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { Loader, Loader2 } from "lucide-react"

type LoadingPageProps = {
  isExiting?: boolean
  onAnimationComplete?: () => void
}

export function AuthLoadingPage({
  isExiting = false,
  onAnimationComplete,
}: LoadingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only run the exit animation when isExiting becomes true
    if (!isExiting) return

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        onComplete: () => {
          if (onAnimationComplete) onAnimationComplete()
        },
      })

      // 1. Fade out the "Loading..." text first
      timeline.to(textRef.current, {
        opacity: 0,
        duration: 0.5,
      })

      // 2. Slide the top panel up (-100%)
      timeline.to(".top", {
        yPercent: -100,
        duration: 1,
        ease: "power1.out",
      })

      // 3. Slide the bottom panel down (100%) at the exact same time ("<")
      timeline.to(
        ".bottom",
        {
          yPercent: 100,
          duration: 1,
          ease: "power1.out",
        },
        "<"
      )

      timeline.to(containerRef.current, { opacity: 0, duration: 0.3 }, "0.95")
    }, containerRef)

    return () => ctx.revert()
  }, [isExiting, onAnimationComplete])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-50 grid grid-rows-2 bg-background/50 backdrop-blur-sm"
    >
      <div className="top relative bg-background" />
      <div className="bottom relative bg-background" />

      <div
        ref={textRef}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 text-sm"
      >
        <Loader2 className="animate-spin" />
        <p>Logging you in!</p>
      </div>
    </div>
  )
}
