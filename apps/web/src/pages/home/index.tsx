import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ConnectWalletSection } from "@/components/layout/header/connect-wallet-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#4EF08A] to-green-400 rounded-full flex items-center justify-center">
              🐍
            </div>
            <span className="text-xl font-bold text-white">viper</span>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-white mb-6">
            <span className="text-[#4EF08A]">Better Prices</span> for
            Aggregators
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Providing Router/Wrapper + Core Swap Agent to enable EVM DEX
            Aggregators to seamlessly route through Hyperliquid's spot
            orderbook.
          </p>

          <ConnectWalletSection />

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
              <h3 className="text-xl font-semibold text-[#4EF08A] mb-3">
                Better Pricing
              </h3>
              <p className="text-gray-300">
                Aggressive routing to orderbook-based pricing when favorable
                compared to AMM-only solutions
              </p>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
              <h3 className="text-xl font-semibold text-[#4EF08A] mb-3">
                Accessibility
              </h3>
              <p className="text-gray-300">
                Simple interface that aggregators can integrate immediately
              </p>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
              <h3 className="text-xl font-semibold text-[#4EF08A] mb-3">
                Transparency
              </h3>
              <p className="text-gray-300">
                Visualize quotes, slippage, and fee structures both on-chain and
                off-chain
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
