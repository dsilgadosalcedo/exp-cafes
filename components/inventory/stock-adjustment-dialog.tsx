"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useUpdateStock } from "@/lib/api/queries"
import type { InventoryItem, StockAdjustment } from "@/lib/types"
import { Plus, Minus, Package, Trash2 } from "lucide-react"

interface StockAdjustmentDialogProps {
  isOpen: boolean
  onClose: () => void
  item: InventoryItem
}

export function StockAdjustmentDialog({ isOpen, onClose, item }: StockAdjustmentDialogProps) {
  const [adjustmentType, setAdjustmentType] = useState<StockAdjustment["type"]>("restock")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")
  const updateStock = useUpdateStock()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const quantityNum = Number.parseInt(quantity)
    if (isNaN(quantityNum) || quantityNum <= 0) return

    try {
      await updateStock.mutateAsync({
        itemId: item.id,
        adjustment: {
          inventoryItemId: item.id,
          type: adjustmentType,
          quantity: quantityNum,
          reason: reason || undefined,
          createdBy: "current-user", // In real app, get from auth context
        },
      })

      setQuantity("")
      setReason("")
      onClose()
    } catch (error) {
      console.error("Failed to update stock:", error)
    }
  }

  const getNewStock = () => {
    const quantityNum = Number.parseInt(quantity) || 0
    switch (adjustmentType) {
      case "restock":
        return item.currentStock + quantityNum
      case "waste":
      case "sale":
        return Math.max(0, item.currentStock - quantityNum)
      case "adjustment":
        return quantityNum
      default:
        return item.currentStock
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Adjust Stock: {item.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Current Stock:</span>
              <span className="font-medium">
                {item.currentStock} {item.unit}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Min Stock:</span>
              <span className="font-medium">
                {item.minStock} {item.unit}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Adjustment Type</Label>
            <RadioGroup
              value={adjustmentType}
              onValueChange={(value) => setAdjustmentType(value as StockAdjustment["type"])}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="restock" id="restock" />
                <Label htmlFor="restock" className="flex items-center gap-2 cursor-pointer">
                  <Plus className="h-4 w-4 text-green-600" />
                  Restock (Add inventory)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="waste" id="waste" />
                <Label htmlFor="waste" className="flex items-center gap-2 cursor-pointer">
                  <Trash2 className="h-4 w-4 text-red-600" />
                  Waste (Remove damaged/expired)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sale" id="sale" />
                <Label htmlFor="sale" className="flex items-center gap-2 cursor-pointer">
                  <Minus className="h-4 w-4 text-blue-600" />
                  Sale (Manual sale entry)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="adjustment" id="adjustment" />
                <Label htmlFor="adjustment" className="flex items-center gap-2 cursor-pointer">
                  <Package className="h-4 w-4 text-gray-600" />
                  Manual Adjustment (Set exact amount)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              {adjustmentType === "adjustment" ? "New Stock Level" : "Quantity"} ({item.unit})
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={adjustmentType === "adjustment" ? "Enter new stock level" : "Enter quantity"}
              required
            />
          </div>

          {quantity && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>New Stock Level:</span>
                <span className="font-medium">
                  {getNewStock()} {item.unit}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for adjustment..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={updateStock.isPending || !quantity}>
              {updateStock.isPending ? "Updating..." : "Update Stock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
