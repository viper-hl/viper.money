import { create } from "zustand";

interface SwapState {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  slippage: number;
  isSwapping: boolean;
  lastSwapHash?: string;
}

interface SwapActions {
  setFromToken: (token: string) => void;
  setToToken: (token: string) => void;
  setFromAmount: (amount: string) => void;
  setToAmount: (amount: string) => void;
  setSlippage: (slippage: number) => void;
  swapTokens: () => void;
  setSwapping: (isSwapping: boolean) => void;
  setLastSwapHash: (hash: string) => void;
  resetSwap: () => void;
}

export const useSwapStore = create<SwapState & SwapActions>((set, get) => ({
  // State
  fromToken: "USDC",
  toToken: "BTC",
  fromAmount: "",
  toAmount: "",
  slippage: 0.5, // 0.5%
  isSwapping: false,
  lastSwapHash: undefined,

  // Actions
  setFromToken: (token) => set({ fromToken: token }),
  setToToken: (token) => set({ toToken: token }),
  setFromAmount: (amount) => set({ fromAmount: amount }),
  setToAmount: (amount) => set({ toAmount: amount }),
  setSlippage: (slippage) => set({ slippage }),

  swapTokens: () => {
    const { fromToken, toToken, fromAmount, toAmount } = get();
    set({
      fromToken: toToken,
      toToken: fromToken,
      fromAmount: toAmount,
      toAmount: fromAmount,
    });
  },

  setSwapping: (isSwapping) => set({ isSwapping }),
  setLastSwapHash: (hash) => set({ lastSwapHash: hash }),

  resetSwap: () =>
    set({
      fromAmount: "",
      toAmount: "",
      isSwapping: false,
      lastSwapHash: undefined,
    }),
}));
