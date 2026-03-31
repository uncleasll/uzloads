import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Truck, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return
    setLoading(true)
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch {
      toast.error('Invalid credentials. Try admin / admin123')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-100 rounded-full opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-50 rounded-full opacity-60 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-md shadow-brand-200">
              <Truck size={18} className="text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 tracking-tight leading-tight">Uzloads</p>
              <p className="text-[11px] text-gray-400 leading-tight">Transportation Management System</p>
            </div>
          </div>

          <h2 className="text-[22px] font-semibold text-gray-900 mb-1">Sign in</h2>
          <p className="text-sm text-gray-500 mb-6">Enter your credentials to access the platform.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="tms-label">Username</label>
              <input
                type="text"
                className="tms-input"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="tms-label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="tms-input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-2.5 mt-2"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-[11px] text-gray-500 font-medium mb-1">Demo credentials</p>
            <p className="text-[11px] text-gray-400 font-mono">admin / admin123</p>
            <p className="text-[11px] text-gray-400 font-mono">dispatcher / dispatch123</p>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-4">
          © {new Date().getFullYear()} Uzloads Logistics LLC · All rights reserved
        </p>
      </div>
    </div>
  )
}
