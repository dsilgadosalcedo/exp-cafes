"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coffee, Sandwich, Cookie, Plus, Minus, ShoppingCart, Star, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import { useMenuItems, useCreateOrder } from "@/lib/api/queries"
import { ModifiersSheet } from "./modifiers-sheet"
import type { MenuItem, OrderItem, SelectedModifier, Order } from "@/lib/types"
import { offlineStorage } from "@/lib/offline/offline-storage"

export function PosLayout() {
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<"drinks" | "food" | "pastries">("drinks")
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
  const [isModifiersOpen, setIsModifiersOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const { data: menuItems = [], isLoading } = useMenuItems()
  const createOrderMutation = useCreateOrder()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const addToOrder = (menuItem: MenuItem, modifiers: SelectedModifier[] = [], notes?: string) => {
    const modifierTotal = modifiers.reduce((sum, mod) => sum + mod.priceAdjustment, 0)
    const totalPrice = menuItem.price + modifierTotal

    const orderItem: OrderItem = {
      id: `${menuItem.id}-${Date.now()}`,
      menuItemId: menuItem.id,
      name: menuItem.name,
      basePrice: menuItem.price,
      quantity: 1,
      modifiers,
      totalPrice,
      notes,
    }

    setCurrentOrder((prev) => {
      // Check if identical item exists (same modifiers)
      const existingItemIndex = prev.findIndex(
        (item) =>
          item.menuItemId === menuItem.id &&
          JSON.stringify(item.modifiers) === JSON.stringify(modifiers) &&
          item.notes === notes,
      )

      if (existingItemIndex >= 0) {
        return prev.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }

      return [...prev, orderItem]
    })
  }

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.modifiers && item.modifiers.length > 0) {
      setSelectedMenuItem(item)
      setIsModifiersOpen(true)
    } else {
      addToOrder(item)
    }
  }

  const updateQuantity = (id: string, change: number) => {
    setCurrentOrder((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + change
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    })
  }

  const getTotalPrice = () => {
    return currentOrder.reduce((total, item) => total + item.totalPrice * item.quantity, 0)
  }

  const handleProcessPayment = async () => {
    if (currentOrder.length === 0) return

    const subtotal = getTotalPrice()
    const tax = subtotal * 0.08 // 8% tax
    const total = subtotal + tax

    const orderData: Omit<Order, "id" | "createdAt"> = {
      orderNumber: `ORD-${Date.now()}`,
      items: currentOrder,
      subtotal,
      tax,
      total,
      status: "pending",
      timestamp: new Date().toISOString(),
    }

    try {
      if (isOnline) {
        // Try online first
        await createOrderMutation.mutateAsync(orderData)
      } else {
        // Save offline and queue for sync
        const offlineOrder: Order = {
          ...orderData,
          id: Date.now(), // Temporary ID for offline
          createdAt: new Date().toISOString(),
        }
        await offlineStorage.saveOrder(offlineOrder)
      }

      setCurrentOrder([])
      // Show success message
    } catch (error) {
      console.error("Failed to create order:", error)
      // Fallback to offline storage
      if (isOnline) {
        const offlineOrder: Order = {
          ...orderData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        }
        await offlineStorage.saveOrder(offlineOrder)
        setCurrentOrder([])
      }
    }
  }

  const filteredItems = menuItems.filter((item) => item.category === selectedCategory)
  const favoriteItems = menuItems.filter((item) => item.isFavorite)

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading menu...</div>
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Product Grid Section */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-heading text-2xl font-black text-foreground">Point of Sale</h1>
            <div className="flex items-center gap-2">
              {!isOnline && (
                <Badge variant="destructive" className="text-xs">
                  Offline Mode
                </Badge>
              )}
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Favorites Bar */}
          {favoriteItems.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-accent" />
                <h3 className="font-medium text-sm text-foreground">Favorites</h3>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {favoriteItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleMenuItemClick(item)}
                    className="whitespace-nowrap"
                  >
                    {item.name} - ${item.price.toFixed(2)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex gap-2 mb-6">
            {(["drinks", "food", "pastries"] as const).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-card border-border relative"
              onClick={() => handleMenuItemClick(item)}
            >
              {item.isFavorite && <Star className="absolute top-2 right-2 h-4 w-4 text-accent fill-current" />}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="text-accent">
                  {item.category === "drinks" && <Coffee className="h-6 w-6" />}
                  {item.category === "food" && <Sandwich className="h-6 w-6" />}
                  {item.category === "pastries" && <Cookie className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="font-medium text-card-foreground text-sm">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mb-1">{item.description}</p>
                  <p className="text-lg font-semibold text-accent">${item.price.toFixed(2)}</p>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <Badge variant="outline" className="text-xs mt-1">
                      Customizable
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Order Summary Section */}
      <div className="w-80 bg-card border-l border-border p-6">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="h-5 w-5 text-accent" />
          <h2 className="font-heading text-lg font-bold text-card-foreground">Current Order</h2>
        </div>

        {/* Order Items */}
        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {currentOrder.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No items in order</p>
          ) : (
            currentOrder.map((item) => (
              <div key={item.id} className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-foreground">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">${item.basePrice.toFixed(2)} base</p>
                    {item.modifiers.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.modifiers.map((mod) => (
                          <div key={`${mod.modifierId}-${mod.optionId}`}>
                            {mod.optionName} {mod.priceAdjustment !== 0 && `(+$${mod.priceAdjustment.toFixed(2)})`}
                          </div>
                        ))}
                      </div>
                    )}
                    {item.notes && <p className="text-xs text-muted-foreground italic mt-1">{item.notes}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${item.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Badge variant="secondary" className="min-w-8 text-center">
                      {item.quantity}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-semibold text-sm">${(item.totalPrice * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Total */}
        {currentOrder.length > 0 && (
          <div className="border-t border-border pt-4 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%):</span>
                <span>${(getTotalPrice() * 0.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="font-heading text-lg font-bold text-foreground">Total:</span>
                <span className="font-heading text-xl font-black text-accent">
                  ${(getTotalPrice() * 1.08).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={handleProcessPayment}
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending
                  ? "Processing..."
                  : isOnline
                    ? "Process Payment"
                    : "Save Order (Offline)"}
              </Button>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setCurrentOrder([])}>
                Clear Order
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modifiers Sheet */}
      {selectedMenuItem && (
        <ModifiersSheet
          isOpen={isModifiersOpen}
          onClose={() => {
            setIsModifiersOpen(false)
            setSelectedMenuItem(null)
          }}
          menuItem={selectedMenuItem}
          onAddToOrder={addToOrder}
        />
      )}
    </div>
  )
}
