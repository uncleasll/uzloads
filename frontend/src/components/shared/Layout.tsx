import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Truck,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/loads', icon: Truck, label: 'Loads' },
  { to: '/drivers', icon: Users, label: 'Drivers' },
  { to: '/settlements', icon: FileText, label: 'Settlements' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-56 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded-md flex items-center justify-center">
              <Truck size={14} className="text-white" />
            </div>
            <span className="font-bold text-[15px] text-gray-900 tracking-tight">Uzloads</span>
            <span className="text-[10px] font-semibold text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded ml-0.5">TMS</span>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group
                ${isActive
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-brand-500' : 'text-gray-400 group-hover:text-gray-600'} />
                  {label}
                  {isActive && <ChevronRight size={12} className="ml-auto text-brand-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold shrink-0">
              {user?.full_name?.[0] ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{user?.full_name}</p>
              <p className="text-[10px] text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 lg:hidden shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-md hover:bg-gray-100">
            <Menu size={18} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-2 ml-3">
            <div className="w-6 h-6 bg-brand-500 rounded flex items-center justify-center">
              <Truck size={12} className="text-white" />
            </div>
            <span className="font-bold text-sm">Uzloads TMS</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
