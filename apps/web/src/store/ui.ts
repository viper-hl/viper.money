import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface UIState {
  // 전역 로딩 상태
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // 모달 상태
  isWalletModalOpen: boolean
  setIsWalletModalOpen: (open: boolean) => void

  // 테마 관련
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void

  // 사이드바 상태 (모바일)
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      // 초기값들
      isLoading: false,
      isWalletModalOpen: false,
      theme: 'dark',
      isSidebarOpen: false,

      // 액션들
      setIsLoading: (loading) => set({ isLoading: loading }),
      setIsWalletModalOpen: (open) => set({ isWalletModalOpen: open }),
      setTheme: (theme) => set({ theme }),
      setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),
    }),
    {
      name: 'ui-store',
    }
  )
)
