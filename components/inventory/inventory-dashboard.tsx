"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Package, AlertTriangle, TrendingDown, TrendingUp, RefreshCw, Search } from "lucide-react"
import { useInventoryItems, useLowStockAlerts } from "@/lib/api/queries"
import type { InventoryItem } from "@/lib/types"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { StockAdjustmentDialog } from "./stock-adjustment-dialog"

export function InventoryDashboard() {
  const { data: inventory = [], isLoading, refetch } = useInventoryItems()
  const { data: alerts = [] } = useLowStockAlerts()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false)

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return "out"
    if (item.currentStock <= item.minStock * 0.5) return "critical"
    if (item.currentStock <= item.minStock) return "low"
    return "good"
  }

  const getStockBadge = (status: string) => {
    switch (status) {
      case "out":
        return <Badge variant="destructive">Out of Stock</Badge>
      case "critical":
        return <Badge className="bg-red-500 text-white">Critical</Badge>
      case "low":
        return <Badge className="bg-yellow-500 text-white">Low Stock</Badge>
      default:
        return <Badge className="bg-green-500 text-white">In Stock</Badge>
    }
  }

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalValue = inventory.reduce((sum, item) => sum + item.currentStock * item.costPerUnit, 0)
  const lowStockCount = inventory.filter((item) => getStockStatus(item) !== "good").length
  const outOfStockCount = inventory.filter((item) => item.currentStock === 0).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-accent" />
          <p>Loading inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-accent" />
          <h1 className="font-heading text-3xl font-black text-foreground">Inventory Management</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{inventory.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingDown className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold text-green-600">${totalValue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card className="p-4 mb-6 border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Stock Alerts</h3>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex justify-between items-center text-sm">
                <span className="text-red-700">{alert.itemName}</span>
                <Badge variant={alert.severity === "out" ? "destructive" : "secondary"}>
                  {alert.currentStock} / {alert.minStock} {alert.severity === "out" ? "OUT" : "LOW"}
                </Badge>
              </div>
            ))}
            {alerts.length > 3 && <p className="text-xs text-red-600">+{alerts.length - 3} more alerts</p>}
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {["all", "drinks", "food", "pastries", "ingredients"].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInventory.map((item) => {
          const status = getStockStatus(item)
          const stockPercentage = (item.currentStock / item.maxStock) * 100

          return (
            <Card key={item.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
                </div>
                {getStockBadge(status)}
              </div>

              <div className="space-y-3">
                {/* Stock Level Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Stock Level</span>
                    <span>
                      {item.currentStock} / {item.maxStock} {item.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status === "out"
                          ? "bg-red-500"
                          : status === "critical"
                            ? "bg-red-400"
                            : status === "low"
                              ? "bg-yellow-400"
                              : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Item Details */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Min Stock:</span>
                    <span className="ml-1 font-medium">{item.minStock}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cost/Unit:</span>
                    <span className="ml-1 font-medium">${item.costPerUnit}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Supplier:</span>
                    <span className="ml-1 font-medium text-xs">{item.supplier || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Restocked:</span>
                    <span className="ml-1 font-medium text-xs">
                      {item.lastRestocked
                        ? formatDistanceToNow(new Date(item.lastRestocked), { addSuffix: true })
                        : "Never"}
                    </span>
                  </div>
                </div>

                {/* Total Value */}
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Value:</span>
                    <span className="font-bold">${(item.currentStock * item.costPerUnit).toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full bg-transparent"
                  variant="outline"
                  onClick={() => {
                    setSelectedItem(item)
                    setIsAdjustmentOpen(true)
                  }}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Adjust Stock
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Stock Adjustment Dialog */}
      {selectedItem && (
        <StockAdjustmentDialog
          isOpen={isAdjustmentOpen}
          onClose={() => {
            setIsAdjustmentOpen(false)
            setSelectedItem(null)
          }}
          item={selectedItem}
        />
      )}
    </div>
  )
}
