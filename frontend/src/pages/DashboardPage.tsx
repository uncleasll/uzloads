import { useLoads } from '../hooks/useLoads'
import { useSettlements } from '../hooks/useSettlements'
import { useDashboardStats } from '../hooks/useDashboard'
import { PageHeader, LoadingSpinner } from '../components/shared'
import { formatCurrency, formatDate, STATUS_LABELS, STATUS_COLORS, clsx } from '../utils/helpers'
import {
  Truck, Users, FileText, TrendingUp,
  AlertTriangle, CheckCircle2, Clock, DollarSign
} from 'lucide-react'

function KpiCard({
  label, value, sub, icon: Icon, accent, warn,
}: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; accent?: boolean; warn?: boolean
}) {
  return (
    <div className={clsx(
      'card p-5 flex items-start gap-4',
      accent && 'border-brand-200 bg-brand-50',
      warn && 'border-amber-200 bg-amber-50',
    )}>
      <div className={clsx(
        'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
        accent ? 'bg-brand-100' : warn ? 'bg-amber-100' : 'bg-gray-100'
      )}>
        <Icon size={17} className={clsx(
          accent ? 'text-brand-600' : warn ? 'text-amber-600' : 'text-gray-500'
        )} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className={clsx(
          'text-2xl font-bold tracking-tight mt-0.5',
          accent ? 'text-brand-600' : warn ? 'text-amber-700' : 'text-gray-900'
        )}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: stats } = useDashboardStats()
  const { data: loadsData, isLoading: loadsLoading } = useLoads({ limit: 8 })
  const { data: settlementsData } = useSettlements({} as any)

  const loads = loadsData?.items ?? []

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })}
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label="Total Loads" value={stats?.total_loads ?? '—'} sub="all time" icon={Truck} accent />
          <KpiCard label="Active Loads" value={stats?.active_loads ?? '—'} sub="in transit or new" icon={Clock} />
          <KpiCard label="Revenue This Month" value={stats ? formatCurrency(stats.revenue_this_month) : '—'} sub={`${stats?.delivered_this_month ?? 0} delivered`} icon={DollarSign} />
          <KpiCard label="Expiring Compliance" value={stats?.expiring_compliance ?? '—'} sub="docs expiring ≤30 days" icon={AlertTriangle} warn={!!stats?.expiring_compliance} />
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label="Active Drivers" value={stats?.active_drivers ?? '—'} sub="current roster" icon={Users} />
          <KpiCard label="Draft Settlements" value={stats?.pending_settlements ?? '—'} sub="awaiting finalization" icon={FileText} />
          <KpiCard label="Delivered This Month" value={stats?.delivered_this_month ?? '—'} sub="completed loads" icon={CheckCircle2} />
          <KpiCard label="Load Pipeline" value={stats?.total_loads ?? '—'} sub="total in system" icon={TrendingUp} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck size={15} className="text-brand-500" />
                <span className="text-sm font-semibold text-gray-800">Recent Loads</span>
              </div>
              <a href="/loads" className="text-xs text-brand-500 hover:underline font-medium">View all →</a>
            </div>
            {loadsLoading ? <LoadingSpinner /> : (
              <div className="overflow-x-auto">
                <table className="tms-table">
                  <thead>
                    <tr>
                      <th>Load #</th><th>Route</th><th>Driver</th><th>Status</th><th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loads.length === 0 ? (
                      <tr><td colSpan={5} className="py-10 text-center text-gray-400 text-sm">No loads yet.</td></tr>
                    ) : loads.map((load) => (
                      <tr key={load.id}>
                        <td><span className="font-mono text-xs text-brand-600 font-semibold">{load.load_number}</span></td>
                        <td>
                          <div className="text-[12px] font-medium">{load.pickup_city}, {load.pickup_state} <span className="text-gray-400">→</span> {load.delivery_city}, {load.delivery_state}</div>
                          <div className="text-[11px] text-gray-400">{formatDate(load.pickup_date)}</div>
                        </td>
                        <td className="text-[13px]">{load.driver_name ?? <span className="text-gray-300">Unassigned</span>}</td>
                        <td><span className={clsx('badge', STATUS_COLORS[load.status])}>{STATUS_LABELS[load.status]}</span></td>
                        <td className="text-right font-mono text-[13px] font-semibold">{formatCurrency(load.total_rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-brand-500" />
                <span className="text-sm font-semibold text-gray-800">Settlements</span>
              </div>
              <a href="/settlements" className="text-xs text-brand-500 hover:underline font-medium">View all →</a>
            </div>
            <div className="divide-y divide-gray-50">
              {(settlementsData?.items ?? []).length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm px-4">No settlements yet</div>
              ) : (settlementsData?.items ?? []).slice(0,6).map((s) => (
                <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800 truncate">{s.driver_name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{s.phase_label}</p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className="text-sm font-bold text-gray-900 font-mono">{formatCurrency(s.grand_total)}</p>
                    <span className={clsx('badge text-[10px]', {
                      'bg-yellow-100 text-yellow-700': s.status === 'draft',
                      'bg-blue-100 text-blue-700': s.status === 'finalized',
                      'bg-green-100 text-green-700': s.status === 'paid',
                    })}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={15} className="text-brand-500" />
            <span className="text-sm font-semibold text-gray-800">Load Status Distribution</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {['new', 'picked_up', 'en_route', 'delivered', 'cancelled', 'tonu'].map((status) => {
              const count = loads.filter((l) => l.status === status).length
              const pct = loads.length ? Math.round((count / loads.length) * 100) : 0
              return (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className={clsx('badge text-[10px] mt-1 justify-center', STATUS_COLORS[status])}>{STATUS_LABELS[status]}</div>
                  <div className="mt-2 h-1 bg-gray-100 rounded-full"><div className="h-full bg-brand-400 rounded-full" style={{ width: `${pct}%` }} /></div>
                  <p className="text-[10px] text-gray-400 mt-1">{pct}%</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
