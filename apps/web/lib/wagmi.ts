import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  hyperliquid,
} from 'wagmi/chains';

// Hyperliquid 체인 설정 (메인넷)
const hyperliquidMainnet = {
  id: 998,
  name: 'Hyperliquid',
  network: 'hyperliquid',
  nativeCurrency: {
    decimals: 18,
    name: 'HYPE',
    symbol: 'HYPE',
  },
  rpcUrls: {
    public: { http: ['https://api.hyperliquid.xyz/evm'] },
    default: { http: ['https://api.hyperliquid.xyz/evm'] },
  },
  blockExplorers: {
    default: {
      name: 'Hyperliquid Explorer',
      url: 'https://explorer.hyperliquid.xyz',
    },
  },
  testnet: false,
} as const;

export const config = getDefaultConfig({
  appName: 'Viper',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'viper-money',
  chains: [hyperliquidMainnet, mainnet, polygon, optimism, arbitrum, base],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
