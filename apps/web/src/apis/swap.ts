import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from './index'

// 타입 정의들
export interface QuoteRequest {
  tokenIn: string
  tokenOut: string
  amountIn: string
}

export interface QuoteResponse {
  amountOut: string
  feeBps: number
  validUntil: number
  quoteId: string
}

export interface SwapRequest {
  quoteId: string
  amountIn: string
  minAmountOut: string
  receiver: string
  allowPartialFill: boolean
}

export interface SwapResponse {
  amountOut: string
  txHash: string
}

// Quote API
export const swapAPI = {
  // Quote 요청
  getQuote: (params: QuoteRequest): Promise<QuoteResponse> =>
    api.get('/swap/quote', params),

  // Swap 실행
  executeSwap: (data: SwapRequest): Promise<SwapResponse> =>
    api.post('/swap/execute', data),

  // 지원되는 토큰 목록
  getSupportedTokens: (): Promise<Array<{
    address: string
    symbol: string
    name: string
    decimals: number
    logoURI?: string
  }>> =>
    api.get('/swap/tokens'),
}

// React Query Hooks
export function useGetQuote(params: QuoteRequest, enabled = true) {
  return useQuery({
    queryKey: ['quote', params],
    queryFn: () => swapAPI.getQuote(params),
    enabled: enabled && !!params.tokenIn && !!params.tokenOut && !!params.amountIn,
    staleTime: 1000, // 1초 후 stale
    gcTime: 5000, // 5초 후 garbage collect
  })
}

export function useExecuteSwap() {
  return useMutation({
    mutationFn: swapAPI.executeSwap,
  })
}

export function useSupportedTokens() {
  return useQuery({
    queryKey: ['supportedTokens'],
    queryFn: swapAPI.getSupportedTokens,
    staleTime: 1000 * 60 * 5, // 5분
  })
}
