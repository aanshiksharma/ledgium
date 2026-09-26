"use client"

import { useState, useEffect } from "react"

import { Progress } from "../ui/progress"
import { Loader, Loader2 } from "lucide-react"

type Props = { loading: boolean; loadingText?: string }

export function ProgressBar({ loading, loadingText = "Loading" }: Props) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const curr = prev
        const add = 10 + Math.floor(Math.random() * 20)
        const newVal = curr + add > 100 ? 99 : curr + add

        if (newVal === 99) clearInterval(timer)
        return newVal
      })
    }, 1500)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setProgress(100)
  }, [loading])

  return (
    <div className="flex w-full max-w-80 flex-col items-center justify-center gap-3">
      <div className="flex w-full items-center justify-between text-sm">
        <p className="flex items-center gap-2">
          <Loader className="size-4 animate-spin" />
          {loadingText}
        </p>
        <p>{progress}%</p>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  )
}
