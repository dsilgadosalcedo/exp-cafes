"use client"

import type React from "react"

import { useEffect, useState } from "react"

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false)

  useEffect(() => {
    const initMSW = async () => {
      if (typeof window !== "undefined") {
        const { worker } = await import("../../lib/api/browser")
        await worker.start({
          onUnhandledRequest: "bypass",
        })
        setMswReady(true)
      }
    }

    initMSW()
  }, [])

  if (!mswReady) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return <>{children}</>
}
