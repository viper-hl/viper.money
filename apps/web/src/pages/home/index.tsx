import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ConnectWalletSection } from "@/components/layout/header/connect-wallet-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-viper-bg-primary via-viper-bg-secondary to-viper-bg-primary">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-viper-bg-secondary/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-viper-green to-viper-green-light rounded-full flex items-center justify-center animate-viper-pulse snake-wiggle">
              🐍
            </div>
            <span className="text-xl font-bold text-foreground">viper</span>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto animate-slide-in">
          <h1 className="text-6xl font-bold text-foreground mb-6">
            <span className="viper-gradient-text viper-text-glow animate-viper-glow">
              Better Prices
            </span>{" "}
            for Aggregators
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Providing Router/Wrapper + Core Swap Agent to enable EVM DEX
            Aggregators to seamlessly route through Hyperliquid's spot
            orderbook.
          </p>

          <ConnectWalletSection />

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 text-left mt-16">
            <div className="viper-card p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-viper-green mb-3">
                Better Pricing
              </h3>
              <p className="text-card-foreground">
                Aggressive routing to orderbook-based pricing when favorable
                compared to AMM-only solutions
              </p>
            </div>

            <div className="viper-card p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-viper-green mb-3">
                Accessibility
              </h3>
              <p className="text-card-foreground">
                Simple interface that aggregators can integrate immediately
              </p>
            </div>

            <div className="viper-card p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-viper-green mb-3">
                Transparency
              </h3>
              <p className="text-card-foreground">
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
