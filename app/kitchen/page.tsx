import { KitchenDisplay } from "@/components/kitchen/kitchen-display"
import { NavBar } from "@/components/navigation/nav-bar"

export default function KitchenPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main>
        <KitchenDisplay />
      </main>
    </div>
  )
}
