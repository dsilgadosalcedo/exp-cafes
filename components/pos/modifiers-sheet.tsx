"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { MenuItem, Modifier, SelectedModifier } from "@/lib/types"

interface ModifiersSheetProps {
  isOpen: boolean
  onClose: () => void
  menuItem: MenuItem
  onAddToOrder: (item: MenuItem, modifiers: SelectedModifier[], notes?: string) => void
}

export function ModifiersSheet({ isOpen, onClose, menuItem, onAddToOrder }: ModifiersSheetProps) {
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([])
  const [notes, setNotes] = useState("")

  const handleModifierChange = (modifier: Modifier, optionId: string, checked: boolean) => {
    setSelectedModifiers((prev) => {
      const existing = prev.filter((m) => m.modifierId !== modifier.id)

      if (checked) {
        const option = modifier.options.find((o) => o.id === optionId)
        if (option) {
          const newModifier: SelectedModifier = {
            modifierId: modifier.id,
            modifierName: modifier.name,
            optionId: option.id,
            optionName: option.name,
            priceAdjustment: option.priceAdjustment,
          }

          if (modifier.maxSelections === 1) {
            return [...existing, newModifier]
          } else {
            const currentCount = prev.filter((m) => m.modifierId === modifier.id).length
            if (currentCount < (modifier.maxSelections || Number.POSITIVE_INFINITY)) {
              return [...prev, newModifier]
            }
          }
        }
      }

      return existing
    })
  }

  const calculateTotalPrice = () => {
    const modifierTotal = selectedModifiers.reduce((sum, mod) => sum + mod.priceAdjustment, 0)
    return menuItem.price + modifierTotal
  }

  const handleAddToOrder = () => {
    onAddToOrder(menuItem, selectedModifiers, notes)
    setSelectedModifiers([])
    setNotes("")
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-96">
        <SheetHeader>
          <SheetTitle className="font-heading">{menuItem.name}</SheetTitle>
          <p className="text-sm text-muted-foreground">{menuItem.description}</p>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {menuItem.modifiers?.map((modifier) => (
            <div key={modifier.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{modifier.name}</h4>
                {modifier.required && (
                  <Badge variant="secondary" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>

              {modifier.maxSelections === 1 ? (
                <RadioGroup
                  value={selectedModifiers.find((m) => m.modifierId === modifier.id)?.optionId || ""}
                  onValueChange={(value) => {
                    const currentSelection = selectedModifiers.find((m) => m.modifierId === modifier.id)
                    if (currentSelection) {
                      handleModifierChange(modifier, currentSelection.optionId, false)
                    }
                    if (value) {
                      handleModifierChange(modifier, value, true)
                    }
                  }}
                >
                  {modifier.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between">
                          <span>{option.name}</span>
                          {option.priceAdjustment !== 0 && (
                            <span className="text-sm text-muted-foreground">
                              {option.priceAdjustment > 0 ? "+" : ""}${option.priceAdjustment.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  {modifier.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={selectedModifiers.some(
                          (m) => m.modifierId === modifier.id && m.optionId === option.id,
                        )}
                        onCheckedChange={(checked) => handleModifierChange(modifier, option.id, !!checked)}
                      />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between">
                          <span>{option.name}</span>
                          {option.priceAdjustment !== 0 && (
                            <span className="text-sm text-muted-foreground">
                              {option.priceAdjustment > 0 ? "+" : ""}${option.priceAdjustment.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-input rounded-md resize-none"
              rows={3}
              placeholder="Any special requests..."
            />
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-lg">${calculateTotalPrice().toFixed(2)}</span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleAddToOrder} className="flex-1">
                Add to Order
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
