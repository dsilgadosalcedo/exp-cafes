import { db, type SyncQueue } from "./database"

export class SyncManager {
  private isOnline = navigator.onLine
  private syncInProgress = false
  private maxRetries = 3

  constructor() {
    // Listen for online/offline events
    window.addEventListener("online", () => {
      this.isOnline = true
      this.syncPendingChanges()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
    })
  }

  async addToSyncQueue(type: SyncQueue["type"], action: SyncQueue["action"], data: any) {
    await db.syncQueue.add({
      type,
      action,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    })

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncPendingChanges()
    }
  }

  async syncPendingChanges() {
    if (this.syncInProgress || !this.isOnline) return

    this.syncInProgress = true

    try {
      const pendingItems = await db.syncQueue.orderBy("timestamp").toArray()

      for (const item of pendingItems) {
        try {
          await this.syncItem(item)
          await db.syncQueue.delete(item.id!)
        } catch (error) {
          console.error("[v0] Sync failed for item:", item, error)

          // Increment retry count
          if (item.retryCount < this.maxRetries) {
            await db.syncQueue.update(item.id!, {
              retryCount: item.retryCount + 1,
            })
          } else {
            // Max retries reached, remove from queue
            await db.syncQueue.delete(item.id!)
          }
        }
      }
    } finally {
      this.syncInProgress = false
    }
  }

  private async syncItem(item: SyncQueue) {
    const endpoint = this.getEndpoint(item.type, item.action)
    const method = this.getHttpMethod(item.action)

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: method !== "GET" ? JSON.stringify(item.data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`)
    }
  }

  private getEndpoint(type: string, action: string): string {
    const baseUrl = "/api"
    switch (type) {
      case "order":
        return action === "create" ? `${baseUrl}/orders` : `${baseUrl}/orders/${action}`
      case "inventory":
        return `${baseUrl}/inventory`
      case "menu":
        return `${baseUrl}/menu`
      case "staff":
        return `${baseUrl}/staff`
      default:
        throw new Error(`Unknown sync type: ${type}`)
    }
  }

  private getHttpMethod(action: string): string {
    switch (action) {
      case "create":
        return "POST"
      case "update":
        return "PUT"
      case "delete":
        return "DELETE"
      default:
        return "GET"
    }
  }

  getOnlineStatus() {
    return this.isOnline
  }

  async getPendingChangesCount(): Promise<number> {
    return await db.syncQueue.count()
  }
}

export const syncManager = new SyncManager()
