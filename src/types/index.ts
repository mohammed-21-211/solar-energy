// ======================================================
// أنواع البيانات (TypeScript Types) للمشروع بأكمله
// ======================================================

// --- المستخدم ---
export type UserRole = 'admin' | 'customer'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  phone?: string | null
  // الدور مشتق من عضوية المؤسسة (organization_members) وليس من جدول profiles
  role: UserRole
  created_at: string
}

// --- المنتجات ---
export type ProductCategory = 'panel' | 'battery' | 'inverter' | 'accessory'

export interface Product {
  id: string
  organization_id?: string // معرّف المؤسسة (Multi-Tenant)
  name: string
  description: string
  price: number        // بالليرة السورية
  category: ProductCategory
  image_url: string
  power_watts?: number   // للألواح: القدرة بالواط
  capacity_kwh?: number  // للبطاريات: السعة بالكيلواط/ساعة
  voltage?: number       // الجهد الكهربائي
  stock_quantity: number
  is_featured: boolean
  created_at: string
}

// --- الطلبات ---
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  id: string
  organization_id?: string
  order_id: string
  product_id: string
  product: Product
  quantity: number
  unit_price: number
}

export interface Order {
  id: string
  organization_id?: string
  user_id: string
  status: OrderStatus
  total_amount: number
  shipping_address: string
  phone: string
  notes?: string
  items: OrderItem[]
  created_at: string
  updated_at: string
}

// --- سلة التسوق (Client-Side) ---
export interface CartItem {
  product: Product
  quantity: number
}

// --- حاسبة الطاقة الشمسية ---
export interface ApplianceInput {
  id: string
  name: string
  watts: number
  hoursPerDay: number
  quantity: number
}

export interface SolarCalculationInput {
  appliances: ApplianceInput[]
  sunHoursPerDay: number   // ساعات الشمس اليومية في المنطقة
  batteryDays: number      // عدد أيام الاستقلالية المطلوبة
}

export interface SolarCalculationResult {
  totalDailyWh: number          // إجمالي الاستهلاك اليومي بالواط/ساعة
  recommendedPanelWatts: number // إجمالي قدرة الألواح المطلوبة (واط)
  panelCount: number            // عدد الألواح المقترح (بناءً على لوح 400W)
  batteryCapacityKwh: number    // سعة البطاريات المطلوبة (كيلواط/ساعة)
  inverterKva: number           // حجم الإنفرتر المناسب (كيلو فولت أمبير)
}

export interface SavedCalculation {
  id: string
  organization_id?: string
  user_id: string
  name: string
  input_data: SolarCalculationInput
  result_data: SolarCalculationResult
  created_at: string
}

// --- لوحة التحكم (Admin Statistics) ---
export interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  totalProducts: number
}

// --- تصفية المنتجات ---
export interface ProductFilter {
  category: ProductCategory | 'all'
  minPrice: number
  maxPrice: number
  searchQuery: string
  sortBy: 'price_asc' | 'price_desc' | 'newest' | 'popular'
}
