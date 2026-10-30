"use client"

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import LocomotiveScroll from "locomotive-scroll"

import "locomotive-scroll/dist/locomotive-scroll.css"

const LocomotiveScrollContext = createContext<
  LocomotiveScroll | null | undefined
>(undefined)

export function LocomotiveScrollProvider({
  children,
}: {
  children: ReactNode
}) {
  const [locomotiveScroll, setLocomotiveScroll] =
    useState<LocomotiveScroll | null>(null)

  useEffect(() => {
    const ls = new LocomotiveScroll({
      lenisOptions: {
        syncTouch: false,
      },
    })

    setLocomotiveScroll(ls)

    return () => ls.destroy()
  }, [])

  return (
    <LocomotiveScrollContext.Provider value={locomotiveScroll}>
      {children}
    </LocomotiveScrollContext.Provider>
  )
}

export function useLocomotiveScroll() {
  const context = useContext(LocomotiveScrollContext)

  if (context === undefined)
    throw new Error(
      "useLocomotiveScroll must be used inside a LocomotiveScrollProvider only"
    )

  return context
}
