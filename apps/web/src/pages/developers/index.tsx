import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Code,
  FileText,
  Link as LinkIcon,
  Zap,
  Shield,
  Activity,
} from "lucide-react";

export default function DevelopersPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Developers</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Viper 프로토콜을 당신의 Aggregator에 통합하세요. 간단한 인터페이스로
          더 나은 가격을 사용자에게 제공할 수 있습니다.
        </p>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Start
          </CardTitle>
          <CardDescription>
            몇 줄의 코드로 Viper를 당신의 Aggregator에 통합하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-secondary p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div className="text-primary">// Get Quote</div>
            <div>
              const quote = await viper.getQuote(tokenIn, tokenOut, amountIn)
            </div>
            <br />
            <div className="text-primary">// Execute Swap</div>
            <div>
              const result = await viper.swapExactIn(quote.id, amountIn, minOut,
              receiver)
            </div>
          </div>
          <div className="flex gap-2">
            <Button>
              <Code className="h-4 w-4 mr-2" />
              View Full Docs
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Download SDK
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle>안전하고 신뢰할 수 있는</CardTitle>
            <CardDescription>
              Quote 만료 시간, 슬리피지 보호, 부분 체결 정책으로 안전한 거래
              보장
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Zap className="h-8 w-8 text-primary mb-2" />
            <CardTitle>간단한 통합</CardTitle>
            <CardDescription>
              표준 인터페이스로 기존 Aggregator에 쉽게 추가 가능
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Activity className="h-8 w-8 text-primary mb-2" />
            <CardTitle>실시간 모니터링</CardTitle>
            <CardDescription>
              상태 페이지, 헬스체크, 메트릭으로 시스템 상태 투명하게 공개
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* API Reference */}
      <Card>
        <CardHeader>
          <CardTitle>API Reference</CardTitle>
          <CardDescription>Viper Router의 핵심 함수들</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* getQuote */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-primary">getQuote</h3>
            <div className="bg-secondary p-4 rounded-lg font-mono text-sm">
              <div className="text-muted-foreground">function</div>
              <div>
                getQuote(address tokenIn, address tokenOut, uint256 amountIn)
              </div>
              <div className="text-muted-foreground mt-2">returns</div>
              <div>
                (uint256 amountOut, uint32 feeBps, uint64 validUntil, bytes32
                quoteId)
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              토큰 쌍과 입력 수량에 대한 견적을 요청합니다. 예상 수령량, 수수료,
              유효시간, Quote ID를 반환합니다.
            </p>
          </div>

          {/* swapExactIn */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-primary">swapExactIn</h3>
            <div className="bg-secondary p-4 rounded-lg font-mono text-sm">
              <div className="text-muted-foreground">function</div>
              <div>
                swapExactIn(bytes32 quoteId, uint256 amountIn, uint256
                minAmountOut, address receiver, bool allowPartialFill)
              </div>
              <div className="text-muted-foreground mt-2">returns</div>
              <div>uint256 amountOut</div>
            </div>
            <p className="text-sm text-muted-foreground">
              Quote ID를 사용하여 실제 스왑을 실행합니다. 원자적 실행으로
              만료/슬리피지 정책을 엄격하게 적용합니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Integration Examples */}
      <Card>
        <CardHeader>
          <CardTitle>통합 예제</CardTitle>
          <CardDescription>
            주요 Aggregator 스타일별 통합 가이드
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">1inch Style</h3>
              <p className="text-sm text-muted-foreground mb-3">
                기존 1inch API 스타일로 통합
              </p>
              <Button variant="outline" size="sm">
                <Code className="h-4 w-4 mr-2" />
                View Example
              </Button>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">ParaSwap Style</h3>
              <p className="text-sm text-muted-foreground mb-3">
                ParaSwap API 스타일로 통합
              </p>
              <Button variant="outline" size="sm">
                <Code className="h-4 w-4 mr-2" />
                View Example
              </Button>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Custom Integration</h3>
              <p className="text-sm text-muted-foreground mb-3">
                직접 스마트 컨트랙트 호출
              </p>
              <Button variant="outline" size="sm">
                <Code className="h-4 w-4 mr-2" />
                View Example
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status & Support */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Router Contract</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Operational</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Quote Service</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Operational</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Execution Engine</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Operational</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              <LinkIcon className="h-4 w-4 mr-2" />
              View Status Page
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contract Addresses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">
                Testnet Router
              </div>
              <div className="font-mono text-sm">0x1234...5678</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Testnet Vault</div>
              <div className="font-mono text-sm">0xabcd...ef12</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Chain ID</div>
              <div className="font-mono text-sm">998</div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              <FileText className="h-4 w-4 mr-2" />
              View All Addresses
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
