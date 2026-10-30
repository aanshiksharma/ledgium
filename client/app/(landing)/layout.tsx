"use client"

import { ReactNode } from "react"

import { LocomotiveScrollProvider } from "@/providers/locomotive-scroll-provider"

import { LandingAuthRedirector } from "@/features/auth"
import { LandingFooter, LandingHeader } from "@/features/landing"

export default function LandingPageLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <LocomotiveScrollProvider>
      <LandingHeader />

      <main className="mx-auto flex min-h-screen max-w-360 flex-col items-center justify-center p-6 max-[90rem]:overflow-x-clip">
        <LandingAuthRedirector />

        {children}
      </main>

      <LandingFooter />
    </LocomotiveScrollProvider>
  )
}
