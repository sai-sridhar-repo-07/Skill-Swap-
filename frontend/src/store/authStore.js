import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,

        setUser: (user) => set({ user }),

        login: async (email, password) => {
          set({ isLoading: true })
          try {
            const { data } = await api.post('/auth/login', { email, password })
            const { user, accessToken } = data.data
            set({ user, accessToken, isAuthenticated: true, isLoading: false })
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
            return { success: true }
          } catch (err) {
            set({ isLoading: false })
            return { success: false, message: err.response?.data?.message || 'Login failed' }
          }
        },

        register: async (name, email, password) => {
          set({ isLoading: true })
          try {
            const { data } = await api.post('/auth/register', { name, email, password })
            const { user, accessToken } = data.data
            set({ user, accessToken, isAuthenticated: true, isLoading: false })
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
            return { success: true }
          } catch (err) {
            set({ isLoading: false })
            return { success: false, message: err.response?.data?.message || 'Registration failed' }
          }
        },

        logout: async () => {
          try { await api.post('/auth/logout') } catch {}
          delete api.defaults.headers.common['Authorization']
          set({ user: null, accessToken: null, isAuthenticated: false })
        },

        refreshUser: async () => {
          try {
            const { data } = await api.get('/auth/me')
            set({ user: data.data.user })
          } catch {}
        },

        updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
      }),
      {
        name: 'skillswap-auth',
        partialize: (s) => ({ user: s.user, accessToken: s.accessToken, isAuthenticated: s.isAuthenticated }),
      }
    )
  )
)
