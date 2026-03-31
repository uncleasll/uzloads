import { useForm } from 'react-hook-form'
import { Driver } from '../../hooks/useDrivers'

const PAY_TYPES = [
  { value: 'freight_percent', label: 'Freight Percentage' },
  { value: 'flat_rate', label: 'Flat Rate (per load)' },
  { value: 'per_mile', label: 'Per Mile' },
]

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on_leave', label: 'On Leave' },
]

interface Props {
  defaultValues?: Partial<Driver>
  onSubmit: (data: Partial<Driver>) => void
  loading?: boolean
  onCancel: () => void
}

export default function DriverForm({ defaultValues, onSubmit, loading, onCancel }: Props) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Partial<Driver>>({ defaultValues })
  const payType = watch('pay_type') ?? defaultValues?.pay_type ?? 'freight_percent'

  const payRateLabel = payType === 'freight_percent' ? 'Rate (decimal, e.g. 0.32 = 32%)'
    : payType === 'per_mile' ? 'Rate per Mile ($)'
    : 'Flat Rate per Load ($)'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Personal Info</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="tms-label">First Name *</label>
            <input {...register('first_name', { required: 'Required' })} className="tms-input" placeholder="John" />
            {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className="tms-label">Last Name *</label>
            <input {...register('last_name', { required: 'Required' })} className="tms-input" placeholder="Smith" />
            {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
          </div>
          <div>
            <label className="tms-label">Phone</label>
            <input {...register('phone')} className="tms-input" placeholder="(555) 000-0000" />
          </div>
          <div>
            <label className="tms-label">Email</label>
            <input type="email" {...register('email')} className="tms-input" placeholder="john@example.com" />
          </div>
          <div>
            <label className="tms-label">Status</label>
            <select {...register('status')} className="tms-input">
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Equipment */}
      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Equipment</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="tms-label">Truck #</label>
            <input {...register('truck_number')} className="tms-input font-mono" placeholder="T-101" />
          </div>
          <div>
            <label className="tms-label">Trailer #</label>
            <input {...register('trailer_number')} className="tms-input font-mono" placeholder="TR-205" />
          </div>
        </div>
      </section>

      {/* Pay Config */}
      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Pay Configuration</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="tms-label">Pay Type</label>
            <select {...register('pay_type')} className="tms-input">
              {PAY_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="tms-label">{payRateLabel}</label>
            <input
              type="number"
              step="0.01"
              {...register('pay_rate', { required: 'Required', valueAsNumber: true })}
              className="tms-input font-mono"
              placeholder={payType === 'freight_percent' ? '0.32' : '0.00'}
            />
          </div>
        </div>
        {payType === 'freight_percent' && (
          <p className="text-xs text-gray-400 mt-2">
            Example: 0.32 = 32% (company driver), 0.90 = 90% (owner-operator)
          </p>
        )}
      </section>

      {/* Compliance */}
      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Compliance Documents</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="tms-label">CDL Number</label>
            <input {...register('cdl_number')} className="tms-input font-mono" placeholder="D1234567" />
          </div>
          <div>
            <label className="tms-label">CDL Expiration</label>
            <input type="date" {...register('cdl_expiration')} className="tms-input" />
          </div>
          <div>
            <label className="tms-label">Medical Card Expiration</label>
            <input type="date" {...register('medical_card_expiration')} className="tms-input" />
          </div>
          <div>
            <label className="tms-label">Drug Test Date</label>
            <input type="date" {...register('drug_test_date')} className="tms-input" />
          </div>
          <div>
            <label className="tms-label">Drug Test Result</label>
            <select {...register('drug_test_result')} className="tms-input">
              <option value="">—</option>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="tms-label">MVR Date</label>
            <input type="date" {...register('mvr_date')} className="tms-input" />
          </div>
          <div>
            <label className="tms-label">MVR Status</label>
            <select {...register('mvr_status')} className="tms-input">
              <option value="">—</option>
              <option value="clear">Clear</option>
              <option value="review">Review</option>
              <option value="fail">Fail</option>
            </select>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section>
        <label className="tms-label">Notes</label>
        <textarea {...register('notes')} rows={2} className="tms-input resize-none" placeholder="Internal notes…" />
      </section>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-gray-100 sticky bottom-0 bg-white pb-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1 justify-center">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
          {loading ? 'Saving…' : defaultValues?.id ? 'Update Driver' : 'Create Driver'}
        </button>
      </div>
    </form>
  )
}
