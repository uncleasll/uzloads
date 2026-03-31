import { useState } from 'react'
import { Plus, Edit2, Trash2, Search, Users, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { useDrivers, useCreateDriver, useUpdateDriver, useDeleteDriver, Driver } from '../hooks/useDrivers'
import SlideOver from '../components/shared/SlideOver'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import { PageHeader, LoadingSpinner, EmptyState } from '../components/shared'
import DriverForm from '../components/drivers/DriverForm'
import {
  formatDate, formatPhone, getComplianceStatus, complianceBadgeClass, clsx
} from '../utils/helpers'
import toast from 'react-hot-toast'

function ComplianceDot({ date }: { date: string | null | undefined }) {
  const status = getComplianceStatus(date)
  return (
    <span className={clsx('badge text-[10px]', complianceBadgeClass(status))}>
      {status === 'valid' && <CheckCircle size={9} className="mr-1" />}
      {status === 'warning' && <AlertCircle size={9} className="mr-1" />}
      {status === 'expired' && <XCircle size={9} className="mr-1" />}
      {!date ? 'Missing' : status === 'expired' ? 'Expired' : status === 'warning' ? 'Expiring' : formatDate(date)}
    </span>
  )
}

export default function DriversPage() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editDriver, setEditDriver] = useState<Driver | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Driver | null>(null)

  const { data, isLoading } = useDrivers({ search: search || undefined })
  const createDriver = useCreateDriver()
  const updateDriver = useUpdateDriver()
  const deleteDriver = useDeleteDriver()

  const drivers = data?.items ?? []

  const handleCreate = async (formData: Partial<Driver>) => {
    try {
      await createDriver.mutateAsync(formData)
      setShowForm(false)
      toast.success('Driver created')
    } catch (e: any) {
      toast.error(e.response?.data?.detail ?? 'Failed to create driver')
    }
  }

  const handleUpdate = async (formData: Partial<Driver>) => {
    if (!editDriver) return
    try {
      await updateDriver.mutateAsync({ id: editDriver.id, ...formData })
      setEditDriver(null)
      toast.success('Driver updated')
    } catch (e: any) {
      toast.error(e.response?.data?.detail ?? 'Failed to update')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteDriver.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
      toast.success('Driver removed')
    } catch {
      toast.error('Failed to delete driver')
    }
  }

  const payLabel = (driver: Driver) => {
    if (driver.pay_type === 'freight_percent') return `${Math.round(driver.pay_rate * 100)}%`
    if (driver.pay_type === 'per_mile') return `$${driver.pay_rate}/mi`
    return `$${driver.pay_rate}/load`
  }

  return (
    <div>
      <PageHeader
        title="Drivers"
        subtitle={`${data?.total ?? 0} drivers`}
        actions={
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus size={15} /> Add Driver
          </button>
        }
      />

      {/* Filter bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <div className="relative flex-1 max-w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, truck…"
            className="tms-input pl-8 py-1.5 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <LoadingSpinner />
        ) : drivers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No drivers found"
            description="Add your first driver to start managing loads and payroll."
            action={
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
                <Plus size={14} /> Add Driver
              </button>
            }
          />
        ) : (
          <table className="tms-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Equipment</th>
                <th>Pay Rate</th>
                <th>CDL</th>
                <th>Med. Card</th>
                <th>Drug Test</th>
                <th>MVR</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold shrink-0">
                        {driver.first_name[0]}{driver.last_name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-[13px]">{driver.full_name}</p>
                        <p className="text-[11px] text-gray-400">{driver.truck_number ? `Truck ${driver.truck_number}` : 'No truck'}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="text-[12px]">{formatPhone(driver.phone)}</p>
                    <p className="text-[11px] text-gray-400 truncate max-w-[160px]">{driver.email ?? '—'}</p>
                  </td>
                  <td>
                    <div className="text-xs">
                      {driver.truck_number && <span className="bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 mr-1 font-mono">T: {driver.truck_number}</span>}
                      {driver.trailer_number && <span className="bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 font-mono">TR: {driver.trailer_number}</span>}
                      {!driver.truck_number && !driver.trailer_number && <span className="text-gray-300">—</span>}
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-[13px] font-semibold text-brand-600">{payLabel(driver)}</span>
                    <p className="text-[10px] text-gray-400 capitalize">{driver.pay_type.replace('_', ' ')}</p>
                  </td>
                  <td><ComplianceDot date={driver.cdl_expiration} /></td>
                  <td><ComplianceDot date={driver.medical_card_expiration} /></td>
                  <td>
                    {driver.drug_test_result ? (
                      <span className={clsx('badge text-[10px]', {
                        'comp-valid': driver.drug_test_result === 'pass',
                        'comp-expired': driver.drug_test_result === 'fail',
                        'comp-warning': driver.drug_test_result === 'pending',
                      })}>
                        {driver.drug_test_result}
                      </span>
                    ) : <span className="badge comp-missing text-[10px]">Missing</span>}
                  </td>
                  <td>
                    {driver.mvr_status ? (
                      <span className={clsx('badge text-[10px]', {
                        'comp-valid': driver.mvr_status === 'clear',
                        'comp-expired': driver.mvr_status === 'fail',
                        'comp-warning': driver.mvr_status === 'review',
                      })}>
                        {driver.mvr_status}
                      </span>
                    ) : <span className="badge comp-missing text-[10px]">Missing</span>}
                  </td>
                  <td>
                    <span className={clsx('badge text-[10px]', {
                      'bg-green-100 text-green-700': driver.status === 'active',
                      'bg-gray-100 text-gray-500': driver.status === 'inactive',
                      'bg-yellow-100 text-yellow-700': driver.status === 'on_leave',
                    })}>
                      {driver.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditDriver(driver)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(driver)}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create */}
      <SlideOver open={showForm} onClose={() => setShowForm(false)} title="Add Driver" subtitle="Enter driver profile and compliance details" width="lg">
        <DriverForm onSubmit={handleCreate} loading={createDriver.isPending} onCancel={() => setShowForm(false)} />
      </SlideOver>

      {/* Edit */}
      <SlideOver open={!!editDriver} onClose={() => setEditDriver(null)} title="Edit Driver" subtitle={editDriver?.full_name} width="lg">
        {editDriver && (
          <DriverForm defaultValues={editDriver} onSubmit={handleUpdate} loading={updateDriver.isPending} onCancel={() => setEditDriver(null)} />
        )}
      </SlideOver>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Driver"
        message={`Remove "${deleteTarget?.full_name}" from the system? This cannot be undone.`}
        loading={deleteDriver.isPending}
      />
    </div>
  )
}
