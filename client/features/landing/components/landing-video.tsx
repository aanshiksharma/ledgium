"use client"

import { useState, useRef } from "react"

import { Pause, Play } from "lucide-react"

import { Button } from "@/components/ui/button"

export function LandingVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [paused, setPaused] = useState<boolean | undefined>(
    videoRef.current?.paused
  )

  const handleVideoPlayState = () => {
    if (!videoRef) return
    if (!videoRef.current) return

    if (videoRef.current.paused) videoRef.current.play()
    else videoRef.current.pause()

    setPaused((prev) => !prev)
  }

  return (
    <>
      <video ref={videoRef} src="/product-video.mp4" autoPlay muted loop />
      <Button
        className="absolute right-6 bottom-6"
        size="icon"
        variant="outline"
        onClick={handleVideoPlayState}
      >
        {paused ? <Play fill="currentColor" /> : <Pause fill="currentColor" />}
      </Button>
    </>
  )
}
