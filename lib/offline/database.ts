import Dexie, { type Table } from "dexie"
import type { Order, MenuItem, InventoryItem, StaffMember } from "../types"

export interface SyncQueue {
  id?: number
  type: "order" | "inventory" | "menu" | "staff"
  action: "create" | "update" | "delete"
  data: any
  timestamp: number
  retryCount: number
}

export class OfflineDatabase extends Dexie {
  orders!: Table<Order>
  menuItems!: Table<MenuItem>
  inventory!: Table<InventoryItem>
  staff!: Table<StaffMember>
  syncQueue!: Table<SyncQueue>

  constructor() {
    super("CafePOSDatabase")

    this.version(1).stores({
      orders: "++id, orderNumber, status, timestamp, customerId",
      menuItems: "++id, name, category, price, available",
      inventory: "++id, itemId, currentStock, lastUpdated",
      staff: "++id, name, role, isActive",
      syncQueue: "++id, type, action, timestamp, retryCount",
    })
  }
}

export const db = new OfflineDatabase()
