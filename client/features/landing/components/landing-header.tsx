"use client"

import Link from "next/link"
import gsap from "gsap"
import { useState, useEffect } from "react"

import { ArrowUpRight, Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"

import { TemporaryLogo } from "@/components/common/temporary-logo"

import { useLocomotiveScroll } from "@/providers/locomotive-scroll-provider"

import { landingNavigation } from "../content/landing-content"

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  const locomotive = useLocomotiveScroll()

  const animationOptions = {
    ease: "power1.out",
    duration: 0.8,
  }

  useEffect(() => {
    if (!locomotive) return

    const toggleScroll = (hide: boolean) => {
      if (hide) {
        gsap.to("#header", {
          yPercent: -100,
          ...animationOptions,
          duration: 1.5,
        })
      } else {
        gsap.to("#header", {
          yPercent: 0,
          ...animationOptions,
        })
      }
    }

    window.addEventListener("scroll", () => {
      const lenisInstance = locomotive.lenisInstance
      if (!lenisInstance) return

      toggleScroll(lenisInstance.direction === 1)
    })
  }, [locomotive])

  return (
    <header
      id="header"
      className="fixed inset-0 bottom-auto z-50 border-b border-border/70 bg-background/30 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-360 items-center justify-between px-4 py-2 lg:px-6">
        <Link
          href="/"
          aria-label="Ledgium home"
          className="group flex items-center gap-3"
        >
          <TemporaryLogo />
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-4 md:flex"
        >
          {landingNavigation.map((item) => (
            <Button key={item.href} asChild variant="ghost" className="px-4">
              <a href={item.href}>{item.label}</a>
            </Button>
          ))}

          <Button asChild variant="ghost" className="px-4">
            <Link href="/login">Log in</Link>
          </Button>

          <Button asChild className="px-4">
            <Link href="/register">
              Get started <ArrowUpRight className="ml-1 size-4" />
            </Link>
          </Button>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="md:hidden"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {menuOpen && (
        <div className="border-t border-border px-5 py-5 md:hidden">
          <nav
            aria-label="Mobile navigation"
            className="mx-auto flex max-w-7xl flex-col gap-1"
          >
            {landingNavigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </a>
            ))}

            <div className="mt-3 grid gap-3">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/register">Get started</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
