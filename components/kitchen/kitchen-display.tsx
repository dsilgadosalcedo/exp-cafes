"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, ChefHat, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { useOrders, useUpdateOrderStatus } from "@/lib/api/queries"
import type { Order } from "@/lib/types"
import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"

const statusConfig = {
  pending: {
    label: "New Order",
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    icon: AlertTriangle,
  },
  preparing: {
    label: "Preparing",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    icon: ChefHat,
  },
  ready: {
    label: "Ready",
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    icon: CheckCircle,
  },
  completed: {
    label: "Completed",
    color: "bg-gray-500",
    textColor: "text-gray-700",
    bgColor: "bg-gray-50",
    icon: CheckCircle,
  },
}

export function KitchenDisplay() {
  const { data: orders = [], isLoading, refetch } = useOrders()
  const updateOrderStatus = useUpdateOrderStatus()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute for relative timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 30000)
    return () => clearInterval(interval)
  }, [refetch])

  const handleStatusUpdate = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status: newStatus })
    } catch (error) {
      console.error("Failed to update order status:", error)
    }
  }

  const getNextStatus = (currentStatus: Order["status"]): Order["status"] | null => {
    switch (currentStatus) {
      case "pending":
        return "preparing"
      case "preparing":
        return "ready"
      case "ready":
        return "completed"
      default:
        return null
    }
  }

  const getOrderPriority = (order: Order) => {
    const minutesOld = (currentTime.getTime() - new Date(order.createdAt).getTime()) / (1000 * 60)
    if (minutesOld > 15) return "urgent"
    if (minutesOld > 10) return "high"
    return "normal"
  }

  const activeOrders = orders.filter((order) => order.status !== "completed")
  const pendingOrders = activeOrders.filter((order) => order.status === "pending")
  const preparingOrders = activeOrders.filter((order) => order.status === "preparing")
  const readyOrders = activeOrders.filter((order) => order.status === "ready")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-accent" />
          <p>Loading kitchen display...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-accent" />
          <h1 className="font-heading text-3xl font-black text-foreground">Kitchen Display</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">Last updated: {currentTime.toLocaleTimeString()}</div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{pendingOrders.length}</div>
          <div className="text-sm text-muted-foreground">New Orders</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{preparingOrders.length}</div>
          <div className="text-sm text-muted-foreground">Preparing</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{readyOrders.length}</div>
          <div className="text-sm text-muted-foreground">Ready</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-accent">{activeOrders.length}</div>
          <div className="text-sm text-muted-foreground">Total Active</div>
        </Card>
      </div>

      {/* Orders Grid */}
      {activeOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <ChefHat className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-heading text-xl font-bold mb-2">No Active Orders</h3>
          <p className="text-muted-foreground">All caught up! New orders will appear here.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeOrders
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((order) => {
              const config = statusConfig[order.status]
              const priority = getOrderPriority(order)
              const nextStatus = getNextStatus(order.status)
              const Icon = config.icon

              return (
                <Card
                  key={order.id}
                  className={`p-4 ${config.bgColor} border-l-4 ${
                    priority === "urgent"
                      ? "border-l-red-500"
                      : priority === "high"
                        ? "border-l-yellow-500"
                        : "border-l-gray-300"
                  }`}
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${config.textColor}`} />
                      <Badge className={`${config.color} text-white`}>{config.label}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold">#{order.id.slice(-4)}</div>
                      {priority === "urgent" && (
                        <Badge variant="destructive" className="text-xs">
                          URGENT
                        </Badge>
                      )}
                      {priority === "high" && (
                        <Badge variant="secondary" className="text-xs bg-yellow-500 text-white">
                          HIGH
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Order Time */}
                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="bg-white/50 rounded p-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {item.quantity}x {item.name}
                            </div>
                            {item.modifiers.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {item.modifiers.map((mod) => mod.optionName).join(", ")}
                              </div>
                            )}
                            {item.notes && <div className="text-xs text-blue-600 mt-1 italic">Note: {item.notes}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="flex justify-between items-center mb-4 pt-2 border-t">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">${order.total.toFixed(2)}</span>
                  </div>

                  {/* Action Button */}
                  {nextStatus && (
                    <Button
                      className="w-full"
                      onClick={() => handleStatusUpdate(order.id, nextStatus)}
                      disabled={updateOrderStatus.isPending}
                      variant={order.status === "ready" ? "default" : "secondary"}
                    >
                      {updateOrderStatus.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Icon className="h-4 w-4 mr-2" />
                      )}
                      {nextStatus === "preparing" && "Start Preparing"}
                      {nextStatus === "ready" && "Mark Ready"}
                      {nextStatus === "completed" && "Complete Order"}
                    </Button>
                  )}
                </Card>
              )
            })}
        </div>
      )}
    </div>
  )
}
