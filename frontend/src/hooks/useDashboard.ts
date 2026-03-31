import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'

export interface DashboardStats {
  total_loads: number
  active_loads: number
  delivered_this_month: number
  revenue_this_month: number
  active_drivers: number
  expiring_compliance: number
  pending_settlements: number
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Compute from available endpoints
      const [loadsRes, driversRes, settlementsRes] = await Promise.all([
        api.get('/api/loads', { params: { limit: 500 } }),
        api.get('/api/drivers', { params: { limit: 500 } }),
        api.get('/api/settlements', { params: { limit: 500 } }),
      ])

      const loads = loadsRes.data.items
      const drivers = driversRes.data.items
      const settlements = settlementsRes.data.items

      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      const deliveredThisMonth = loads.filter((l: any) => {
        const d = new Date(l.delivery_date)
        return l.status === 'delivered' && d >= monthStart
      })

      const revenueThisMonth = deliveredThisMonth.reduce(
        (sum: number, l: any) => sum + l.total_rate, 0
      )

      // Compliance expiring in ≤ 30 days
      const thirtyDays = new Date()
      thirtyDays.setDate(thirtyDays.getDate() + 30)

      const expiringCount = drivers.filter((d: any) => {
        const fields = [d.cdl_expiration, d.medical_card_expiration]
        return fields.some((f) => {
          if (!f) return false
          const exp = new Date(f)
          return exp >= now && exp <= thirtyDays
        })
      }).length

      return {
        total_loads: loadsRes.data.total,
        active_loads: loads.filter((l: any) => ['new', 'picked_up', 'en_route'].includes(l.status)).length,
        delivered_this_month: deliveredThisMonth.length,
        revenue_this_month: revenueThisMonth,
        active_drivers: drivers.filter((d: any) => d.status === 'active').length,
        expiring_compliance: expiringCount,
        pending_settlements: settlements.filter((s: any) => s.status === 'draft').length,
      } as DashboardStats
    },
    staleTime: 1000 * 60,
  })
}
