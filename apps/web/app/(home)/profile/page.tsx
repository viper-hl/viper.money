'use client';

import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import { Badge } from '@workspace/ui/components/badge';
import {
  Wallet,
  TrendingUp,
  Clock,
  Award,
  Activity,
  LogOut,
  Copy,
  ExternalLink,
} from 'lucide-react';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            지갑이 연결되지 않음
          </h2>
          <p className="text-gray-400">프로필을 보려면 지갑을 연결해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="text-gray-400">지갑 정보와 거래 이력을 확인하세요</p>
      </div>

      {/* Wallet Info */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-[#4EF08A] flex items-center">
            <Wallet className="h-5 w-5 mr-2" />
            Wallet Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Connected Address</div>
              <div className="text-white font-mono text-lg">
                {formatAddress(address || '')}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAddress}
                className="border-[#4EF08A] text-[#4EF08A] hover:bg-[#4EF08A] hover:text-black"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copiedAddress ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-400 hover:bg-gray-800"
                onClick={() =>
                  window.open(
                    `https://explorer.hyperliquid.xyz/address/${address}`,
                    '_blank',
                  )
                }
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Explorer
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => disconnect()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Total Swaps</div>
              <div className="text-2xl font-bold text-white">847</div>
              <div className="text-xs text-green-400">+12 this week</div>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Volume Traded</div>
              <div className="text-2xl font-bold text-white">$284.7K</div>
              <div className="text-xs text-green-400">+$23.4K this week</div>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Savings vs AMM</div>
              <div className="text-2xl font-bold text-[#4EF08A]">$2,847</div>
              <div className="text-xs text-green-400">1.2% avg improvement</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-[#4EF08A] flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    type: 'swap',
                    from: '1,000 USDC',
                    to: '0.042 BTC',
                    savings: '+$23.40',
                    time: '2분 전',
                    hash: '0x1234...5678',
                  },
                  {
                    type: 'stake',
                    from: '500 HYPE',
                    to: '500 stHYPE',
                    savings: '',
                    time: '1시간 전',
                    hash: '0x2345...6789',
                  },
                  {
                    type: 'swap',
                    from: '2 ETH',
                    to: '6,847 USDC',
                    savings: '+$45.20',
                    time: '3시간 전',
                    hash: '0x3456...7890',
                  },
                  {
                    type: 'claim',
                    from: 'Vault Rewards',
                    to: '12.45 HYPE',
                    savings: '',
                    time: '1일 전',
                    hash: '0x4567...8901',
                  },
                ].map((activity, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'swap'
                            ? 'bg-[#4EF08A]'
                            : activity.type === 'stake'
                              ? 'bg-blue-500'
                              : activity.type === 'claim'
                                ? 'bg-yellow-500'
                                : 'bg-gray-500'
                        }`}
                      >
                        {activity.type === 'swap' && (
                          <TrendingUp className="h-4 w-4 text-black" />
                        )}
                        {activity.type === 'stake' && (
                          <Wallet className="h-4 w-4 text-white" />
                        )}
                        {activity.type === 'claim' && (
                          <Award className="h-4 w-4 text-black" />
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {activity.from} → {activity.to}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.time}
                          <span className="mx-2">•</span>
                          <span className="font-mono">{activity.hash}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.savings && (
                        <div className="text-green-400 font-medium">
                          {activity.savings}
                        </div>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {activity.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-[#4EF08A] flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Reward History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    date: 'Jan 15, 2025',
                    amount: '12.45 HYPE',
                    value: '$38.90',
                    type: 'Vault Rewards',
                  },
                  {
                    date: 'Jan 8, 2025',
                    amount: '11.82 HYPE',
                    value: '$36.94',
                    type: 'Vault Rewards',
                  },
                  {
                    date: 'Jan 1, 2025',
                    amount: '0.5 HYPE',
                    value: '$1.56',
                    type: 'Referral Bonus',
                  },
                  {
                    date: 'Dec 25, 2024',
                    amount: '15.23 HYPE',
                    value: '$47.62',
                    type: 'Holiday Bonus',
                  },
                ].map((reward, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg"
                  >
                    <div>
                      <div className="text-white font-medium">
                        {reward.amount}
                      </div>
                      <div className="text-sm text-gray-400">{reward.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium">
                        {reward.value}
                      </div>
                      <div className="text-sm text-gray-400">{reward.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-[#4EF08A] flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: 'First Swap',
                    description: 'Complete your first swap',
                    earned: true,
                    date: 'Nov 15, 2024',
                  },
                  {
                    title: 'Volume Milestone',
                    description: 'Trade over $100K volume',
                    earned: true,
                    date: 'Dec 3, 2024',
                  },
                  {
                    title: 'Vault Participant',
                    description: 'Stake HYPE in the vault',
                    earned: true,
                    date: 'Nov 20, 2024',
                  },
                  {
                    title: 'Diamond Hands',
                    description: 'Stake for 90+ days',
                    earned: false,
                    progress: '45/90 days',
                  },
                  {
                    title: 'Power User',
                    description: 'Complete 1000+ swaps',
                    earned: false,
                    progress: '847/1000 swaps',
                  },
                  {
                    title: 'Efficiency Expert',
                    description: 'Save $10K vs AMM prices',
                    earned: false,
                    progress: '$2.8K/$10K',
                  },
                ].map((achievement, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border ${
                      achievement.earned
                        ? 'bg-[#4EF08A]/10 border-[#4EF08A]'
                        : 'bg-gray-800/30 border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4
                        className={`font-medium ${
                          achievement.earned ? 'text-[#4EF08A]' : 'text-white'
                        }`}
                      >
                        {achievement.title}
                      </h4>
                      {achievement.earned && (
                        <Badge className="bg-[#4EF08A] text-black">
                          Earned
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      {achievement.description}
                    </p>
                    {achievement.earned ? (
                      <div className="text-xs text-[#4EF08A]">
                        Earned on {achievement.date}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        Progress: {achievement.progress}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
