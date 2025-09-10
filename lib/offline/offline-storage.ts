import { db } from "./database"
import { syncManager } from "./sync-manager"
import type { Order, MenuItem, InventoryItem } from "../types"

export class OfflineStorage {
  // Orders
  async saveOrder(order: Order): Promise<void> {
    await db.orders.put(order)

    // Add to sync queue if we have an ID (existing order) or if offline
    if (order.id || !syncManager.getOnlineStatus()) {
      await syncManager.addToSyncQueue("order", order.id ? "update" : "create", order)
    }
  }

  async getOrders(): Promise<Order[]> {
    return await db.orders.orderBy("timestamp").reverse().toArray()
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return await db.orders.get(id)
  }

  // Menu Items
  async saveMenuItem(item: MenuItem): Promise<void> {
    await db.menuItems.put(item)
    await syncManager.addToSyncQueue("menu", item.id ? "update" : "create", item)
  }

  async getMenuItems(): Promise<MenuItem[]> {
    return await db.menuItems.toArray()
  }

  // Inventory
  async saveInventoryItem(item: InventoryItem): Promise<void> {
    await db.inventory.put(item)
    await syncManager.addToSyncQueue("inventory", "update", item)
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    return await db.inventory.toArray()
  }

  async updateStock(itemId: number, newStock: number): Promise<void> {
    const item = await db.inventory.get(itemId)
    if (item) {
      item.currentStock = newStock
      item.lastRestocked = new Date()
      await this.saveInventoryItem(item)
    }
  }

  // Sync status
  async getPendingChangesCount(): Promise<number> {
    return await syncManager.getPendingChangesCount()
  }
}

export const offlineStorage = new OfflineStorage()
