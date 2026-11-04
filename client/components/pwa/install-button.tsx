"use client"

import { useEffect, useState } from "react"

import { Download } from "lucide-react"
import { Button } from "../ui/button"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt(): Promise<void>
  userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
}

export function InstallButton() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)

  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check whether the app is already installed.
    const standalone = window.matchMedia("(display-mode: standalone)").matches

    const iosStandalone =
      "standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true

    if (standalone || iosStandalone) {
      setIsInstalled(true)
    }

    // Capture the native installation prompt.
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault()

      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    // Detect successful installation.
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)

      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return

    await installPrompt.prompt()

    const { outcome } = await installPrompt.userChoice

    if (outcome === "accepted") {
      setIsInstalled(true)
    }

    setInstallPrompt(null)
  }

  if (isInstalled || !installPrompt) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="lg"
      className="gap-2 rounded-full border-border/80 bg-background/70 px-6 text-sm"
      onClick={handleInstall}
    >
      <span>Download</span>
      <Download />
    </Button>
  )
}
