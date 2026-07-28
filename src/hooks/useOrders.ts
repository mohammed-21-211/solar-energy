import { useState, useEffect } from 'react'
import { supabase, ORGANIZATION_ID } from '../supabase/client'
import type { Order, OrderStatus } from '../types'
import { useAuth } from '../context/AuthContext'

// ======================================================
// Hook لإدارة الطلبات (للعميل وللأدمن)
// ======================================================

// جلب طلبات العميل الحالي
export function useMyOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(*)
        )
      `)
      .eq('organization_id', ORGANIZATION_ID)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setOrders((data as unknown as Order[]) ?? [])
        setIsLoading(false)
      })
  }, [user])

  return { orders, isLoading, error }
}

// جلب جميع الطلبات (للأدمن فقط)
export function useAllOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    setIsLoading(true)
    const { data, error: err } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(*)
        ),
        user:profiles!orders_user_id_fkey(full_name, email, phone)
      `)
      .eq('organization_id', ORGANIZATION_ID)
      .order('created_at', { ascending: false })

    if (err) setError(err.message)
    else setOrders((data as unknown as Order[]) ?? [])
    setIsLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  return { orders, isLoading, error, refetch: fetchOrders }
}

// Hook لإنشاء طلب جديد
export function useCreateOrder() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createOrder = async (params: {
    items: Array<{ productId: string; quantity: number; unitPrice: number }>
    totalAmount: number
    shippingAddress: string
    phone: string
    notes?: string
  }) => {
    if (!user) return { error: 'يجب تسجيل الدخول أولاً' }
    setIsSubmitting(true)

    try {
      // إنشاء الطلب الرئيسي
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          organization_id: ORGANIZATION_ID,
          user_id: user.id,
          total_amount: params.totalAmount,
          shipping_address: params.shippingAddress,
          phone: params.phone,
          notes: params.notes ?? null,
          status: 'pending' as const,
        })
        .select()
        .single()

      if (orderError || !order) throw new Error(orderError?.message ?? 'فشل إنشاء الطلب')
      const orderId = (order as { id: string }).id

      // إنشاء عناصر الطلب
      const orderItems = params.items.map(item => ({
        organization_id: ORGANIZATION_ID,
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: itemsError } = await (supabase.from('order_items') as any).insert(orderItems)
      if (itemsError) throw new Error((itemsError as Error).message)

      return { error: null, orderId }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'فشل إنشاء الطلب', orderId: null }
    } finally {
      setIsSubmitting(false)
    }
  }

  return { createOrder, isSubmitting }
}

// Hook لتحديث حالة الطلب (للأدمن)
export function useUpdateOrderStatus() {
  const [isUpdating, setIsUpdating] = useState(false)

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setIsUpdating(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('orders') as any)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
    setIsUpdating(false)
    return { error: error?.message ?? null }
  }

  return { updateStatus, isUpdating }
}

// ترجمة حالة الطلب إلى العربية مع لون مناسب
export function getOrderStatusInfo(status: OrderStatus) {
  const statusMap: Record<OrderStatus, { label: string; color: string; bg: string }> = {
    pending:   { label: 'قيد المراجعة',   color: 'text-sun-700',   bg: 'bg-sun-100' },
    confirmed: { label: 'مؤكد',           color: 'text-sky2-700',  bg: 'bg-sky2-100' },
    shipped:   { label: 'تم الشحن',       color: 'text-leaf-700',  bg: 'bg-leaf-100' },
    delivered: { label: 'تم التسليم',     color: 'text-leaf-800',  bg: 'bg-leaf-200' },
    cancelled: { label: 'ملغي',           color: 'text-red-700',   bg: 'bg-red-100' },
  }
  return statusMap[status]
}
