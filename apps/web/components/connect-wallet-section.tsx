'use client';

import { Button } from '@workspace/ui/components/button';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export function ConnectWalletSection() {
  return (
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
  );
}
