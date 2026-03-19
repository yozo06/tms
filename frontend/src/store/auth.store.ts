import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User { id: number; name: string; email: string; role: string }
interface AuthState {
  user: User | null; token: string | null; refreshToken: string | null
  setAuth: (user: User, token: string, refreshToken: string) => void
  setUser: (user: User) => void
  logout: () => void
  isOwner: () => boolean
  isEmployee: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist((set, get) => ({
    user: null, token: null, refreshToken: null,
    setAuth: (user, token, refreshToken) => {
      localStorage.setItem('tms_token', token)
      localStorage.setItem('tms_refresh', refreshToken)
      set({ user, token, refreshToken })
    },
    setUser: (user) => set({ user }),
    logout: () => {
      localStorage.removeItem('tms_token')
      localStorage.removeItem('tms_refresh')
      set({ user: null, token: null, refreshToken: null })
    },
    isOwner: () => get().user?.role === 'owner',
    isEmployee: () => get().user?.role === 'employee',
  }), { name: 'tms_auth' })
)
