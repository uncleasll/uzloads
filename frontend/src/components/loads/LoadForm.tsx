import { useForm } from 'react-hook-form'
import { useDrivers } from '../../hooks/useDrivers'
import { Load } from '../../hooks/useLoads'

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'en_route', label: 'En Route' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'tonu', label: 'TONU' },
]

const EQUIPMENT = ['Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'RGN', 'Tanker', 'Box Truck', 'Other']

interface Props {
  defaultValues?: Partial<Load>
  onSubmit: (data: Partial<Load>) => void
  loading?: boolean
  onCancel: () => void
}

export default function LoadForm({ defaultValues, onSubmit, loading, onCancel }: Props) {
  const { data: driversData } = useDrivers()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Partial<Load>>({ defaultValues })

  const rate = watch('rate') || 0
  const detention = watch('detention') || 0
  const fuel = watch('fuel_surcharge') || 0
  const total = Number(rate) + Number(detention) + Number(fuel)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Load Info</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="tms-label">Load Number *</label>
            <input
              {...register('load_number', { required: 'Required' })}
              className="tms-input"
              placeholder="e.g. UZ-10042"
            />
            {errors.load_number && <p className="text-red-500 text-xs mt-1">{errors.load_number.message}</p>}
          </div>
          <div>
            <label className="tms-label">Status</label>
            <select {...register('status')} className="tms-input">
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="tms-label">Driver</label>
            <select {...register('driver_id', { valueAsNumber: true })} className="tms-input">
              <option value="">— Unassigned —</option>
              {(driversData?.items ?? []).map((d) => (
                <option key={d.id} value={d.id}>{d.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="tms-label">Equipment Type</label>
            <select {...register('equipment_type')} className="tms-input">
              <option value="">—</option>
              {EQUIPMENT.map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Broker */}
      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Broker</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="tms-label">Broker Name</label>
            <input {...register('broker_name')} className="tms-input" placeholder="Broker company name" />
          </div>
          <div>
            <label className="tms-label">Broker Phone</label>
            <input {...register('broker_phone')} className="tms-input" placeholder="(555) 000-0000" />
          </div>
          <div>
            <label className="tms-label">Broker MC #</label>
            <input {...register('broker_mc')} className="tms-input" placeholder="MC-000000" />
          </div>
        </div>
      </section>

      {/* Pickup */}
      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Pickup</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="tms-label">City *</label>
            <input {...register('pickup_city', { required: 'Required' })} className="tms-input" placeholder="Chicago" />
            {errors.pickup_city && <p className="text-red-500 text-xs mt-1">{errors.pickup_city.message}</p>}
          </div>
          <div>
            <label className="tms-label">State *</label>
            <input {...register('pickup_state', { required: 'Required' })} className="tms-input" placeholder="IL" maxLength={2} />
          </div>
          <div>
            <label className="tms-label">Date *</label>
            <input type="date" {...register('pickup_date', { required: 'Required' })} className="tms-input" />
            {errors.pickup_date && <p className="text-red-500 text-xs mt-1">{errors.pickup_date.message}</p>}
          </div>
          <div>
            <label className="tms-label">Time</label>
            <input {...register('pickup_time')} className="tms-input" placeholder="08:00" />
          </div>
          <div className="col-span-2">
            <label className="tms-label">Shipper Name</label>
            <input {...register('shipper_name')} className="tms-input" placeholder="Shipper company" />
          </div>
        </div>
      </section>

      {/* Delivery */}
      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Delivery</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="tms-label">City *</label>
            <input {...register('delivery_city', { required: 'Required' })} className="tms-input" placeholder="Dallas" />
            {errors.delivery_city && <p className="text-red-500 text-xs mt-1">{errors.delivery_city.message}</p>}
          </div>
          <div>
            <label className="tms-label">State *</label>
            <input {...register('delivery_state', { required: 'Required' })} className="tms-input" placeholder="TX" maxLength={2} />
          </div>
          <div>
            <label className="tms-label">Date *</label>
            <input type="date" {...register('delivery_date', { required: 'Required' })} className="tms-input" />
            {errors.delivery_date && <p className="text-red-500 text-xs mt-1">{errors.delivery_date.message}</p>}
          </div>
          <div>
            <label className="tms-label">Time</label>
            <input {...register('delivery_time')} className="tms-input" placeholder="17:00" />
          </div>
          <div className="col-span-2">
            <label className="tms-label">Consignee Name</label>
            <input {...register('consignee_name')} className="tms-input" placeholder="Consignee company" />
          </div>
        </div>
      </section>

      {/* Financials */}
      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Financials</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="tms-label">Rate ($) *</label>
            <input
              type="number"
              step="0.01"
              {...register('rate', { required: 'Required', valueAsNumber: true })}
              className="tms-input font-mono"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="tms-label">Fuel Surcharge ($)</label>
            <input type="number" step="0.01" {...register('fuel_surcharge', { valueAsNumber: true })} className="tms-input font-mono" placeholder="0.00" />
          </div>
          <div>
            <label className="tms-label">Detention ($)</label>
            <input type="number" step="0.01" {...register('detention', { valueAsNumber: true })} className="tms-input font-mono" placeholder="0.00" />
          </div>
          <div>
            <label className="tms-label">Lumper Cost ($)</label>
            <input type="number" step="0.01" {...register('lumper_cost', { valueAsNumber: true })} className="tms-input font-mono" placeholder="0.00" />
          </div>
          <div>
            <label className="tms-label">Miles</label>
            <input type="number" {...register('miles', { valueAsNumber: true })} className="tms-input font-mono" placeholder="0" />
          </div>
        </div>

        {/* Live total */}
        <div className="mt-3 p-3 bg-brand-50 rounded-lg border border-brand-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-brand-700">Total Rate</span>
          <span className="text-base font-bold text-brand-600 font-mono">
            ${Number(total).toFixed(2)}
          </span>
        </div>
      </section>

      {/* Load details */}
      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="tms-label">Commodity</label>
            <input {...register('commodity')} className="tms-input" placeholder="General freight" />
          </div>
          <div>
            <label className="tms-label">Weight (lbs)</label>
            <input type="number" {...register('weight', { valueAsNumber: true })} className="tms-input font-mono" />
          </div>
          <div>
            <label className="tms-label">Reference #</label>
            <input {...register('reference_number')} className="tms-input" />
          </div>
          <div>
            <label className="tms-label">PO Number</label>
            <input {...register('po_number')} className="tms-input" />
          </div>
          <div className="col-span-2">
            <label className="tms-label">Notes</label>
            <textarea {...register('notes')} rows={2} className="tms-input resize-none" placeholder="Internal notes…" />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-gray-100 sticky bottom-0 bg-white pb-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1 justify-center">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
          {loading ? 'Saving…' : defaultValues?.id ? 'Update Load' : 'Create Load'}
        </button>
      </div>
    </form>
  )
}
