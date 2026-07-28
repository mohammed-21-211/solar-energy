import { useState, useEffect, useCallback } from 'react'
import { supabase, ORGANIZATION_ID } from '../supabase/client'
import type { Product, ProductCategory, ProductFilter } from '../types'

// ======================================================
// Hook لإدارة جلب وتصفية المنتجات من Supabase
// ======================================================

const DEFAULT_FILTER: ProductFilter = {
  category: 'all',
  minPrice: 0,
  maxPrice: 100_000_000,
  searchQuery: '',
  sortBy: 'newest',
}

export function useProducts(initialFilter?: Partial<ProductFilter>) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<ProductFilter>({ ...DEFAULT_FILTER, ...initialFilter })

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let query = supabase.from('products').select('*').eq('organization_id', ORGANIZATION_ID)

      // تطبيق فلتر الفئة
      if (filter.category !== 'all') {
        query = query.eq('category', filter.category)
      }

      // تطبيق فلتر نطاق السعر
      query = query.gte('price', filter.minPrice).lte('price', filter.maxPrice)

      // تطبيق البحث بالاسم
      if (filter.searchQuery.trim()) {
        query = query.ilike('name', `%${filter.searchQuery.trim()}%`)
      }

      // تطبيق الترتيب
      switch (filter.sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true })
          break
        case 'price_desc':
          query = query.order('price', { ascending: false })
          break
        case 'popular':
          query = query.order('is_featured', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setProducts((data as Product[]) ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل جلب المنتجات')
    } finally {
      setIsLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateFilter = (updates: Partial<ProductFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }))
  }

  const resetFilter = () => setFilter(DEFAULT_FILTER)

  return { products, isLoading, error, filter, updateFilter, resetFilter, refetch: fetchProducts }
}

// Hook مصغّر لجلب المنتجات المميزة فقط (للصفحة الرئيسية)
export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('organization_id', ORGANIZATION_ID)
      .eq('is_featured', true)
      .limit(6)
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setProducts((data as Product[]) ?? [])
        setIsLoading(false)
      })
  }, [])

  return { products, isLoading, error }
}

// Hook لجلب منتج واحد بالـ ID
export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    supabase
      .from('products')
      .select('*')
      .eq('organization_id', ORGANIZATION_ID)
      .eq('id', id)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setProduct(data as Product)
        setIsLoading(false)
      })
  }, [id])

  return { product, isLoading, error }
}

// Hook لإدارة المنتجات في لوحة الأدمن (CRUD)
export function useAdminProducts() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    setIsSubmitting(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('products') as any).insert({
      ...productData,
      organization_id: ORGANIZATION_ID,
    })
    setIsSubmitting(false)
    return { error: error?.message ?? null }
  }

  const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'created_at'>>) => {
    setIsSubmitting(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('products') as any).update(updates).eq('id', id)
    setIsSubmitting(false)
    return { error: error?.message ?? null }
  }

  const deleteProduct = async (id: string) => {
    setIsSubmitting(true)
    const { error } = await supabase.from('products').delete().eq('id', id)
    setIsSubmitting(false)
    return { error: error?.message ?? null }
  }

  const uploadProductImage = async (file: File): Promise<{ url: string | null; error: string | null }> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file)

    if (error) return { url: null, error: error.message }

    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
    return { url: data.publicUrl, error: null }
  }

  return { createProduct, updateProduct, deleteProduct, uploadProductImage, isSubmitting }
}

// دالة مساعدة لترجمة فئة المنتج إلى العربية
export function getCategoryLabel(category: ProductCategory | 'all'): string {
  const labels: Record<ProductCategory | 'all', string> = {
    all: 'جميع المنتجات',
    panel: 'ألواح شمسية',
    battery: 'بطاريات',
    inverter: 'إنفرترات',
    accessory: 'ملحقات وإكسسوارات',
  }
  return labels[category]
}
