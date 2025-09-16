'use client';

import { useState } from 'react';
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
  Code,
  Book,
  Globe,
  Activity,
  Copy,
  ExternalLink,
  Download,
  Play,
} from 'lucide-react';

export default function DevelopersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const contractAddresses = {
    router: '0x1234567890123456789012345678901234567890',
    vault: '0x2345678901234567890123456789012345678901',
  };

  const codeExamples = {
    getQuote: `// Get quote for token swap
const quote = await viperRouter.getQuote(
  "0xTokenA", // tokenIn
  "0xTokenB", // tokenOut
  ethers.parseEther("1000") // amountIn
);

console.log({
  amountOut: quote.amountOut,
  feeBps: quote.feeBps,
  validUntil: quote.validUntil,
  quoteId: quote.quoteId
});`,

    swapExactIn: `// Execute swap with quote
const tx = await viperRouter.swapExactIn(
  quote.quoteId,
  ethers.parseEther("1000"), // amountIn
  quote.amountOut * 95n / 100n, // minAmountOut (5% slippage)
  userAddress, // receiver
  false // allowPartialFill
);

await tx.wait();
console.log("Swap completed:", tx.hash);`,

    integration: `import { ViperRouter } from '@viper/sdk';

// Initialize Viper Router
const viper = new ViperRouter({
  chainId: 998, // Hyperliquid
  rpcUrl: 'https://api.hyperliquid.xyz/evm'
});

// 1inch style integration
async function getViperQuote(tokenIn, tokenOut, amount) {
  try {
    const quote = await viper.getQuote(tokenIn, tokenOut, amount);
    return {
      toAmount: quote.amountOut,
      protocols: [{
        name: 'Viper',
        part: 100,
        fromTokenAddress: tokenIn,
        toTokenAddress: tokenOut
      }]
    };
  } catch (error) {
    console.error('Viper quote failed:', error);
    return null;
  }
}`,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Developers</h1>
        <p className="text-gray-400">
          Viper Router를 통합하여 더 좋은 가격을 제공하세요
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              API Version
            </CardTitle>
            <Code className="h-4 w-4 text-[#4EF08A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">v1.0</div>
            <p className="text-xs text-green-400">Stable Release</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Uptime
            </CardTitle>
            <Activity className="h-4 w-4 text-[#4EF08A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">99.9%</div>
            <p className="text-xs text-green-400">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Integrations
            </CardTitle>
            <Globe className="h-4 w-4 text-[#4EF08A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12</div>
            <p className="text-xs text-green-400">Active Partners</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Avg Response
            </CardTitle>
            <Activity className="h-4 w-4 text-[#4EF08A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">120ms</div>
            <p className="text-xs text-green-400">Quote API</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="integration">Integration Guide</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Contract Addresses */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-[#4EF08A] flex items-center">
                  <Code className="h-5 w-5 mr-2" />
                  Contract Addresses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Viper Router</span>
                    <Badge variant="outline">Mainnet</Badge>
                  </div>
                  <div className="flex items-center justify-between bg-gray-800/50 p-2 rounded">
                    <code className="text-sm text-white font-mono">
                      {contractAddresses.router.slice(0, 20)}...
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopyCode(contractAddresses.router, 'router')
                      }
                    >
                      {copiedCode === 'router' ? (
                        'Copied!'
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Viper Vault</span>
                    <Badge variant="outline">Mainnet</Badge>
                  </div>
                  <div className="flex items-center justify-between bg-gray-800/50 p-2 rounded">
                    <code className="text-sm text-white font-mono">
                      {contractAddresses.vault.slice(0, 20)}...
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopyCode(contractAddresses.vault, 'vault')
                      }
                    >
                      {copiedCode === 'vault' ? (
                        'Copied!'
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Start */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-[#4EF08A] flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-white font-medium">1. Install SDK</h4>
                  <div className="bg-gray-800/50 p-2 rounded">
                    <code className="text-sm text-[#4EF08A]">
                      npm install @viper/sdk
                    </code>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-white font-medium">2. Get Quote</h4>
                  <div className="bg-gray-800/50 p-2 rounded">
                    <code className="text-sm text-white">
                      await viper.getQuote(...)
                    </code>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-white font-medium">3. Execute Swap</h4>
                  <div className="bg-gray-800/50 p-2 rounded">
                    <code className="text-sm text-white">
                      await viper.swapExactIn(...)
                    </code>
                  </div>
                </div>

                <Button className="w-full bg-[#4EF08A] hover:bg-[#3DD174] text-black">
                  <Book className="h-4 w-4 mr-2" />
                  View Full Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-[#4EF08A]">Core Functions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-white font-medium">
                  getQuote(tokenIn, tokenOut, amountIn)
                </h4>
                <p className="text-sm text-gray-400">
                  Get a quote for swapping tokens. Returns expected output
                  amount, fees, and validity period.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-400">Solidity</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopyCode(codeExamples.getQuote, 'getQuote')
                      }
                    >
                      {copiedCode === 'getQuote' ? (
                        'Copied!'
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="text-sm text-white overflow-x-auto">
                    <code>{codeExamples.getQuote}</code>
                  </pre>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-medium">
                  swapExactIn(quoteId, amountIn, minAmountOut, receiver,
                  allowPartialFill)
                </h4>
                <p className="text-sm text-gray-400">
                  Execute a swap using a previously obtained quote. Supports
                  slippage protection and partial fills.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-400">Solidity</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopyCode(codeExamples.swapExactIn, 'swapExactIn')
                      }
                    >
                      {copiedCode === 'swapExactIn' ? (
                        'Copied!'
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="text-sm text-white overflow-x-auto">
                    <code>{codeExamples.swapExactIn}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-[#4EF08A]">
                Integration Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-white font-medium">
                  Aggregator Integration
                </h4>
                <p className="text-sm text-gray-400">
                  Viper는 기존 DEX Aggregator와 쉽게 통합할 수 있도록
                  설계되었습니다. 1inch 스타일의 API를 지원합니다.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-400">
                      TypeScript Integration
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopyCode(codeExamples.integration, 'integration')
                      }
                    >
                      {copiedCode === 'integration' ? (
                        'Copied!'
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="text-sm text-white overflow-x-auto">
                    <code>{codeExamples.integration}</code>
                  </pre>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-gray-800/30 p-4 rounded-lg">
                  <h5 className="text-white font-medium mb-2">
                    ✅ Best Practices
                  </h5>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Quote 유효시간을 항상 확인</li>
                    <li>• 적절한 슬리피지 설정</li>
                    <li>• 부분체결 정책 고려</li>
                    <li>• 가격 비교 로직 구현</li>
                  </ul>
                </div>

                <div className="bg-gray-800/30 p-4 rounded-lg">
                  <h5 className="text-white font-medium mb-2">
                    ⚠️ Important Notes
                  </h5>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Quote는 2-5초 후 만료</li>
                    <li>• 가스비 별도 계산 필요</li>
                    <li>• 네트워크 상태 모니터링</li>
                    <li>• 실패 시 재시도 로직</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-[#4EF08A]">Code Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#4EF08A] text-[#4EF08A]"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download SDK
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-400"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  GitHub Repository
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-400"
                >
                  <Book className="h-4 w-4 mr-2" />
                  Full Documentation
                </Button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: 'React Hook Example',
                    language: 'TypeScript',
                    lines: '45 lines',
                  },
                  {
                    title: 'Node.js Integration',
                    language: 'JavaScript',
                    lines: '78 lines',
                  },
                  {
                    title: 'Python SDK Usage',
                    language: 'Python',
                    lines: '62 lines',
                  },
                  {
                    title: '1inch Integration',
                    language: 'TypeScript',
                    lines: '134 lines',
                  },
                ].map((example, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 cursor-pointer"
                  >
                    <div>
                      <div className="text-white font-medium">
                        {example.title}
                      </div>
                      <div className="text-sm text-gray-400">
                        {example.language} • {example.lines}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
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
