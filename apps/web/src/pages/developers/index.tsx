import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#4EF08A] to-green-400 rounded-full flex items-center justify-center">
              🐍
            </div>
            <span className="text-xl font-bold text-white">viper</span>
          </Link>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Developer Documentation
            </h1>
            <p className="text-xl text-gray-300">
              Integrate Viper's orderbook-based routing into your DEX aggregator
            </p>
          </div>

          {/* Quick Start Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-[#4EF08A] flex items-center">
                  <Github className="w-5 h-5 mr-2" />
                  API Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Complete API reference for integrating Viper's routing engine
                </p>
                <Button
                  className="bg-[#4EF08A] hover:bg-[#3DD174] text-black"
                  asChild
                >
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    View API Docs
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-[#4EF08A]">
                  Quick Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Get started with our SDK in under 5 minutes
                </p>
                <Button
                  variant="outline"
                  className="border-[#4EF08A] text-[#4EF08A] hover:bg-[#4EF08A] hover:text-black"
                  asChild
                >
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    View Guide
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Code Example */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Quick Start Example</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-black p-4 rounded-lg text-sm text-green-400 overflow-x-auto">
                {`// Install Viper SDK
npm install @viper/sdk

// Basic integration
import { ViperRouter } from '@viper/sdk';

const router = new ViperRouter({
  apiKey: 'your-api-key',
  network: 'hyperliquid-mainnet'
});

// Get quote
const quote = await router.getQuote({
  fromToken: 'USDC',
  toToken: 'BTC',
  amount: '1000'
});

// Execute swap
const txHash = await router.executeSwap(quote);`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
