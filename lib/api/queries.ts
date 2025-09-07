import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  MenuItem,
  Order,
  InventoryItem,
  StockAdjustment,
  SalesReport,
  BusinessMetrics,
  StaffMember,
  Shift,
} from "../types"

export function useMenuItems() {
  return useQuery({
    queryKey: ["menu"],
    queryFn: async (): Promise<MenuItem[]> => {
      const response = await fetch("/api/menu")
      if (!response.ok) throw new Error("Failed to fetch menu")
      return response.json()
    },
  })
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async (): Promise<Order[]> => {
      const response = await fetch("/api/orders")
      if (!response.ok) throw new Error("Failed to fetch orders")
      return response.json()
    },
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderData: Omit<Order, "id" | "createdAt">): Promise<Order> => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })
      if (!response.ok) throw new Error("Failed to create order")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Order["status"] }) => {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Failed to update order")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}

export function useInventoryItems() {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: async (): Promise<InventoryItem[]> => {
      const response = await fetch("/api/inventory")
      if (!response.ok) throw new Error("Failed to fetch inventory")
      return response.json()
    },
  })
}

export function useUpdateStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      itemId,
      adjustment,
    }: { itemId: string; adjustment: Omit<StockAdjustment, "id" | "createdAt"> }): Promise<InventoryItem> => {
      const response = await fetch(`/api/inventory/${itemId}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adjustment),
      })
      if (!response.ok) throw new Error("Failed to update stock")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
    },
  })
}

export function useLowStockAlerts() {
  return useQuery({
    queryKey: ["low-stock-alerts"],
    queryFn: async () => {
      const response = await fetch("/api/inventory/alerts")
      if (!response.ok) throw new Error("Failed to fetch alerts")
      return response.json()
    },
  })
}

export function useSalesReport(dateRange?: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ["sales-report", dateRange],
    queryFn: async (): Promise<SalesReport[]> => {
      const params = new URLSearchParams()
      if (dateRange) {
        params.set("from", dateRange.from.toISOString())
        params.set("to", dateRange.to.toISOString())
      }
      const response = await fetch(`/api/reports/sales?${params}`)
      if (!response.ok) throw new Error("Failed to fetch sales report")
      return response.json()
    },
  })
}

export function useBusinessMetrics() {
  return useQuery({
    queryKey: ["business-metrics"],
    queryFn: async (): Promise<BusinessMetrics> => {
      const response = await fetch("/api/reports/metrics")
      if (!response.ok) throw new Error("Failed to fetch business metrics")
      return response.json()
    },
  })
}

export function useStaffMembers() {
  return useQuery({
    queryKey: ["staff"],
    queryFn: async (): Promise<StaffMember[]> => {
      const response = await fetch("/api/staff")
      if (!response.ok) throw new Error("Failed to fetch staff")
      return response.json()
    },
  })
}

export function useActiveShifts() {
  return useQuery({
    queryKey: ["active-shifts"],
    queryFn: async (): Promise<Shift[]> => {
      const response = await fetch("/api/shifts/active")
      if (!response.ok) throw new Error("Failed to fetch active shifts")
      return response.json()
    },
  })
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (menuItem: Omit<MenuItem, "id">): Promise<MenuItem> => {
      const response = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuItem),
      })
      if (!response.ok) throw new Error("Failed to create menu item")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] })
    },
  })
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MenuItem> }): Promise<MenuItem> => {
      const response = await fetch(`/api/menu/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error("Failed to update menu item")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] })
    },
  })
}
