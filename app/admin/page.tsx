import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { NavBar } from "@/components/navigation/nav-bar"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main>
        <AdminDashboard />
      </main>
    </div>
  )
}
