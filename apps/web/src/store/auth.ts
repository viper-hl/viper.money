import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface AuthState {
  // 사용자 정보
  user: {
    address: string
    isConnected: boolean
    chainId: number | null
  } | null

  // 인증 상태
  isAuthenticated: boolean
  isConnecting: boolean

  // 액션들
  setUser: (user: AuthState['user']) => void
  setIsAuthenticated: (auth: boolean) => void
  setIsConnecting: (connecting: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        // 초기값들
        user: null,
        isAuthenticated: false,
        isConnecting: false,

        // 액션들
        setUser: (user) => set({ user }),
        setIsAuthenticated: (auth) => set({ isAuthenticated: auth }),
        setIsConnecting: (connecting) => set({ isConnecting: connecting }),
        logout: () => {
          set({
            user: null,
            isAuthenticated: false,
            isConnecting: false,
          })
        },
      }),
      {
        name: 'auth-store',
        // user 정보만 persist (보안상 중요한 정보는 제외)
        partialize: (state) => ({ user: state.user }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
)
