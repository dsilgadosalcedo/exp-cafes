"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { useSalesReport } from "@/lib/api/queries"
import { TrendingUp, DollarSign, ShoppingBag } from "lucide-react"

export function SalesChart() {
  const { data: salesData = [], isLoading } = useSalesReport()

  const totalSales = salesData.reduce((sum, day) => sum + day.totalSales, 0)
  const totalOrders = salesData.reduce((sum, day) => sum + day.totalOrders, 0)
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

  if (isLoading) {
    return <div className="text-center py-8">Loading sales data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Sales (7 days)</p>
              <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Orders (7 days)</p>
              <p className="text-2xl font-bold">{totalOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-bold">${averageOrderValue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Daily Sales</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Sales"]}
            />
            <Bar dataKey="totalSales" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Orders Chart */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Daily Orders</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: number) => [value, "Orders"]}
            />
            <Line type="monotone" dataKey="totalOrders" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
