"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCafeTheme } from "@/lib/theme-context"
import type { CafeTheme } from "@/lib/types"
import { useState } from "react"
import { Palette, Eye, Save, Plus, Undo } from "lucide-react"

export function ThemeEditor() {
  const {
    currentTheme,
    availableThemes,
    setTheme,
    updateTheme,
    createTheme,
    previewTheme,
    clearPreview,
    isPreviewMode,
  } = useCafeTheme()

  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingTheme, setEditingTheme] = useState<Partial<CafeTheme>>({})

  const handleColorChange = (colorKey: keyof CafeTheme["colors"], value: string) => {
    const updatedColors = { ...(editingTheme.colors || {}), [colorKey]: value }
    const updatedTheme = { ...editingTheme, colors: updatedColors as CafeTheme["colors"] }
    setEditingTheme(updatedTheme)
    previewTheme(updatedTheme)
  }

  const handleBrandingChange = (key: keyof CafeTheme["branding"], value: string) => {
    const updatedBranding = { ...(editingTheme.branding || {}), [key]: value }
    setEditingTheme({ ...editingTheme, branding: updatedBranding as CafeTheme["branding"] })
  }

  const handleSave = () => {
    if (isCreating && currentTheme) {
      const newTheme = createTheme({
        name: editingTheme.name || "New Theme",
        colors: editingTheme.colors || currentTheme.colors,
        fonts: editingTheme.fonts || currentTheme.fonts,
        branding: editingTheme.branding || currentTheme.branding,
        isActive: true,
      })
      setTheme(newTheme.id)
    } else {
      updateTheme(editingTheme)
    }

    setIsEditing(false)
    setIsCreating(false)
    setEditingTheme({})
    clearPreview()
  }

  const handleCancel = () => {
    setIsEditing(false)
    setIsCreating(false)
    setEditingTheme({})
    clearPreview()
  }

  const startEditing = () => {
    if (currentTheme) {
      setEditingTheme(currentTheme)
      setIsEditing(true)
    }
  }

  const startCreating = () => {
    setEditingTheme({
      name: "",
      colors: currentTheme?.colors,
      fonts: currentTheme?.fonts,
      branding: { businessName: "", tagline: "" },
    })
    setIsCreating(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-heading text-2xl font-bold">Theme Customization</h2>
          <p className="text-muted-foreground">Customize your cafe's branding and appearance</p>
        </div>
        <div className="flex gap-2">
          {isPreviewMode && (
            <Button variant="outline" onClick={clearPreview}>
              <Undo className="h-4 w-4 mr-2" />
              Clear Preview
            </Button>
          )}
          <Button variant="outline" onClick={startCreating}>
            <Plus className="h-4 w-4 mr-2" />
            New Theme
          </Button>
          <Button onClick={startEditing}>
            <Palette className="h-4 w-4 mr-2" />
            Edit Current
          </Button>
        </div>
      </div>

      {/* Current Theme Info */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">{currentTheme?.name}</h3>
            <p className="text-muted-foreground">{currentTheme?.branding?.tagline}</p>
          </div>
          {isPreviewMode && <Badge className="bg-orange-500 text-white">Preview Mode</Badge>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Business Name</Label>
            <p className="font-medium">{currentTheme?.branding?.businessName}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Primary Color</Label>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border" style={{ backgroundColor: currentTheme?.colors?.primary }} />
              <span className="text-sm font-mono">{currentTheme?.colors?.primary}</span>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Accent Color</Label>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border" style={{ backgroundColor: currentTheme?.colors?.accent }} />
              <span className="text-sm font-mono">{currentTheme?.colors?.accent}</span>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Heading Font</Label>
            <p className="font-medium">{currentTheme?.fonts?.heading}</p>
          </div>
        </div>
      </Card>

      {/* Available Themes */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Available Themes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableThemes.map((theme) => (
            <Card
              key={theme.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                currentTheme?.id === theme.id ? "ring-2 ring-accent" : ""
              }`}
              onClick={() => setTheme(theme.id)}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium">{theme.name}</h4>
                {currentTheme?.id === theme.id && <Badge variant="default">Active</Badge>}
              </div>

              <p className="text-sm text-muted-foreground mb-3">{theme.branding.businessName}</p>

              <div className="flex gap-1 mb-3">
                {Object.entries(theme.colors)
                  .slice(0, 4)
                  .map(([key, color]) => (
                    <div
                      key={key}
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: color }}
                      title={`${key}: ${color}`}
                    />
                  ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  previewTheme(theme)
                }}
              >
                <Eye className="h-3 w-3 mr-2" />
                Preview
              </Button>
            </Card>
          ))}
        </div>
      </Card>

      {/* Theme Editor Dialog */}
      <Dialog open={isEditing || isCreating} onOpenChange={handleCancel}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Create New Theme" : "Edit Theme"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="font-medium">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme-name">Theme Name</Label>
                  <Input
                    id="theme-name"
                    value={editingTheme.name || ""}
                    onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })}
                    placeholder="Enter theme name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    value={editingTheme.branding?.businessName || ""}
                    onChange={(e) => handleBrandingChange("businessName", e.target.value)}
                    placeholder="Enter business name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={editingTheme.branding?.tagline || ""}
                  onChange={(e) => handleBrandingChange("tagline", e.target.value)}
                  placeholder="Enter business tagline"
                />
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-4">
              <h4 className="font-medium">Colors</h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(editingTheme.colors || currentTheme?.colors || {}).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`color-${key}`} className="capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`color-${key}`}
                        type="color"
                        value={value}
                        onChange={(e) => handleColorChange(key as keyof CafeTheme["colors"], e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={value}
                        onChange={(e) => handleColorChange(key as keyof CafeTheme["colors"], e.target.value)}
                        placeholder="#000000"
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <h4 className="font-medium">Preview</h4>
              <Card
                className="p-4"
                style={{
                  backgroundColor: editingTheme.colors?.card || currentTheme?.colors?.card,
                  borderColor: editingTheme.colors?.border || currentTheme?.colors?.border,
                  color: editingTheme.colors?.foreground || currentTheme?.colors?.foreground,
                }}
              >
                <h5
                  className="font-semibold mb-2"
                  style={{
                    color: editingTheme.colors?.primary || currentTheme?.colors?.primary,
                  }}
                >
                  {editingTheme.branding?.businessName || "Business Name"}
                </h5>
                <p
                  className="text-sm mb-3"
                  style={{
                    color: editingTheme.colors?.muted || currentTheme?.colors?.muted,
                  }}
                >
                  {editingTheme.branding?.tagline || "Business tagline"}
                </p>
                <Button
                  size="sm"
                  style={{
                    backgroundColor: editingTheme.colors?.accent || currentTheme?.colors?.accent,
                    color: "white",
                  }}
                >
                  Sample Button
                </Button>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {isCreating ? "Create Theme" : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
