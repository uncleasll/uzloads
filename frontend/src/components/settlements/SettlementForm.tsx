import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useDrivers } from '../../hooks/useDrivers'
import { useLoads } from '../../hooks/useLoads'
import { formatCurrency, formatDate, clsx } from '../../utils/helpers'
import { CheckSquare, Square } from 'lucide-react'

interface FormData {
  driver_id: number
  phase_label: string
  phase_start_date: string
  phase_end_date: string
  fuel: number
  eld: number
  insurance: number
  ifta: number
  admin: number
  other: number
  other_label: string
  notes: string
}

interface Props {
  onSubmit: (data: any) => void
  loading?: boolean
  onCancel: () => void
}

export default function SettlementForm({ onSubmit, loading, onCancel }: Props) {
  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<FormData>({
    defaultValues: { fuel: 0, eld: 0, insurance: 0, ifta: 0, admin: 0, other: 0, other_label: '' }
  })

  const [selectedLoads, setSelectedLoads] = useState<number[]>([])

  const driverId = watch('driver_id')
  const startDate = watch('phase_start_date')
  const endDate = watch('phase_end_date')
  const fuel = Number(watch('fuel') || 0)
  const eld = Number(watch('eld') || 0)
  const insurance = Number(watch('insurance') || 0)
  const ifta = Number(watch('ifta') || 0)
  const admin = Number(watch('admin') || 0)
  const other = Number(watch('other') || 0)

  const { data: driversData } = useDrivers()
  const { data: loadsData } = useLoads({
    status: 'delivered',
    driver_id: driverId ? Number(driverId) : undefined,
    date_from: startDate || undefined,
    date_to: endDate || undefined,
    limit: 200,
  })

  const availableLoads = (loadsData?.items ?? []).filter((l) => !l.settlement_id)
  const selectedDriver = driversData?.items.find((d) => d.id === Number(driverId))
  const payRate = selectedDriver?.pay_rate ?? 0

  const grossRevenue = availableLoads
    .filter((l) => selectedLoads.includes(l.id))
    .reduce((s, l) => s + l.total_rate, 0)

  const driverGross = grossRevenue * payRate
  const totalDeductions = fuel + eld + insurance + ifta + admin + other
  const grandTotal = driverGross - totalDeductions

  const toggleLoad = (id: number) => {
    setSelectedLoads((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    setSelectedLoads((prev) =>
      prev.length === availableLoads.length ? [] : availableLoads.map((l) => l.id)
    )
  }

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      driver_id: Number(data.driver_id),
      phase_label: data.phase_label,
      phase_start_date: new Date(data.phase_start_date).toISOString(),
      phase_end_date: new Date(data.phase_end_date).toISOString(),
      load_ids: selectedLoads,
      deductions: {
        fuel: data.fuel,
        eld: data.eld,
        insurance: data.insurance,
        ifta: data.ifta,
        admin: data.admin,
        other: data.other,
        other_label: data.other_label || null,
      },
      notes: data.notes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Phase Info */}
      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Phase Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="tms-label">Driver *</label>
            <select {...register('driver_id', { required: 'Required' })} className="tms-input">
              <option value="">— Select Driver —</option>
              {(driversData?.items ?? []).map((d) => (
                <option key={d.id} value={d.id}>{d.full_name}</option>
              ))}
            </select>
            {errors.driver_id && <p className="text-red-500 text-xs mt-1">{errors.driver_id.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="tms-label">Phase Label *</label>
            <input
              {...register('phase_label', { required: 'Required' })}
              className="tms-input"
              placeholder="e.g. June 2025 — Phase 1"
            />
          </div>
          <div>
            <label className="tms-label">Start Date *</label>
            <input type="date" {...register('phase_start_date', { required: 'Required' })} className="tms-input" />
          </div>
          <div>
            <label className="tms-label">End Date *</label>
            <input type="date" {...register('phase_end_date', { required: 'Required' })} className="tms-input" />
          </div>
        </div>
      </section>

      {/* Load selection */}
      {driverId && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Delivered Loads ({availableLoads.length} available)
            </h3>
            {availableLoads.length > 0 && (
              <button type="button" onClick={toggleAll} className="text-xs text-brand-500 hover:underline">
                {selectedLoads.length === availableLoads.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {availableLoads.length === 0 ? (
            <div className="text-xs text-gray-400 text-center py-6 border border-dashed rounded-lg">
              No unlinked delivered loads found for this driver and date range.
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
              {availableLoads.map((load) => {
                const checked = selectedLoads.includes(load.id)
                return (
                  <div
                    key={load.id}
                    onClick={() => toggleLoad(load.id)}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 cursor-pointer border-b border-gray-100 last:border-0 transition-colors',
                      checked ? 'bg-brand-50' : 'hover:bg-gray-50'
                    )}
                  >
                    {checked
                      ? <CheckSquare size={15} className="text-brand-500 shrink-0" />
                      : <Square size={15} className="text-gray-300 shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-xs font-semibold text-brand-600">{load.load_number}</span>
                      <span className="text-xs text-gray-500 ml-2">{load.pickup_city} → {load.delivery_city}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-700 font-mono shrink-0">{formatCurrency(load.total_rate)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* Deductions */}
      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Deductions</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'fuel' as const, label: 'Fuel ($)' },
            { name: 'eld' as const, label: 'ELD Fee ($)' },
            { name: 'insurance' as const, label: 'Insurance ($)' },
            { name: 'ifta' as const, label: 'IFTA ($)' },
            { name: 'admin' as const, label: 'Admin Fee ($)' },
            { name: 'other' as const, label: 'Other ($)' },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="tms-label">{label}</label>
              <input type="number" step="0.01" {...register(name, { valueAsNumber: true })} className="tms-input font-mono" placeholder="0.00" />
            </div>
          ))}
          <div className="col-span-2">
            <label className="tms-label">Other Deduction Label</label>
            <input {...register('other_label')} className="tms-input" placeholder="Describe other deduction…" />
          </div>
        </div>
      </section>

      {/* Live Summary */}
      <section className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Settlement Preview</h3>
        {[
          { label: 'Gross Revenue', val: formatCurrency(grossRevenue) },
          { label: `Driver Rate (${Math.round(payRate * 100)}%)`, val: formatCurrency(driverGross) },
          { label: 'Total Deductions', val: `(${formatCurrency(totalDeductions)})`, red: true },
        ].map(({ label, val, red }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className={clsx('font-mono font-semibold', red ? 'text-red-500' : 'text-gray-800')}>{val}</span>
          </div>
        ))}
        <div className="flex justify-between pt-2 border-t border-gray-200">
          <span className="font-bold text-gray-900">Grand Total</span>
          <span className="font-bold font-mono text-brand-600 text-base">{formatCurrency(grandTotal)}</span>
        </div>
        <p className="text-[10px] text-gray-400">
          {selectedLoads.length} load{selectedLoads.length !== 1 ? 's' : ''} selected
        </p>
      </section>

      <div>
        <label className="tms-label">Notes</label>
        <textarea {...register('notes')} rows={2} className="tms-input resize-none" placeholder="Optional notes…" />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-gray-100 sticky bottom-0 bg-white pb-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1 justify-center">Cancel</button>
        <button type="submit" disabled={loading || selectedLoads.length === 0} className="btn-primary flex-1 justify-center">
          {loading ? 'Creating…' : 'Create Settlement'}
        </button>
      </div>
    </form>
  )
}
