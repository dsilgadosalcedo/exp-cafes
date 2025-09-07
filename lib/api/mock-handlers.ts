import { http, HttpResponse } from "msw"
import { mockMenuItems, mockInventoryItems } from "../mock-data"
import type {
  Order,
  InventoryItem,
  StockAdjustment,
  LowStockAlert,
  StaffMember,
  Shift,
  SalesReport,
  BusinessMetrics,
  MenuItem,
} from "../types"

let orderIdCounter = 4
const orders: Order[] = [
  {
    id: "order-1",
    items: [
      {
        id: "item-1",
        menuItemId: "2",
        name: "Cappuccino",
        basePrice: 4.0,
        quantity: 2,
        modifiers: [
          { modifierId: "size", modifierName: "Size", optionId: "large", optionName: "Large", priceAdjustment: 0.75 },
          {
            modifierId: "milk",
            modifierName: "Milk Type",
            optionId: "oat",
            optionName: "Oat Milk",
            priceAdjustment: 0.6,
          },
        ],
        totalPrice: 5.35,
        notes: "Extra hot please",
      },
    ],
    subtotal: 10.7,
    tax: 0.86,
    total: 11.56,
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
  {
    id: "order-2",
    items: [
      {
        id: "item-2",
        menuItemId: "3",
        name: "Latte",
        basePrice: 4.5,
        quantity: 1,
        modifiers: [
          {
            modifierId: "syrup",
            modifierName: "Syrup",
            optionId: "vanilla",
            optionName: "Vanilla",
            priceAdjustment: 0.5,
          },
        ],
        totalPrice: 5.0,
      },
      {
        id: "item-3",
        menuItemId: "5",
        name: "Croissant",
        basePrice: 3.5,
        quantity: 1,
        modifiers: [],
        totalPrice: 3.5,
      },
    ],
    subtotal: 8.5,
    tax: 0.68,
    total: 9.18,
    status: "preparing",
    createdAt: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
  },
  {
    id: "order-3",
    items: [
      {
        id: "item-4",
        menuItemId: "1",
        name: "Espresso",
        basePrice: 2.5,
        quantity: 3,
        modifiers: [
          {
            modifierId: "extras",
            modifierName: "Extras",
            optionId: "extra-shot",
            optionName: "Extra Shot",
            priceAdjustment: 0.75,
          },
        ],
        totalPrice: 3.25,
      },
    ],
    subtotal: 9.75,
    tax: 0.78,
    total: 10.53,
    status: "ready",
    createdAt: new Date(Date.now() - 18 * 60 * 1000), // 18 minutes ago
  },
]

const inventory: InventoryItem[] = [...mockInventoryItems]
const adjustmentIdCounter = 1

const mockStaff: StaffMember[] = [
  {
    id: "staff-1",
    name: "Alice Johnson",
    email: "alice@cafe.com",
    role: "manager",
    hourlyRate: 18.5,
    isActive: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "staff-2",
    name: "Bob Smith",
    email: "bob@cafe.com",
    role: "barista",
    hourlyRate: 15.0,
    isActive: true,
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "staff-3",
    name: "Carol Davis",
    email: "carol@cafe.com",
    role: "kitchen",
    hourlyRate: 16.0,
    isActive: true,
    createdAt: new Date("2024-01-20"),
  },
]

const mockShifts: Shift[] = [
  {
    id: "shift-1",
    staffId: "staff-1",
    staffName: "Alice Johnson",
    clockIn: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    status: "active",
  },
  {
    id: "shift-2",
    staffId: "staff-2",
    staffName: "Bob Smith",
    clockIn: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    status: "active",
  },
]

export const handlers = [
  // Get menu items
  http.get("/api/menu", () => {
    return HttpResponse.json(mockMenuItems)
  }),

  // Create order
  http.post("/api/orders", async ({ request }) => {
    const orderData = (await request.json()) as Omit<Order, "id" | "createdAt">

    const newOrder: Order = {
      ...orderData,
      id: `order-${orderIdCounter++}`,
      createdAt: new Date(),
    }

    // Decrement inventory for each item in the order
    orderData.items.forEach((orderItem) => {
      const inventoryItem = inventory.find((inv) => inv.menuItemId === orderItem.menuItemId)
      if (inventoryItem) {
        inventoryItem.currentStock = Math.max(0, inventoryItem.currentStock - orderItem.quantity)
      }
    })

    orders.push(newOrder)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return HttpResponse.json(newOrder, { status: 201 })
  }),

  // Get orders
  http.get("/api/orders", () => {
    return HttpResponse.json(orders)
  }),

  // Update order status
  http.patch("/api/orders/:id", async ({ params, request }) => {
    const { id } = params
    const updates = (await request.json()) as Partial<Order>

    const orderIndex = orders.findIndex((order) => order.id === id)
    if (orderIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    orders[orderIndex] = { ...orders[orderIndex], ...updates }

    return HttpResponse.json(orders[orderIndex])
  }),

  // Get inventory items
  http.get("/api/inventory", () => {
    return HttpResponse.json(inventory)
  }),

  // Update stock
  http.post("/api/inventory/:id/adjust", async ({ params, request }) => {
    const { id } = params
    const adjustment = (await request.json()) as Omit<StockAdjustment, "id" | "createdAt">

    const itemIndex = inventory.findIndex((item) => item.id === id)
    if (itemIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    const item = inventory[itemIndex]
    let newStock = item.currentStock

    switch (adjustment.type) {
      case "restock":
        newStock += adjustment.quantity
        break
      case "waste":
      case "sale":
        newStock -= adjustment.quantity
        break
      case "adjustment":
        newStock = adjustment.quantity
        break
    }

    // Ensure stock doesn't go below 0
    newStock = Math.max(0, newStock)

    inventory[itemIndex] = {
      ...item,
      currentStock: newStock,
      lastRestocked: adjustment.type === "restock" ? new Date() : item.lastRestocked,
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json(inventory[itemIndex])
  }),

  // Get low stock alerts
  http.get("/api/inventory/alerts", () => {
    const alerts: LowStockAlert[] = inventory
      .filter((item) => item.currentStock <= item.minStock)
      .map((item) => ({
        id: `alert-${item.id}`,
        inventoryItemId: item.id,
        itemName: item.name,
        currentStock: item.currentStock,
        minStock: item.minStock,
        severity: item.currentStock === 0 ? "out" : item.currentStock <= item.minStock * 0.5 ? "critical" : "low",
        createdAt: new Date(),
      }))

    return HttpResponse.json(alerts)
  }),

  // Get sales report
  http.get("/api/reports/sales", ({ request }) => {
    const url = new URL(request.url)
    const from = url.searchParams.get("from")
    const to = url.searchParams.get("to")

    // Generate mock sales data for the last 7 days
    const salesData: SalesReport[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const totalOrders = Math.floor(Math.random() * 50) + 20
      const totalSales = totalOrders * (Math.random() * 15 + 8) // $8-23 average

      salesData.push({
        date: date.toISOString().split("T")[0],
        totalSales: Math.round(totalSales * 100) / 100,
        totalOrders,
        averageOrderValue: Math.round((totalSales / totalOrders) * 100) / 100,
        topSellingItems: [
          {
            itemId: "2",
            itemName: "Cappuccino",
            quantitySold: Math.floor(totalOrders * 0.3),
            revenue: Math.round(totalOrders * 0.3 * 4.0 * 100) / 100,
          },
          {
            itemId: "3",
            itemName: "Latte",
            quantitySold: Math.floor(totalOrders * 0.25),
            revenue: Math.round(totalOrders * 0.25 * 4.5 * 100) / 100,
          },
          {
            itemId: "1",
            itemName: "Espresso",
            quantitySold: Math.floor(totalOrders * 0.2),
            revenue: Math.round(totalOrders * 0.2 * 2.5 * 100) / 100,
          },
        ],
      })
    }

    return HttpResponse.json(salesData)
  }),

  // Get business metrics
  http.get("/api/reports/metrics", () => {
    const todayOrders = Math.floor(Math.random() * 30) + 15
    const todaySales = todayOrders * (Math.random() * 10 + 10)

    const metrics: BusinessMetrics = {
      todaySales: Math.round(todaySales * 100) / 100,
      todayOrders,
      averageOrderValue: Math.round((todaySales / todayOrders) * 100) / 100,
      topSellingItem: "Cappuccino",
      lowStockItems: inventory.filter((item) => item.currentStock <= item.minStock).length,
      activeStaff: mockShifts.filter((shift) => shift.status === "active").length,
      salesGrowth: Math.round((Math.random() * 20 - 5) * 100) / 100, // -5% to +15%
      orderGrowth: Math.round((Math.random() * 15 - 2) * 100) / 100,
    }

    return HttpResponse.json(metrics)
  }),

  // Get staff members
  http.get("/api/staff", () => {
    return HttpResponse.json(mockStaff)
  }),

  // Get active shifts
  http.get("/api/shifts/active", () => {
    return HttpResponse.json(mockShifts)
  }),

  // Create menu item
  http.post("/api/menu", async ({ request }) => {
    const menuItemData = (await request.json()) as Omit<MenuItem, "id">

    const newMenuItem: MenuItem = {
      ...menuItemData,
      id: `menu-${Date.now()}`,
    }

    mockMenuItems.push(newMenuItem)

    return HttpResponse.json(newMenuItem, { status: 201 })
  }),

  // Update menu item
  http.patch("/api/menu/:id", async ({ params, request }) => {
    const { id } = params
    const updates = (await request.json()) as Partial<MenuItem>

    const itemIndex = mockMenuItems.findIndex((item) => item.id === id)
    if (itemIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    mockMenuItems[itemIndex] = { ...mockMenuItems[itemIndex], ...updates }

    return HttpResponse.json(mockMenuItems[itemIndex])
  }),
]
