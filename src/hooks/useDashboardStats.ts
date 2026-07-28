import { useState, useEffect } from 'react'
import { supabase, ORGANIZATION_ID } from '../supabase/client'
import type { DashboardStats } from '../types'

// ======================================================
// Hook لجلب إحصائيات لوحة تحكم الأدمن
// ======================================================

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // جلب جميع الإحصائيات في نفس الوقت لتحسين الأداء
        const [ordersRes, productsRes] = await Promise.all([
          supabase.from('orders').select('status, total_amount').eq('organization_id', ORGANIZATION_ID) as unknown as Promise<{ data: Array<{ status: string; total_amount: number }> | null; error: { message: string } | null }>,
          supabase.from('products').select('id', { count: 'exact' }).eq('organization_id', ORGANIZATION_ID),
        ])

        if (ordersRes.error) throw ordersRes.error
        if (productsRes.error) throw productsRes.error

        const orders = (ordersRes.data ?? []) as Array<{ status: string; total_amount: number }>
        const pendingOrders = orders.filter(o => o.status === 'pending').length
        const totalRevenue = orders
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, o) => sum + (o.total_amount ?? 0), 0)

        setStats({
          totalOrders: orders.length,
          pendingOrders,
          totalRevenue,
          totalProducts: productsRes.count ?? 0,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل جلب الإحصائيات')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, isLoading, error }
}
