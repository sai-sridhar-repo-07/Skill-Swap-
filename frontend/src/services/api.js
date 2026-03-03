import axios from 'axios'

// Dev: Vite proxy forwards /api → localhost:5001 (VITE_API_URL is empty or /api)
// Prod: set VITE_API_URL=https://your-backend.onrender.com in Netlify env vars
const raw = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '') // strip trailing slashes
const BASE = raw && !raw.startsWith('/') ? `${raw}/api` : '/api'

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const stored = JSON.parse(localStorage.getItem('skillswap-auth') || '{}')
  const token = stored?.state?.accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue = []
const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => error ? p.reject(error) : p.resolve(token))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }
      original._retry = true
      isRefreshing = true
      try {
        const { data } = await api.post('/auth/refresh-token')
        const { accessToken } = data.data
        const stored = JSON.parse(localStorage.getItem('skillswap-auth') || '{}')
        if (stored?.state) {
          stored.state.accessToken = accessToken
          localStorage.setItem('skillswap-auth', JSON.stringify(stored))
        }
        processQueue(null, accessToken)
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('skillswap-auth')
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
