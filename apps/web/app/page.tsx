import { Button } from '@workspace/ui/components/button';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

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
            Aggregator에게 <span className="text-[#4EF08A]">더 좋은 가격</span>
            을
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            EVM의 DEX Aggregator가 Hyperliquid의 spot 오더북을 원활히
            라우팅하도록 Router/Wrapper + Core Swap Agent를 제공합니다.
          </p>

          <div className="flex justify-center gap-4 mb-16">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <Button
                            onClick={openConnectModal}
                            size="lg"
                            className="bg-[#4EF08A] hover:bg-[#3DD174] text-black font-semibold"
                          >
                            Connect Wallet
                          </Button>
                        );
                      }

                      return (
                        <Link href="/swap">
                          <Button
                            size="lg"
                            className="bg-[#4EF08A] hover:bg-[#3DD174] text-black font-semibold"
                          >
                            Start Trading
                          </Button>
                        </Link>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>

            <Link href="/vault">
              <Button
                variant="outline"
                size="lg"
                className="border-[#4EF08A] text-[#4EF08A] hover:bg-[#4EF08A] hover:text-black"
              >
                Join Vault
              </Button>
            </Link>

            <Link href="/developers">
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:text-[#4EF08A]"
              >
                View Docs
              </Button>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
              <h3 className="text-xl font-semibold text-[#4EF08A] mb-3">
                더 좋은 가격
              </h3>
              <p className="text-gray-300">
                오더북 기반 가격·체결로 AMM 단독 대비 유리한 경우를 적극 라우팅
              </p>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
              <h3 className="text-xl font-semibold text-[#4EF08A] mb-3">
                접근성
              </h3>
              <p className="text-gray-300">
                Aggregator가 바로 붙일 수 있는 간단한 인터페이스
              </p>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
              <h3 className="text-xl font-semibold text-[#4EF08A] mb-3">
                투명성
              </h3>
              <p className="text-gray-300">
                quote·슬리피지·수수료 구조를 온체인/오프체인에서 가시화
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
