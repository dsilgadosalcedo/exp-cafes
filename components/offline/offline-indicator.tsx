"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { syncManager } from "@/lib/offline/sync-manager"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingChanges, setPendingChanges] = useState(0)

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine)
    }

    const updatePendingChanges = async () => {
      const count = await syncManager.getPendingChangesCount()
      setPendingChanges(count)
    }

    // Initial check
    updateStatus()
    updatePendingChanges()

    // Listen for online/offline events
    window.addEventListener("online", updateStatus)
    window.addEventListener("offline", updateStatus)

    // Update pending changes periodically
    const interval = setInterval(updatePendingChanges, 5000)

    return () => {
      window.removeEventListener("online", updateStatus)
      window.removeEventListener("offline", updateStatus)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            Online
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Offline
          </>
        )}
      </Badge>

      {pendingChanges > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {pendingChanges} pending
        </Badge>
      )}
    </div>
  )
}
