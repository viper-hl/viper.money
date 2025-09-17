import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Settings } from "lucide-react";
import { useSwapStore } from "@/store";

export default function SwapPage() {
  const {
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    slippageTolerance,
    setTokenIn,
    setTokenOut,
    setAmountIn,
    swapTokens,
  } = useSwapStore();

  const [isSwapping, setIsSwapping] = useState(false);

  const handleSwap = async () => {
    setIsSwapping(true);
    // TODO: 실제 스왑 로직 구현
    setTimeout(() => {
      setIsSwapping(false);
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Swap</CardTitle>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* From Token */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>From</span>
              <span>Balance: --</span>
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="0.0"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" className="min-w-20">
                {tokenIn || "Select"}
              </Button>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={swapTokens}
              className="rounded-full border"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>To</span>
              <span>Balance: --</span>
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="0.0"
                value={amountOut}
                readOnly
                className="flex-1"
              />
              <Button variant="outline" className="min-w-20">
                {tokenOut || "Select"}
              </Button>
            </div>
          </div>

          {/* Price Info */}
          {amountIn && amountOut && (
            <div className="space-y-2 p-3 bg-secondary rounded-lg text-sm">
              <div className="flex justify-between">
                <span>Price Impact</span>
                <span className="text-viper-green">~0.1%</span>
              </div>
              <div className="flex justify-between">
                <span>Protocol Fee</span>
                <span>~5 bps</span>
              </div>
              <div className="flex justify-between">
                <span>Slippage Tolerance</span>
                <span>{slippageTolerance / 100}%</span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <Button
            variant="viper"
            className="w-full"
            onClick={handleSwap}
            disabled={!tokenIn || !tokenOut || !amountIn || isSwapping}
          >
            {isSwapping ? "Swapping..." : "Swap"}
          </Button>

          {/* Warning */}
          <p className="text-xs text-muted-foreground text-center">
            데모용 인터페이스입니다. 실제 거래는 Aggregator를 통해 이루어집니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
