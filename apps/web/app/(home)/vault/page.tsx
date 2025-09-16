'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import { Progress } from '@workspace/ui/components/progress';
import { Badge } from '@workspace/ui/components/badge';
import {
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  PiggyBank,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export default function VaultPage() {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Vault</h1>
        <p className="text-gray-400">
          HYPE를 스테이킹하고 스왑 수익을 공유받으세요
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total TVL
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-[#4EF08A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">$2,847,523</div>
            <p className="text-xs text-green-400">+12.3% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Current APR
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#4EF08A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">18.4%</div>
            <p className="text-xs text-green-400">+2.1% from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Stakers
            </CardTitle>
            <Users className="h-4 w-4 text-[#4EF08A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1,847</div>
            <p className="text-xs text-green-400">+127 this week</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              My stHYPE
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-[#4EF08A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1,247.83</div>
            <p className="text-xs text-gray-400">≈ $3,892.14</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Stake/Unstake Interface */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-[#4EF08A]">Stake HYPE</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="stake" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stake">Stake</TabsTrigger>
                <TabsTrigger value="unstake">Unstake</TabsTrigger>
              </TabsList>

              <TabsContent value="stake" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Amount to Stake</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="0.0"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <Button
                      variant="outline"
                      className="border-[#4EF08A] text-[#4EF08A] hover:bg-[#4EF08A] hover:text-black"
                    >
                      MAX
                    </Button>
                  </div>
                  <div className="text-sm text-gray-400">
                    Balance: 2,847.23 HYPE
                  </div>
                </div>

                <div className="bg-gray-800/50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">You will receive</span>
                    <span className="text-white">
                      {stakeAmount || '0.0'} stHYPE
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Exchange rate</span>
                    <span className="text-white">1 HYPE = 1 stHYPE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Annual rewards</span>
                    <span className="text-green-400">~18.4% APR</span>
                  </div>
                </div>

                <Button className="w-full bg-[#4EF08A] hover:bg-[#3DD174] text-black font-semibold">
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Stake HYPE
                </Button>
              </TabsContent>

              <TabsContent value="unstake" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Amount to Unstake</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="0.0"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <Button
                      variant="outline"
                      className="border-[#4EF08A] text-[#4EF08A] hover:bg-[#4EF08A] hover:text-black"
                    >
                      MAX
                    </Button>
                  </div>
                  <div className="text-sm text-gray-400">
                    Staked: 1,247.83 stHYPE
                  </div>
                </div>

                <div className="bg-gray-800/50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">You will receive</span>
                    <span className="text-white">
                      {unstakeAmount || '0.0'} HYPE
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Unbonding period</span>
                    <span className="text-yellow-400">7 days</span>
                  </div>
                </div>

                <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold">
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Unstake HYPE
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Rewards & Stats */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-[#4EF08A]">
              Rewards & Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pending Rewards */}
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-white">Pending Rewards</h4>
                <Badge variant="secondary" className="bg-[#4EF08A] text-black">
                  Claimable
                </Badge>
              </div>
              <div className="text-2xl font-bold text-[#4EF08A] mb-2">
                23.47 HYPE
              </div>
              <div className="text-sm text-gray-400 mb-3">≈ $73.21</div>
              <Button className="w-full bg-[#4EF08A] hover:bg-[#3DD174] text-black">
                Claim Rewards
              </Button>
            </div>

            {/* Performance */}
            <div className="space-y-3">
              <h4 className="font-medium text-white">Performance</h4>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Staked</span>
                  <span className="text-white">1,247.83 stHYPE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Rewards Earned</span>
                  <span className="text-green-400">187.45 HYPE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Staking Since</span>
                  <span className="text-white">Nov 15, 2024</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress to next reward</span>
                  <span className="text-white">73%</span>
                </div>
                <Progress value={73} className="h-2" />
                <div className="text-xs text-gray-400 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Next distribution in 2 days
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reward History */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-[#4EF08A]">Reward History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                date: 'Jan 15, 2025',
                amount: '12.45 HYPE',
                value: '$38.90',
                type: 'Weekly Distribution',
              },
              {
                date: 'Jan 8, 2025',
                amount: '11.82 HYPE',
                value: '$36.94',
                type: 'Weekly Distribution',
              },
              {
                date: 'Jan 1, 2025',
                amount: '13.67 HYPE',
                value: '$42.73',
                type: 'Weekly Distribution',
              },
              {
                date: 'Dec 25, 2024',
                amount: '15.23 HYPE',
                value: '$47.62',
                type: 'Bonus Distribution',
              },
            ].map((reward, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg"
              >
                <div>
                  <div className="text-white font-medium">{reward.amount}</div>
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
    </div>
  );
}
