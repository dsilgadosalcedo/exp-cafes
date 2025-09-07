export interface MenuItem {
  id: string
  name: string
  price: number
  category: "drinks" | "food" | "pastries"
  description?: string
  image?: string
  modifiers?: Modifier[]
  isFavorite?: boolean
}

export interface Modifier {
  id: string
  name: string
  type: "size" | "milk" | "syrup" | "extra"
  options: ModifierOption[]
  required?: boolean
  maxSelections?: number
}

export interface ModifierOption {
  id: string
  name: string
  priceAdjustment: number
}

export interface OrderItem {
  id: string
  menuItemId: string
  name: string
  basePrice: number
  quantity: number
  modifiers: SelectedModifier[]
  totalPrice: number
  notes?: string
}

export interface SelectedModifier {
  modifierId: string
  modifierName: string
  optionId: string
  optionName: string
  priceAdjustment: number
}

export interface Order {
  id: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  status: "draft" | "pending" | "preparing" | "ready" | "completed"
  createdAt: Date
  customerId?: string
  tableNumber?: string
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  loyaltyPoints?: number
}

export interface InventoryItem {
  id: string
  menuItemId: string
  name: string
  currentStock: number
  minStock: number
  maxStock: number
  unit: "pieces" | "kg" | "liters" | "grams" | "ml"
  costPerUnit: number
  supplier?: string
  lastRestocked?: Date
  category: "drinks" | "food" | "pastries" | "ingredients"
}

export interface StockAdjustment {
  id: string
  inventoryItemId: string
  type: "restock" | "waste" | "sale" | "adjustment"
  quantity: number
  reason?: string
  createdAt: Date
  createdBy: string
}

export interface LowStockAlert {
  id: string
  inventoryItemId: string
  itemName: string
  currentStock: number
  minStock: number
  severity: "low" | "critical" | "out"
  createdAt: Date
}

export interface SalesReport {
  date: string
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  topSellingItems: {
    itemId: string
    itemName: string
    quantitySold: number
    revenue: number
  }[]
}

export interface StaffMember {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "barista" | "kitchen"
  hourlyRate: number
  isActive: boolean
  createdAt: Date
}

export interface Shift {
  id: string
  staffId: string
  staffName: string
  clockIn: Date
  clockOut?: Date
  totalHours?: number
  totalPay?: number
  status: "active" | "completed"
}

export interface BusinessMetrics {
  todaySales: number
  todayOrders: number
  averageOrderValue: number
  topSellingItem: string
  lowStockItems: number
  activeStaff: number
  salesGrowth: number
  orderGrowth: number
}

export interface CafeTheme {
  id: string
  name: string
  locationId?: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    border: string
    card: string
  }
  fonts: {
    heading: string
    body: string
  }
  branding: {
    logoUrl?: string
    businessName: string
    tagline?: string
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Location {
  id: string
  name: string
  address: string
  phone?: string
  email?: string
  themeId?: string
  isActive: boolean
}
