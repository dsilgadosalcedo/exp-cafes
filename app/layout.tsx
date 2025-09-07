import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { Open_Sans } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { QueryProvider } from "@/components/providers/query-provider"
import { MSWProvider } from "@/components/providers/msw-provider"
import { CafeThemeProvider } from "@/lib/theme-context"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-montserrat",
  display: "swap",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-open-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Cafe POS System",
  description: "Modern cafe management and point of sale system",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${montserrat.variable} ${openSans.variable} ${GeistMono.variable}`}>
        <MSWProvider>
          <QueryProvider>
            <CafeThemeProvider>
              <Suspense fallback={null}>{children}</Suspense>
            </CafeThemeProvider>
          </QueryProvider>
        </MSWProvider>
        <Analytics />
      </body>
    </html>
  )
}
