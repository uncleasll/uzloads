import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

interface AuthState {
  token: string | null
  user: { username: string; full_name: string; role: string } | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: async (username, password) => {
        const params = new URLSearchParams()
        params.append('username', username)
        params.append('password', password)
        const res = await api.post('/api/auth/token', params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        const { access_token, username: uname, full_name, role } = res.data
        localStorage.setItem('uzloads_token', access_token)
        set({ token: access_token, user: { username: uname, full_name, role } })
      },
      logout: () => {
        localStorage.removeItem('uzloads_token')
        set({ token: null, user: null })
      },
    }),
    { name: 'uzloads-auth', partialize: (s) => ({ token: s.token, user: s.user }) },
  ),
)
