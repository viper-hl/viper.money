import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, History, Award } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            지갑별 참여 이력과 보상 내역을 확인하세요
          </p>
        </div>
        <Button variant="outline">Connect Wallet</Button>
      </div>

      {/* Wallet Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <CardTitle>Wallet Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Address</div>
              <div className="font-mono text-sm">Connect your wallet</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Network</div>
              <div className="text-sm">HyperEVM</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">$0</div>
            <div className="text-sm text-muted-foreground">Total Volume</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <History className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-muted-foreground">Total Swaps</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">$0</div>
            <div className="text-sm text-muted-foreground">Total Rewards</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Wallet className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-muted-foreground">stHYPE Balance</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Swaps */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Swaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No swap history found</p>
              <p className="text-sm">
                Connect your wallet to see your transaction history
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vault Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Vault Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No vault activity found</p>
              <p className="text-sm">Start staking to see your vault history</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards History */}
      <Card>
        <CardHeader>
          <CardTitle>Rewards History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No rewards yet</h3>
            <p className="mb-4">
              Start using Viper to earn rewards from swap fees and staking
            </p>
            <div className="flex gap-2 justify-center">
              <Button size="sm">Start Swapping</Button>
              <Button variant="outline" size="sm">
                Join Vault
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
