import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'

export interface Driver {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string | null
  phone: string | null
  status: string
  truck_number: string | null
  trailer_number: string | null
  pay_type: string
  pay_rate: number
  cdl_number: string | null
  cdl_expiration: string | null
  medical_card_expiration: string | null
  drug_test_date: string | null
  drug_test_result: string | null
  mvr_date: string | null
  mvr_status: string | null
  notes: string | null
  created_at: string
}

export function useDrivers(filters: { status?: string; search?: string } = {}) {
  return useQuery({
    queryKey: ['drivers', filters],
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v != null && v !== '')
      )
      const res = await api.get('/api/drivers', { params })
      return res.data as { items: Driver[]; total: number }
    },
  })
}

export function useDriver(id: number) {
  return useQuery({
    queryKey: ['driver', id],
    queryFn: async () => (await api.get(`/api/drivers/${id}`)).data as Driver,
    enabled: !!id,
  })
}

export function useCreateDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Driver>) => api.post('/api/drivers', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drivers'] }),
  })
}

export function useUpdateDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Driver> & { id: number }) =>
      api.patch(`/api/drivers/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['drivers'] })
      qc.invalidateQueries({ queryKey: ['driver'] })
    },
  })
}

export function useDeleteDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/drivers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drivers'] }),
  })
}
