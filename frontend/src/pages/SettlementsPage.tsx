import { useState } from 'react'
import { Plus, Download, Trash2, FileText, CheckCircle } from 'lucide-react'
import {
  useSettlements, useCreateSettlement, useUpdateSettlement,
  useDeleteSettlement, useGenerateSettlementPdf, Settlement
} from '../hooks/useSettlements'
import SlideOver from '../components/shared/SlideOver'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import { PageHeader, LoadingSpinner, EmptyState } from '../components/shared'
import SettlementForm from '../components/settlements/SettlementForm'
import { formatCurrency, formatDate, clsx } from '../utils/helpers'
import toast from 'react-hot-toast'

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700',
  finalized: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
}

export default function SettlementsPage() {
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Settlement | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')

  const { data, isLoading } = useSettlements({ status: filterStatus || undefined })
  const createSettlement = useCreateSettlement()
  const updateSettlement = useUpdateSettlement()
  const deleteSettlement = useDeleteSettlement()
  const generatePdf = useGenerateSettlementPdf()

  const settlements = data?.items ?? []

  const handleCreate = async (formData: any) => {
    try {
      await createSettlement.mutateAsync(formData)
      setShowForm(false)
      toast.success('Settlement created')
    } catch (e: any) {
      toast.error(e.response?.data?.detail ?? 'Failed to create settlement')
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateSettlement.mutateAsync({ id, status } as any)
      toast.success(`Settlement marked as ${status}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteSettlement.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
      toast.success('Settlement deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handlePdf = async (id: number) => {
    try {
      await generatePdf.mutateAsync(id)
      toast.success('PDF downloaded')
    } catch {
      toast.error('PDF generation failed')
    }
  }

  return (
    <div>
      <PageHeader
        title="Settlements"
        subtitle={`${data?.total ?? 0} settlement records`}
        actions={
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus size={15} /> New Settlement
          </button>
        }
      />

      {/* Status filter */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-2">
        {['', 'draft', 'finalized', 'paid'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={clsx('px-3 py-1 rounded-full text-xs font-medium transition-colors', filterStatus === s ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <LoadingSpinner />
        ) : settlements.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No settlements yet"
            description="Create a settlement to auto-calculate driver pay for a phase."
            action={
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
                <Plus size={14} /> New Settlement
              </button>
            }
          />
        ) : (
          <table className="tms-table">
            <thead>
              <tr>
                <th>Settlement #</th>
                <th>Driver</th>
                <th>Phase</th>
                <th>Date Range</th>
                <th className="text-right">Gross Revenue</th>
                <th className="text-right">Driver %</th>
                <th className="text-right">Driver Gross</th>
                <th className="text-right">Deductions</th>
                <th className="text-right">Grand Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((s) => (
                <tr key={s.id}>
                  <td className="font-mono text-xs text-brand-600 font-semibold">{s.settlement_number}</td>
                  <td className="font-medium text-[13px]">{s.driver_name}</td>
                  <td className="text-[13px]">{s.phase_label}</td>
                  <td className="text-[12px] text-gray-500">
                    {formatDate(s.phase_start_date)} — {formatDate(s.phase_end_date)}
                  </td>
                  <td className="text-right font-mono text-[13px]">{formatCurrency(s.gross_revenue)}</td>
                  <td className="text-right font-mono text-[13px] text-brand-600">
                    {Math.round(s.driver_percentage * 100)}%
                  </td>
                  <td className="text-right font-mono text-[13px] font-semibold">{formatCurrency(s.driver_gross)}</td>
                  <td className="text-right font-mono text-[13px] text-red-500">({formatCurrency(s.total_deductions)})</td>
                  <td className="text-right font-mono text-[14px] font-bold text-gray-900">{formatCurrency(s.grand_total)}</td>
                  <td>
                    <span className={clsx('badge text-[10px]', STATUS_STYLES[s.status] ?? 'bg-gray-100 text-gray-500')}>
                      {s.status}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {/* PDF export */}
                      <button
                        onClick={() => handlePdf(s.id)}
                        disabled={generatePdf.isPending}
                        className="p-1.5 rounded hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors"
                        title="Download PDF"
                      >
                        <Download size={13} />
                      </button>

                      {/* Mark as Finalized */}
                      {s.status === 'draft' && (
                        <button
                          onClick={() => handleStatusChange(s.id, 'finalized')}
                          className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Mark Finalized"
                        >
                          <CheckCircle size={13} />
                        </button>
                      )}

                      {/* Mark as Paid */}
                      {s.status === 'finalized' && (
                        <button
                          onClick={() => handleStatusChange(s.id, 'paid')}
                          className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                          title="Mark Paid"
                        >
                          <CheckCircle size={13} />
                        </button>
                      )}

                      {/* Delete */}
                      {s.status !== 'paid' && (
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Totals footer */}
            {settlements.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 font-semibold border-t-2 border-gray-300">
                  <td colSpan={4} className="px-3 py-2.5 text-xs text-gray-500 uppercase tracking-wide">
                    Totals ({settlements.length} settlements)
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-[13px]">
                    {formatCurrency(settlements.reduce((s, x) => s + x.gross_revenue, 0))}
                  </td>
                  <td></td>
                  <td className="px-3 py-2.5 text-right font-mono text-[13px]">
                    {formatCurrency(settlements.reduce((s, x) => s + x.driver_gross, 0))}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-[13px] text-red-500">
                    ({formatCurrency(settlements.reduce((s, x) => s + x.total_deductions, 0))})
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-[14px] font-bold text-brand-600">
                    {formatCurrency(settlements.reduce((s, x) => s + x.grand_total, 0))}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>

      {/* Create SlideOver */}
      <SlideOver open={showForm} onClose={() => setShowForm(false)} title="New Settlement" subtitle="Calculate driver pay for a phase" width="lg">
        <SettlementForm onSubmit={handleCreate} loading={createSettlement.isPending} onCancel={() => setShowForm(false)} />
      </SlideOver>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Settlement"
        message={`Delete settlement "${deleteTarget?.settlement_number}"? Linked loads will be unlinked.`}
        loading={deleteSettlement.isPending}
      />
    </div>
  )
}
