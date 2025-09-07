"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  Clock,
  RefreshCw,
} from "lucide-react"
import {
  useBusinessMetrics,
  useSalesReport,
  useStaffMembers,
  useActiveShifts,
  useLowStockAlerts,
} from "@/lib/api/queries"
import { SalesChart } from "./sales-chart"
import { MenuManagement } from "./menu-management"
import { StaffManagement } from "./staff-management"
import { ThemeEditor } from "../theme/theme-editor"

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"]

export function AdminDashboard() {
  const { data: metrics, isLoading: metricsLoading } = useBusinessMetrics()
  const { data: salesData = [] } = useSalesReport()
  const { data: staff = [] } = useStaffMembers()
  const { data: activeShifts = [] } = useActiveShifts()
  const { data: alerts = [] } = useLowStockAlerts()

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-accent" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const topSellingData = salesData[salesData.length - 1]?.topSellingItems || []

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-accent" />
          <h1 className="font-heading text-3xl font-black text-foreground">Admin Dashboard</h1>
        </div>
        <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales & Reports</TabsTrigger>
          <TabsTrigger value="menu">Menu Management</TabsTrigger>
          <TabsTrigger value="staff">Staff Management</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Today's Sales</p>
                  <p className="text-2xl font-bold">${metrics?.todaySales.toFixed(2)}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {(metrics?.salesGrowth || 0) >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`${(metrics?.salesGrowth || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {Math.abs(metrics?.salesGrowth || 0)}% vs yesterday
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Today's Orders</p>
                  <p className="text-2xl font-bold">{metrics?.todayOrders}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {(metrics?.orderGrowth || 0) >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`${(metrics?.orderGrowth || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {Math.abs(metrics?.orderGrowth || 0)}% vs yesterday
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Staff</p>
                  <p className="text-2xl font-bold">{metrics?.activeStaff}</p>
                  <p className="text-xs text-muted-foreground">{staff.filter((s) => s.isActive).length} total staff</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock Items</p>
                  <p className="text-2xl font-bold">{metrics?.lowStockItems}</p>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <Card className="p-4 border-l-4 border-l-orange-500 bg-orange-50">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-orange-800">System Alerts</h3>
              </div>
              <div className="space-y-2">
                {alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex justify-between items-center text-sm">
                    <span className="text-orange-700">{alert.itemName} is running low</span>
                    <Badge variant={alert.severity === "out" ? "destructive" : "secondary"}>
                      {alert.currentStock} left
                    </Badge>
                  </div>
                ))}
                {alerts.length > 3 && <p className="text-xs text-orange-600">+{alerts.length - 3} more alerts</p>}
              </div>
            </Card>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Sales Trend (7 Days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Sales"]}
                  />
                  <Line type="monotone" dataKey="totalSales" stroke="#6366f1" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Top Selling Items */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Top Selling Items (Today)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={topSellingData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ itemName, quantitySold }) => `${itemName}: ${quantitySold}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="quantitySold"
                  >
                    {topSellingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Active Shifts */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Active Shifts
            </h3>
            {activeShifts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No active shifts</p>
            ) : (
              <div className="space-y-3">
                {activeShifts.map((shift) => (
                  <div key={shift.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{shift.staffName}</p>
                      <p className="text-sm text-muted-foreground">
                        Started: {new Date(shift.clockIn).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {Math.floor((Date.now() - new Date(shift.clockIn).getTime()) / (1000 * 60 * 60))}h active
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <SalesChart />
        </TabsContent>

        <TabsContent value="menu">
          <MenuManagement />
        </TabsContent>

        <TabsContent value="staff">
          <StaffManagement />
        </TabsContent>

        <TabsContent value="themes">
          <ThemeEditor />
        </TabsContent>
      </Tabs>
    </div>
  )
}
