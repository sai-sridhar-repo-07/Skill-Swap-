import { create } from 'zustand'

const savedTheme = localStorage.getItem('skillswap-theme') || 'dark'

export const useUIStore = create((set) => ({
  sidebarOpen: false,
  theme: savedTheme,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),

  toggleTheme: () => set((s) => {
    const next = s.theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('skillswap-theme', next)
    return { theme: next }
  }),
}))
