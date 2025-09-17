import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="viper-text-gradient">Better Prices</span>
            <br />
            for Everyone
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            EVM의 DEX Aggregator가 Hyperliquid의 spot 오더북을 원활히
            라우팅하도록 지원하는 프로토콜
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="viper" asChild>
            <Link to="/app/swap">
              Start Trading <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="viper-outline" asChild>
            <Link to="/app/vault">Join Vault</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/developers">View Docs</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">핵심 가치</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            오더북 기반 가격·체결로 AMM 단독 대비 유리한 경우를 적극
            라우팅합니다
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-viper-green mb-2" />
              <CardTitle>더 좋은 가격</CardTitle>
              <CardDescription>
                오더북 기반 가격·체결로 AMM 단독 대비 유리한 경우를 적극 라우팅
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-viper-green mb-2" />
              <CardTitle>접근성</CardTitle>
              <CardDescription>
                Aggregator가 바로 붙일 수 있는 간단한 인터페이스 제공
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-viper-green mb-2" />
              <CardTitle>투명성</CardTitle>
              <CardDescription>
                quote·슬리피지·수수료 구조를 온체인/오프체인에서 가시화
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">아키텍처</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            3개 레그로 구성된 강력하고 확장 가능한 시스템
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>HyperCore Swap Agent</CardTitle>
              <CardDescription>
                오프체인 실행 로직 + Core 계정으로 페어별 서브어카운트 다중
                생성하여 병렬 처리·리스크 격리
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>HyperEVM Router/Wrapper</CardTitle>
              <CardDescription>
                스마트컨트랙트, corewriter 연동으로 표준 인터페이스 제공
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Viper Vault</CardTitle>
              <CardDescription>
                HYPE 스테이킹 LST(stHYPE) 발행 및 수익 분배 시스템
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 py-12 bg-card rounded-lg">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">지금 시작하세요</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            더 나은 가격으로 거래하고, Vault에 참여하여 수익을 공유하세요
          </p>
        </div>
        <Button size="lg" variant="viper" asChild>
          <Link to="/app/swap">
            Start Trading <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
