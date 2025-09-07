import { InventoryDashboard } from "@/components/inventory/inventory-dashboard"
import { NavBar } from "@/components/navigation/nav-bar"

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main>
        <InventoryDashboard />
      </main>
    </div>
  )
}
