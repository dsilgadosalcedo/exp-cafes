"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, ChefHat, Package, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCafeTheme } from "@/lib/theme-context"
import { OfflineIndicator } from "@/components/offline/offline-indicator"

export function NavBar() {
  const pathname = usePathname()
  const { currentTheme, isPreviewMode } = useCafeTheme()

  return (
    <nav className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-heading text-xl font-bold text-foreground">{currentTheme.branding.businessName}</h1>
          {isPreviewMode && <Badge className="bg-orange-500 text-white">Preview Mode</Badge>}
          <OfflineIndicator />
        </div>
        <div className="flex gap-2">
          <Button asChild variant={pathname === "/" ? "default" : "outline"} size="sm">
            <Link href="/">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Point of Sale
            </Link>
          </Button>
          <Button asChild variant={pathname === "/kitchen" ? "default" : "outline"} size="sm">
            <Link href="/kitchen">
              <ChefHat className="h-4 w-4 mr-2" />
              Kitchen Display
            </Link>
          </Button>
          <Button asChild variant={pathname === "/inventory" ? "default" : "outline"} size="sm">
            <Link href="/inventory">
              <Package className="h-4 w-4 mr-2" />
              Inventory
            </Link>
          </Button>
          <Button asChild variant={pathname === "/admin" ? "default" : "outline"} size="sm">
            <Link href="/admin">
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
