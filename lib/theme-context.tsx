"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { CafeTheme } from "./types"

interface ThemeContextType {
  currentTheme: CafeTheme | null
  availableThemes: CafeTheme[]
  setTheme: (themeId: string) => void
  updateTheme: (theme: Partial<CafeTheme>) => void
  createTheme: (theme: Omit<CafeTheme, "id" | "createdAt" | "updatedAt">) => CafeTheme
  previewTheme: (theme: Partial<CafeTheme>) => void
  clearPreview: () => void
  isPreviewMode: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const defaultTheme: CafeTheme = {
  id: "default",
  name: "Default Cafe Theme",
  colors: {
    primary: "#374151",
    secondary: "#6366f1",
    accent: "#6366f1",
    background: "#f8fafc",
    foreground: "#374151",
    muted: "#f8fafc",
    border: "#e5e7eb",
    card: "#ffffff",
  },
  fonts: {
    heading: "Montserrat",
    body: "Open Sans",
  },
  branding: {
    businessName: "Cafe POS",
    tagline: "Modern cafe management system",
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockThemes: CafeTheme[] = [
  defaultTheme,
  {
    id: "modern-blue",
    name: "Modern Blue",
    colors: {
      primary: "#1e40af",
      secondary: "#3b82f6",
      accent: "#60a5fa",
      background: "#f1f5f9",
      foreground: "#1e293b",
      muted: "#f1f5f9",
      border: "#cbd5e1",
      card: "#ffffff",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
    branding: {
      businessName: "Blue Bean Cafe",
      tagline: "Premium coffee experience",
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "warm-earth",
    name: "Warm Earth",
    colors: {
      primary: "#92400e",
      secondary: "#d97706",
      accent: "#f59e0b",
      background: "#fefbf3",
      foreground: "#451a03",
      muted: "#fef3c7",
      border: "#fde68a",
      card: "#fffbeb",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Source Sans Pro",
    },
    branding: {
      businessName: "Earth & Bean",
      tagline: "Organic coffee roasters",
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export function CafeThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<CafeTheme>(defaultTheme)
  const [availableThemes, setAvailableThemes] = useState<CafeTheme[]>(mockThemes)
  const [previewTheme, setPreviewTheme] = useState<Partial<CafeTheme> | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const applyThemeToDOM = (theme: CafeTheme | Partial<CafeTheme>) => {
    const root = document.documentElement

    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value)
      })
    }

    if (theme.branding?.businessName) {
      document.title = `${theme.branding.businessName} - POS System`
    }
  }

  const setTheme = (themeId: string) => {
    const theme = availableThemes.find((t) => t.id === themeId)
    if (theme) {
      setCurrentTheme(theme)
      applyThemeToDOM(theme)
      localStorage.setItem("cafe-theme-id", themeId)
    }
  }

  const updateTheme = (updates: Partial<CafeTheme>) => {
    const updatedTheme = { ...currentTheme, ...updates, updatedAt: new Date() }
    setCurrentTheme(updatedTheme)
    setAvailableThemes((themes) => themes.map((t) => (t.id === updatedTheme.id ? updatedTheme : t)))
    applyThemeToDOM(updatedTheme)
  }

  const createTheme = (themeData: Omit<CafeTheme, "id" | "createdAt" | "updatedAt">) => {
    const newTheme: CafeTheme = {
      ...themeData,
      id: `theme-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setAvailableThemes((themes) => [...themes, newTheme])
    return newTheme
  }

  const handlePreviewTheme = (theme: Partial<CafeTheme>) => {
    setPreviewTheme(theme)
    setIsPreviewMode(true)
    applyThemeToDOM({ ...currentTheme, ...theme })
  }

  const clearPreview = () => {
    setPreviewTheme(null)
    setIsPreviewMode(false)
    applyThemeToDOM(currentTheme)
  }

  useEffect(() => {
    // Load saved theme on mount
    const savedThemeId = localStorage.getItem("cafe-theme-id")
    if (savedThemeId) {
      const savedTheme = availableThemes.find((t) => t.id === savedThemeId)
      if (savedTheme) {
        setCurrentTheme(savedTheme)
        applyThemeToDOM(savedTheme)
      }
    } else {
      applyThemeToDOM(currentTheme)
    }
  }, [])

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        availableThemes,
        setTheme,
        updateTheme,
        createTheme,
        previewTheme: handlePreviewTheme,
        clearPreview,
        isPreviewMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useCafeTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useCafeTheme must be used within a CafeThemeProvider")
  }
  return context
}
