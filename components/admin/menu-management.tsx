"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useMenuItems, useCreateMenuItem, useUpdateMenuItem } from "@/lib/api/queries"
import type { MenuItem } from "@/lib/types"
import { useState } from "react"
import { Plus, Edit, Star, Coffee, Sandwich, Cookie } from "lucide-react"

export function MenuManagement() {
  const { data: menuItems = [], isLoading } = useMenuItems()
  const createMenuItem = useCreateMenuItem()
  const updateMenuItem = useUpdateMenuItem()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "drinks" as MenuItem["category"],
    description: "",
    isFavorite: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const itemData = {
      name: formData.name,
      price: Number.parseFloat(formData.price),
      category: formData.category,
      description: formData.description,
      isFavorite: formData.isFavorite,
    }

    try {
      if (editingItem) {
        await updateMenuItem.mutateAsync({ id: editingItem.id, updates: itemData })
      } else {
        await createMenuItem.mutateAsync(itemData)
      }

      setIsDialogOpen(false)
      setEditingItem(null)
      setFormData({ name: "", price: "", category: "drinks", description: "", isFavorite: false })
    } catch (error) {
      console.error("Failed to save menu item:", error)
    }
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      description: item.description || "",
      isFavorite: item.isFavorite || false,
    })
    setIsDialogOpen(true)
  }

  const getCategoryIcon = (category: MenuItem["category"]) => {
    switch (category) {
      case "drinks":
        return <Coffee className="h-5 w-5" />
      case "food":
        return <Sandwich className="h-5 w-5" />
      case "pastries":
        return <Cookie className="h-5 w-5" />
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading menu items...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-2xl font-bold">Menu Management</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="text-accent">{getCategoryIcon(item.category)}</div>
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <Badge variant="outline" className="text-xs capitalize">
                    {item.category}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-3">{item.description}</p>

            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-accent">${item.price.toFixed(2)}</span>
              {item.modifiers && item.modifiers.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {item.modifiers.length} modifiers
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as MenuItem["category"] })}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="drinks">Drinks</option>
                  <option value="food">Food</option>
                  <option value="pastries">Pastries</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="favorite"
                checked={formData.isFavorite}
                onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                className="rounded border-input"
              />
              <Label htmlFor="favorite">Mark as favorite</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={createMenuItem.isPending || updateMenuItem.isPending}>
                {createMenuItem.isPending || updateMenuItem.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
