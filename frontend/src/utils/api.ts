import axios from 'axios'

// 'as any' yordamida TypeScript'ni chetlab o'tamiz
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('uzloads_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('uzloads_token')
      // Cheksiz login redirectining oldini olish
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  },
)

export default api