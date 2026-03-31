import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'

export interface Settlement {
  id: number
  settlement_number: string
  driver_id: number
  driver_name: string | null
  phase_label: string
  phase_start_date: string
  phase_end_date: string
  gross_revenue: number
  driver_percentage: number
  driver_gross: number
  deductions: Record<string, number | string | null>
  total_deductions: number
  grand_total: number
  status: string
  notes: string | null
  pdf_path: string | null
  created_at: string
  finalized_at: string | null
}

export function useSettlements(filters: { driver_id?: number; status?: string } = {}) {
  return useQuery({
    queryKey: ['settlements', filters],
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v != null && v !== '')
      )
      const res = await api.get('/api/settlements', { params })
      return res.data as { items: Settlement[]; total: number }
    },
  })
}

export function useCreateSettlement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      driver_id: number
      phase_label: string
      phase_start_date: string
      phase_end_date: string
      load_ids: number[]
      deductions: Record<string, number | string | null>
      notes?: string
    }) => api.post('/api/settlements', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settlements'] })
      qc.invalidateQueries({ queryKey: ['loads'] })
    },
  })
}

export function useUpdateSettlement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<Settlement>) =>
      api.patch(`/api/settlements/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settlements'] }),
  })
}

export function useDeleteSettlement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/settlements/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settlements'] }),
  })
}

export function useGenerateSettlementPdf() {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.get(`/api/settlements/${id}/generate-pdf`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `settlement_${id}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    },
  })
}
