import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDown, ArrowUpDown, Clock, Home } from "lucide-react";
import { Link } from "react-router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useSwapQuote, useSwapComparison, useSwapHistory } from "@/apis/swap";

export default function SwapPage() {
  const { isConnected } = useAccount();
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromToken, setFromToken] = useState("USDC");
  const [toToken, setToToken] = useState("BTC");

  // API 훅 사용
  const swapRequest =
    fromAmount && fromToken && toToken
      ? {
          fromToken,
          toToken,
          fromAmount,
        }
      : null;

  const { data: quote, isLoading: quoteLoading } = useSwapQuote(swapRequest);
  const { data: comparison } = useSwapComparison(swapRequest);
  const { data: history } = useSwapHistory();

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            지갑 연결이 필요합니다
          </h1>
          <p className="text-gray-400 mb-8">
            스왑을 시작하려면 지갑을 연결해주세요.
          </p>
          <div className="space-y-4">
            <ConnectButton />
            <Link to="/">
              <Button variant="outline" className="ml-4">
                <Home className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
                      value={quote?.toAmount || toAmount}
                      onChange={(e) => setToAmount(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      disabled={!!quote}
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
              {quote && (
                <div className="bg-gray-800/50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Rate</span>
                    <span className="text-white">
                      1 {fromToken} = {quote.rate} {toToken}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Price Impact</span>
                    <span className="text-green-400">{quote.priceImpact}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Fee</span>
                    <span className="text-white">{quote.fee}</span>
                  </div>
                </div>
              )}

              <Button
                className="w-full bg-[#4EF08A] hover:bg-[#3DD174] text-black font-semibold"
                disabled={!fromAmount || quoteLoading}
              >
                {quoteLoading ? "Loading..." : "Swap"}
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
                {comparison?.map((quote, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      index === 0 ? "bg-gray-800/50" : "bg-gray-800/30"
                    }`}
                  >
                    <div>
                      <div className="font-medium text-white">
                        {quote.source === "hyperliquid"
                          ? "Viper (Best)"
                          : quote.source === "uniswap"
                            ? "Uniswap V3"
                            : "1inch"}
                      </div>
                      <div className="text-sm text-gray-400">
                        {quote.source === "hyperliquid"
                          ? "Hyperliquid Orderbook"
                          : quote.source === "uniswap"
                            ? "AMM"
                            : "Aggregator"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">
                        {quote.toAmount} {toToken}
                      </div>
                      <div
                        className={`text-sm ${
                          quote.savings ? "text-green-400" : "text-gray-400"
                        }`}
                      >
                        {quote.savings || "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        {history && history.length > 0 && (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-[#4EF08A]">Recent Swaps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.slice(0, 3).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#4EF08A] rounded-full flex items-center justify-center">
                        <ArrowDown className="h-4 w-4 text-black" />
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {tx.fromAmount} {tx.fromToken} → {tx.toAmount}{" "}
                          {tx.toToken}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(tx.timestamp).toLocaleString("ko-KR")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-medium ${
                          tx.status === "completed"
                            ? "text-green-400"
                            : tx.status === "failed"
                              ? "text-red-400"
                              : "text-yellow-400"
                        }`}
                      >
                        {tx.savings || "N/A"}
                      </div>
                      <div className="text-sm text-gray-400">
                        {tx.status === "completed"
                          ? "완료"
                          : tx.status === "failed"
                            ? "실패"
                            : "진행중"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
