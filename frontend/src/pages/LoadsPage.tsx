import { useState } from 'react'
import { Plus, Search, Filter, Paperclip, Edit2, Trash2, X } from 'lucide-react'
import { useLoads, useCreateLoad, useUpdateLoad, useDeleteLoad, Load } from '../hooks/useLoads'
import { useDrivers } from '../hooks/useDrivers'
import SlideOver from '../components/shared/SlideOver'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import { PageHeader, LoadingSpinner, EmptyState } from '../components/shared'
import LoadForm from '../components/loads/LoadForm'
import AttachmentsPanel from '../components/loads/AttachmentsPanel'
import { formatCurrency, formatDate, STATUS_LABELS, STATUS_COLORS, clsx } from '../utils/helpers'
import toast from 'react-hot-toast'
import { Truck } from 'lucide-react'

const STATUSES = ['new', 'picked_up', 'en_route', 'delivered', 'cancelled', 'tonu']

export default function LoadsPage() {
  const [filters, setFilters] = useState<{
    status?: string; driver_id?: number; search?: string; date_from?: string; date_to?: string
  }>({})
  const [showForm, setShowForm] = useState(false)
  const [editLoad, setEditLoad] = useState<Load | null>(null)
  const [viewLoad, setViewLoad] = useState<Load | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Load | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useLoads(filters)
  const { data: driversData } = useDrivers()
  const createLoad = useCreateLoad()
  const updateLoad = useUpdateLoad()
  const deleteLoad = useDeleteLoad()

  const loads = data?.items ?? []

  const handleCreate = async (formData: Partial<Load>) => {
    try {
      await createLoad.mutateAsync(formData)
      setShowForm(false)
      toast.success('Load created')
    } catch (e: any) {
      toast.error(e.response?.data?.detail ?? 'Failed to create load')
    }
  }

  const handleUpdate = async (formData: Partial<Load>) => {
    if (!editLoad) return
    try {
      await updateLoad.mutateAsync({ id: editLoad.id, ...formData })
      setEditLoad(null)
      toast.success('Load updated')
    } catch (e: any) {
      toast.error(e.response?.data?.detail ?? 'Failed to update')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteLoad.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
      toast.success('Load deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div>
      <PageHeader
        title="Loads"
        subtitle={`${data?.total ?? 0} total loads`}
        actions={
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus size={15} />
            New Load
          </button>
        }
      />

      {/* Filter bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search loads, brokers…"
            className="tms-input pl-8 py-1.5 text-xs"
            value={filters.search ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
          />
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilters((f) => ({ ...f, status: undefined }))}
            className={clsx('px-3 py-1 rounded-full text-xs font-medium transition-colors', !filters.status ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
          >
            All
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilters((f) => ({ ...f, status: f.status === s ? undefined : s }))}
              className={clsx('px-3 py-1 rounded-full text-xs font-medium transition-colors', filters.status === s ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Advanced filters toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx('btn-secondary py-1.5 text-xs gap-1.5', showFilters && 'bg-brand-50 border-brand-200 text-brand-600')}
        >
          <Filter size={13} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-brand-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button onClick={() => setFilters({})} className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Advanced filter row */}
      {showFilters && (
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-end gap-4 flex-wrap">
          <div>
            <label className="tms-label text-[10px]">Driver</label>
            <select
              className="tms-input py-1.5 text-xs w-44"
              value={filters.driver_id ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, driver_id: e.target.value ? Number(e.target.value) : undefined }))}
            >
              <option value="">All Drivers</option>
              {(driversData?.items ?? []).map((d) => (
                <option key={d.id} value={d.id}>{d.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="tms-label text-[10px]">From Date</label>
            <input
              type="date"
              className="tms-input py-1.5 text-xs"
              value={filters.date_from ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value || undefined }))}
            />
          </div>
          <div>
            <label className="tms-label text-[10px]">To Date</label>
            <input
              type="date"
              className="tms-input py-1.5 text-xs"
              value={filters.date_to ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value || undefined }))}
            />
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <LoadingSpinner />
        ) : loads.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No loads found"
            description="Create your first load or adjust your filters."
            action={
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
                <Plus size={14} /> New Load
              </button>
            }
          />
        ) : (
          <table className="tms-table">
            <thead>
              <tr>
                <th>Load #</th>
                <th>Pickup</th>
                <th>Delivery</th>
                <th>Driver</th>
                <th>Broker</th>
                <th>Equip.</th>
                <th>Status</th>
                <th className="text-right">Rate</th>
                <th className="text-right">Total</th>
                <th className="text-center">Docs</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loads.map((load) => (
                <tr key={load.id} onClick={() => setViewLoad(load)}>
                  <td>
                    <span className="font-mono text-xs text-brand-600 font-semibold">{load.load_number}</span>
                  </td>
                  <td>
                    <div className="font-medium text-[13px]">{load.pickup_city}, {load.pickup_state}</div>
                    <div className="text-[11px] text-gray-400">{formatDate(load.pickup_date)}</div>
                  </td>
                  <td>
                    <div className="font-medium text-[13px]">{load.delivery_city}, {load.delivery_state}</div>
                    <div className="text-[11px] text-gray-400">{formatDate(load.delivery_date)}</div>
                  </td>
                  <td className="text-[13px]">{load.driver_name ?? <span className="text-gray-300">—</span>}</td>
                  <td className="text-[13px] text-gray-600">{load.broker_name ?? <span className="text-gray-300">—</span>}</td>
                  <td className="text-[12px] text-gray-500">{load.equipment_type ?? '—'}</td>
                  <td>
                    <span className={clsx('badge', STATUS_COLORS[load.status])}>
                      {STATUS_LABELS[load.status]}
                    </span>
                  </td>
                  <td className="text-right font-mono text-[13px]">{formatCurrency(load.rate)}</td>
                  <td className="text-right font-mono text-[13px] font-semibold">{formatCurrency(load.total_rate)}</td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <span className={clsx('w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold',
                        load.attachments.length > 0 ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400'
                      )}>
                        {load.attachments.length}
                      </span>
                    </div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditLoad(load)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(load)}
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

      {/* Create SlideOver */}
      <SlideOver open={showForm} onClose={() => setShowForm(false)} title="New Load" subtitle="Enter load details" width="lg">
        <LoadForm
          onSubmit={handleCreate}
          loading={createLoad.isPending}
          onCancel={() => setShowForm(false)}
        />
      </SlideOver>

      {/* Edit SlideOver */}
      <SlideOver open={!!editLoad} onClose={() => setEditLoad(null)} title="Edit Load" subtitle={editLoad?.load_number} width="lg">
        {editLoad && (
          <LoadForm
            defaultValues={editLoad}
            onSubmit={handleUpdate}
            loading={updateLoad.isPending}
            onCancel={() => setEditLoad(null)}
          />
        )}
      </SlideOver>

      {/* View / Attachments SlideOver */}
      <SlideOver
        open={!!viewLoad}
        onClose={() => setViewLoad(null)}
        title={`Load ${viewLoad?.load_number}`}
        subtitle={`${viewLoad?.pickup_city}, ${viewLoad?.pickup_state} → ${viewLoad?.delivery_city}, ${viewLoad?.delivery_state}`}
        width="md"
      >
        {viewLoad && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Status', <span className={clsx('badge', STATUS_COLORS[viewLoad.status])}>{STATUS_LABELS[viewLoad.status]}</span>],
                ['Driver', viewLoad.driver_name ?? '—'],
                ['Broker', viewLoad.broker_name ?? '—'],
                ['Rate', <span className="font-mono font-semibold">{formatCurrency(viewLoad.total_rate)}</span>],
                ['Pickup', `${formatDate(viewLoad.pickup_date)} · ${viewLoad.pickup_city}, ${viewLoad.pickup_state}`],
                ['Delivery', `${formatDate(viewLoad.delivery_date)} · ${viewLoad.delivery_city}, ${viewLoad.delivery_state}`],
              ].map(([k, v]) => (
                <div key={String(k)} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{k}</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{v}</p>
                </div>
              ))}
            </div>

            {/* Attachments */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Paperclip size={12} /> Documents
              </h3>
              <AttachmentsPanel loadId={viewLoad.id} attachments={viewLoad.attachments} />
            </div>
          </div>
        )}
      </SlideOver>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Load"
        message={`Delete load "${deleteTarget?.load_number}"? This action cannot be undone.`}
        loading={deleteLoad.isPending}
      />
    </div>
  )
}
