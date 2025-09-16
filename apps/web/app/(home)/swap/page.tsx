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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { ArrowDown, ArrowUpDown, Clock, DollarSign } from 'lucide-react';

export default function SwapPage() {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState('USDC');
  const [toToken, setToToken] = useState('BTC');

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Swap</h1>
        <p className="text-gray-400">
          오더북 기반 가격으로 더 좋은 체결을 경험하세요
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Swap Interface */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-[#4EF08A]">Swap Tokens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* From Token */}
            <div className="space-y-2">
              <Label className="text-white">From</Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <Select value={fromToken} onValueChange={setFromToken}>
                  <SelectTrigger className="w-24 bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="HYPE">HYPE</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSwapTokens}
                className="text-[#4EF08A] hover:bg-gray-800"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            {/* To Token */}
            <div className="space-y-2">
              <Label className="text-white">To</Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="0.0"
                    value={toAmount}
                    onChange={(e) => setToAmount(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <Select value={toToken} onValueChange={setToToken}>
                  <SelectTrigger className="w-24 bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="HYPE">HYPE</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Info */}
            <div className="bg-gray-800/50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Rate</span>
                <span className="text-white">
                  1 {fromToken} = 0.042 {toToken}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price Impact</span>
                <span className="text-green-400">&lt;0.1%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Fee</span>
                <span className="text-white">0.05%</span>
              </div>
            </div>

            <Button className="w-full bg-[#4EF08A] hover:bg-[#3DD174] text-black font-semibold">
              Swap
            </Button>
          </CardContent>
        </Card>

        {/* Price Comparison */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-[#4EF08A]">Price Comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <div className="font-medium text-white">Viper (Best)</div>
                  <div className="text-sm text-gray-400">
                    Hyperliquid Orderbook
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">0.0425 BTC</div>
                  <div className="text-green-400 text-sm">+2.3%</div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                <div>
                  <div className="font-medium text-gray-300">Uniswap V3</div>
                  <div className="text-sm text-gray-400">AMM</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-300 font-medium">0.0415 BTC</div>
                  <div className="text-gray-400 text-sm">-</div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                <div>
                  <div className="font-medium text-gray-300">1inch</div>
                  <div className="text-sm text-gray-400">Aggregator</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-300 font-medium">0.0418 BTC</div>
                  <div className="text-yellow-400 text-sm">+0.7%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-[#4EF08A]">Recent Swaps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#4EF08A] rounded-full flex items-center justify-center">
                    <ArrowDown className="h-4 w-4 text-black" />
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      1,000 USDC → 0.042 BTC
                    </div>
                    <div className="text-sm text-gray-400 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      2분 전
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-medium">+$23.40</div>
                  <div className="text-sm text-gray-400">+2.3% vs AMM</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
