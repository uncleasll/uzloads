import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'

export interface Load {
  id: number
  load_number: string
  driver_id: number | null
  driver_name: string | null
  broker_name: string | null
  broker_contact: string | null
  broker_phone: string | null
  broker_email: string | null
  broker_mc: string | null
  pickup_city: string
  pickup_state: string
  pickup_date: string
  pickup_time: string | null
  shipper_name: string | null
  delivery_city: string
  delivery_state: string
  delivery_date: string
  delivery_time: string | null
  consignee_name: string | null
  rate: number
  detention: number
  lumper_cost: number
  fuel_surcharge: number
  total_rate: number
  status: string
  commodity: string | null
  weight: number | null
  miles: number | null
  equipment_type: string | null
  reference_number: string | null
  po_number: string | null // 🔥 MANA SHU QATOR QO'SHILDI
  notes: string | null
  settlement_id: number | null
  attachments: Attachment[]
  created_at: string
}

export interface Attachment {
  id: number
  load_id: number
  attachment_type: string
  filename: string
  original_filename: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  created_at: string
}

// ... qolgan barcha funksiyalar (useLoads, useCreateLoad va h.k.) o'zgarishsiz qoladi
export interface LoadFilters {
  status?: string
  driver_id?: number
  date_from?: string
  date_to?: string
  search?: string
  skip?: number
  limit?: number
}

export function useLoads(filters: LoadFilters = {}) {
  return useQuery({
    queryKey: ['loads', filters],
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v != null && v !== '')
      )
      const res = await api.get('/api/loads', { params })
      return res.data as { items: Load[]; total: number }
    },
  })
}

export function useLoad(id: number) {
  return useQuery({
    queryKey: ['load', id],
    queryFn: async () => (await api.get(`/api/loads/${id}`)).data as Load,
    enabled: !!id,
  })
}

export function useCreateLoad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Load>) => api.post('/api/loads', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['loads'] }),
  })
}

export function useUpdateLoad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Load> & { id: number }) =>
      api.patch(`/api/loads/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loads'] })
      qc.invalidateQueries({ queryKey: ['load'] })
    },
  })
}

export function useDeleteLoad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/loads/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['loads'] }),
  })
}

export function useUploadAttachment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      loadId,
      file,
      attachmentType,
    }: {
      loadId: number
      file: File
      attachmentType: string
    }) => {
      const form = new FormData()
      form.append('file', file)
      form.append('attachment_type', attachmentType)
      return api.post(`/api/attachments/loads/${loadId}/attachments`, form)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loads'] })
      qc.invalidateQueries({ queryKey: ['load'] })
    },
  })
}

export function useDeleteAttachment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/attachments/attachments/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loads'] })
      qc.invalidateQueries({ queryKey: ['load'] })
    },
  })
}