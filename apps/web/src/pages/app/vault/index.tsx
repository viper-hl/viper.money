import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TrendingUp, Coins, Users, BarChart3 } from "lucide-react";

export default function VaultPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Viper Vault</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          HYPE 스테이킹 LST(stHYPE)를 통해 스테이킹 리워드와 스왑 수익을 함께
          받으세요
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">8.5%</div>
            <div className="text-sm text-muted-foreground">Current APR</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Coins className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">1.2M</div>
            <div className="text-sm text-muted-foreground">Total HYPE</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">543</div>
            <div className="text-sm text-muted-foreground">Stakers</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">98.2%</div>
            <div className="text-sm text-muted-foreground">Utilization</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Stake Section */}
        <Card>
          <CardHeader>
            <CardTitle>Stake HYPE</CardTitle>
            <CardDescription>
              HYPE를 스테이킹하고 stHYPE를 받으세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Amount</span>
                <span className="text-muted-foreground">Balance: 0 HYPE</span>
              </div>
              <div className="flex space-x-2">
                <Input placeholder="0.0" className="flex-1" />
                <Button variant="outline">Max</Button>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-secondary rounded-lg text-sm">
              <div className="flex justify-between">
                <span>You will receive</span>
                <span>-- stHYPE</span>
              </div>
              <div className="flex justify-between">
                <span>Exchange rate</span>
                <span>1 HYPE = 1.05 stHYPE</span>
              </div>
            </div>

            <Button className="w-full">Stake HYPE</Button>
          </CardContent>
        </Card>

        {/* Unstake Section */}
        <Card>
          <CardHeader>
            <CardTitle>Unstake stHYPE</CardTitle>
            <CardDescription>
              stHYPE를 언스테이킹하고 HYPE를 받으세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Amount</span>
                <span className="text-muted-foreground">Balance: 0 stHYPE</span>
              </div>
              <div className="flex space-x-2">
                <Input placeholder="0.0" className="flex-1" />
                <Button variant="outline">Max</Button>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-secondary rounded-lg text-sm">
              <div className="flex justify-between">
                <span>You will receive</span>
                <span>-- HYPE</span>
              </div>
              <div className="flex justify-between">
                <span>Unstaking period</span>
                <span>7 days</span>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Unstake stHYPE
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Rewards</CardTitle>
          <CardDescription>
            누적된 스테이킹 리워드와 스왑 수익을 확인하고 클레임하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-primary">0.0</div>
              <div className="text-sm text-muted-foreground">Pending HYPE</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-primary">0.0</div>
              <div className="text-sm text-muted-foreground">Swap Fees</div>
            </div>
            <div className="flex items-center">
              <Button className="w-full">Claim All Rewards</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Sources */}
      <Card>
        <CardHeader>
          <CardTitle>수익 원천</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <div className="font-medium">Hyper Staking Reward</div>
              <div className="text-sm text-muted-foreground">
                기본 HYPE 스테이킹 리워드
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <div className="font-medium">Swap Execution Fee</div>
              <div className="text-sm text-muted-foreground">
                스왑 실행 차익 중 프로토콜 캡쳐분 일부
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <div className="font-medium">Maker Rebate</div>
              <div className="text-sm text-muted-foreground">
                메이커 리베이트 (존재 시)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
