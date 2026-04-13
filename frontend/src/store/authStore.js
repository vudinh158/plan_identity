import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../services/api.js'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,

      setToken: (token) => {
        if (token) localStorage.setItem('access_token', token)
        else localStorage.removeItem('access_token')
        set({ accessToken: token })
      },

      fetchMe: async () => {
        set({ isLoading: true })
        try {
          const { data } = await authApi.getMe()
          set({ user: data, isAuthenticated: true })
        } catch {
          set({ user: null, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try { await authApi.logout() } catch (_) {}
        localStorage.removeItem('access_token')
        set({ user: null, accessToken: null, isAuthenticated: false })
      },
    }),
    {
      name: 'plant-auth',
      partialize: (s) => ({ accessToken: s.accessToken }),
    }
  )
)
