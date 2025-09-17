import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CommonResType } from "./index";

// 스왑 관련 타입 정의
export interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  rate: string;
  priceImpact: string;
  fee: string;
  source: "hyperliquid" | "uniswap" | "1inch";
  savings?: string;
}

export interface SwapRequest {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  slippage?: number;
}

export interface SwapTransaction {
  id: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  timestamp: string;
  txHash?: string;
  status: "pending" | "completed" | "failed";
  savings?: string;
}

// 스왑 견적 조회
export function useSwapQuote(request: SwapRequest | null) {
  return useQuery({
    queryKey: ["swap-quote", request],
    queryFn: async () => {
      const response = await api.get<CommonResType<SwapQuote>>(
        `/swap/quote`,
        request as any
      );
      return response.data.data!;
    },
    enabled:
      !!request &&
      !!request.fromToken &&
      !!request.toToken &&
      !!request.fromAmount,
    staleTime: 1000 * 30, // 30초
    gcTime: 1000 * 60, // 1분
  });
}

// 여러 소스의 가격 비교
export function useSwapComparison(request: SwapRequest | null) {
  return useQuery({
    queryKey: ["swap-comparison", request],
    queryFn: async () => {
      const response = await api.get<CommonResType<SwapQuote[]>>(
        `/swap/compare`,
        request as any
      );
      return response.data.data!;
    },
    enabled:
      !!request &&
      !!request.fromToken &&
      !!request.toToken &&
      !!request.fromAmount,
    staleTime: 1000 * 30, // 30초
    gcTime: 1000 * 60, // 1분
  });
}

// 스왑 실행
export function useSwapExecute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SwapRequest) => {
      const response = await api.post<CommonResType<SwapTransaction>>(
        "/swap/execute",
        request
      );
      return response.data.data!;
    },
    onSuccess: () => {
      // 스왑 후 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["swap-history"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
    },
  });
}

// 스왑 히스토리 조회
export function useSwapHistory() {
  return useQuery({
    queryKey: ["swap-history"],
    queryFn: async () => {
      const response =
        await api.get<CommonResType<SwapTransaction[]>>("/swap/history");
      return response.data.data!;
    },
    staleTime: 1000 * 60 * 2, // 2분
    gcTime: 1000 * 60 * 5, // 5분
  });
}

// 토큰 목록 조회
export function useTokenList() {
  return useQuery({
    queryKey: ["token-list"],
    queryFn: async () => {
      const response = await api.get<
        CommonResType<
          Array<{
            symbol: string;
            name: string;
            address: string;
            decimals: number;
          }>
        >
      >("/tokens");
      return response.data.data!;
    },
    staleTime: 1000 * 60 * 10, // 10분
    gcTime: 1000 * 60 * 30, // 30분
  });
}
