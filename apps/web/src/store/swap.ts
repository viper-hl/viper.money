import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface SwapState {
  // 스왑 입력 상태
  tokenIn: string | null
  tokenOut: string | null
  amountIn: string
  amountOut: string

  // 슬리피지 설정
  slippageTolerance: number // bps 단위

  // Quote 정보
  currentQuote: {
    amountOut: string
    feeBps: number
    validUntil: number
    quoteId: string
  } | null

  // 액션들
  setTokenIn: (token: string | null) => void
  setTokenOut: (token: string | null) => void
  setAmountIn: (amount: string) => void
  setAmountOut: (amount: string) => void
  setSlippageTolerance: (slippage: number) => void
  setCurrentQuote: (quote: SwapState['currentQuote']) => void
  
  // 유틸리티 액션들
  swapTokens: () => void // tokenIn과 tokenOut 교체
  resetSwap: () => void // 모든 상태 초기화
}

export const useSwapStore = create<SwapState>()(
  devtools(
    (set, get) => ({
      // 초기값들
      tokenIn: null,
      tokenOut: null,
      amountIn: '',
      amountOut: '',
      slippageTolerance: 50, // 0.5%
      currentQuote: null,

      // 액션들
      setTokenIn: (token) => set({ tokenIn: token }),
      setTokenOut: (token) => set({ tokenOut: token }),
      setAmountIn: (amount) => set({ amountIn: amount }),
      setAmountOut: (amount) => set({ amountOut: amount }),
      setSlippageTolerance: (slippage) => set({ slippageTolerance: slippage }),
      setCurrentQuote: (quote) => set({ currentQuote: quote }),

      // 유틸리티 액션들
      swapTokens: () => {
        const { tokenIn, tokenOut } = get()
        set({
          tokenIn: tokenOut,
          tokenOut: tokenIn,
          amountIn: '',
          amountOut: '',
          currentQuote: null,
        })
      },

      resetSwap: () => {
        set({
          tokenIn: null,
          tokenOut: null,
          amountIn: '',
          amountOut: '',
          currentQuote: null,
        })
      },
    }),
    {
      name: 'swap-store',
    }
  )
)
