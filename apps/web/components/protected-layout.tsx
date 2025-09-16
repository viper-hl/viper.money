'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[#4EF08A] to-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🐍</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            지갑 연결이 필요합니다
          </h2>
          <p className="text-gray-300 mb-6">
            viper를 사용하려면 지갑을 연결해주세요.
          </p>
          <div className="space-y-4">
            <ConnectButton />
            <Link href="/">
              <Button
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
              >
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>; // Render protected pages
}
