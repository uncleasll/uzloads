import { differenceInDays, format, parseISO } from 'date-fns'
import clsx from 'clsx'

export { clsx }

export function formatCurrency(val: number | null | undefined): string {
  if (val == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(val)
}

export function formatDate(val: string | Date | null | undefined): string {
  if (!val) return '—'
  try {
    const d = typeof val === 'string' ? parseISO(val) : val
    return format(d, 'MM/dd/yyyy')
  } catch {
    return '—'
  }
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

export type ComplianceStatus = 'valid' | 'warning' | 'expired' | 'missing'

export function getComplianceStatus(expirationDate: string | null | undefined): ComplianceStatus {
  if (!expirationDate) return 'missing'
  try {
    const exp = parseISO(expirationDate)
    const daysUntil = differenceInDays(exp, new Date())
    if (daysUntil < 0) return 'expired'
    if (daysUntil <= 30) return 'warning'
    return 'valid'
  } catch {
    return 'missing'
  }
}

export function complianceBadgeClass(status: ComplianceStatus): string {
  return clsx('badge', {
    'comp-valid': status === 'valid',
    'comp-warning': status === 'warning',
    'comp-expired': status === 'expired',
    'comp-missing': status === 'missing',
  })
}

export const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  picked_up: 'Picked Up',
  en_route: 'En Route',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  tonu: 'TONU',
}

export const STATUS_COLORS: Record<string, string> = {
  new: 'badge-new',
  picked_up: 'badge-picked_up',
  en_route: 'badge-en_route',
  delivered: 'badge-delivered',
  cancelled: 'badge-cancelled',
  tonu: 'badge-tonu',
}
