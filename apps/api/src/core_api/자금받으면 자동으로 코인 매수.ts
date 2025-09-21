/**
 * Hyperliquid Auto-Buy System
 * Monitors Core Asset USDC deposits via WebSocket and automatically buys PUP token
 */

import WebSocket = require('ws');
import * as dotenv from 'dotenv';
import { placeSpotMarketOrder } from './spot_market_order_simple';

// Load environment variables
dotenv.config();

// WebSocket Types
interface WsUserNonFundingLedgerUpdate {
  time: number;
  hash: string;
  delta: WsLedgerUpdate;
}

interface WsUserNonFundingLedgerUpdates {
  isSnapshot?: boolean;
  user: string;
  updates?: Array<WsUserNonFundingLedgerUpdate>;
  nonFundingLedgerUpdates?: Array<WsUserNonFundingLedgerUpdate>;
}

type WsLedgerUpdate = WsSpotTransfer | WsDeposit | WsOther;

interface WsSpotTransfer {
  type: 'spotTransfer';
  token: string;
  amount: string;
  usdcValue: string;
  user: string;
  destination: string;
  fee: string;
  nativeTokenFee?: string;
  nonce?: number;
  feeToken?: string;
}

interface WsDeposit {
  type: 'deposit';
  usdc: number;
}

interface WsOther {
  type: string;
  [key: string]: any;
}

interface SubscriptionMessage {
  method: string;
  subscription: {
    type: string;
    user: string;
  };
}

interface HeartbeatMessage {
  method: string;
}

// Configuration
const TARGET_COIN = 'PUP'; // Coin to buy when USDC received
const MIN_ORDER_AMOUNT = 10; // Minimum order amount in USDC
const SLIPPAGE_PERCENT = 5; // Slippage tolerance for market orders

class AutoBuySystem {
  private ws: WebSocket | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private userAddress: string;
  private isTestnet: boolean;
  private processedNonces: Set<number> = new Set(); // Track processed transfers to avoid duplicates
  
  constructor() {
    // Get user address from environment variable
    this.userAddress = process.env.HYPERLIQUID_WALLET_ADDRESS || '';
    this.isTestnet = process.env.HYPERLIQUID_TESTNET === 'true';
    
    if (!this.userAddress) {
      throw new Error('HYPERLIQUID_WALLET_ADDRESS not set in .env file');
    }
    
    if (!process.env.HYPERLIQUID_PRIVATE_KEY) {
      throw new Error('HYPERLIQUID_PRIVATE_KEY not set in .env file');
    }
    
    console.log('===========================================');
    console.log('   Hyperliquid Auto-Buy System Started    ');
    console.log('===========================================');
    console.log(`User address: ${this.userAddress}`);
    console.log(`Network: ${this.isTestnet ? 'Testnet' : 'Mainnet'}`);
    console.log(`Target coin: ${TARGET_COIN}`);
    console.log(`Minimum order: $${MIN_ORDER_AMOUNT} USDC`);
    console.log(`Slippage: ${SLIPPAGE_PERCENT}%\n`);
  }
  
  connect(): void {
    // WebSocket endpoint
    const wsUrl = this.isTestnet 
      ? 'wss://api.hyperliquid-testnet.xyz/ws'
      : 'wss://api.hyperliquid.xyz/ws';
    
    console.log(`Connecting to: ${wsUrl}`);
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.on('open', () => {
      console.log('WebSocket connection established');
      this.subscribeToUserNonFundingLedgerUpdates();
      this.startHeartbeat();
    });
    
    this.ws.on('message', (data: Buffer) => {
      this.handleMessage(data.toString());
    });
    
    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error.message);
    });
    
    this.ws.on('close', () => {
      console.log('WebSocket connection closed');
      this.stopHeartbeat();
      this.attemptReconnect();
    });
  }
  
  private subscribeToUserNonFundingLedgerUpdates(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }
    
    const subscriptionMessage: SubscriptionMessage = {
      method: 'subscribe',
      subscription: {
        type: 'userNonFundingLedgerUpdates',
        user: this.userAddress
      }
    };
    
    console.log('Subscribing to userNonFundingLedgerUpdates...');
    this.ws.send(JSON.stringify(subscriptionMessage));
  }
  
  private async handleMessage(message: string): Promise<void> {
    try {
      const data = JSON.parse(message);
      
      // Handle subscription response
      if (data.channel === 'subscriptionResponse') {
        console.log('Subscription confirmed');
        return;
      }
      
      // Handle pong response
      if (data.channel === 'pong') {
        return;
      }
      
      // Handle userNonFundingLedgerUpdates data
      if (data.channel === 'userNonFundingLedgerUpdates') {
        await this.processLedgerUpdates(data.data);
        return;
      }
      
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }
  
  private async processLedgerUpdates(data: WsUserNonFundingLedgerUpdates): Promise<void> {
    // Get updates array (handle both field names)
    const updates = data.updates || data.nonFundingLedgerUpdates;
    
    if (!updates || updates.length === 0) {
      return;
    }
    
    for (const update of updates) {
      const delta = update.delta;
      
      // Check if this is a USDC spot transfer to our address
      if (delta.type === 'spotTransfer') {
        const spotTransfer = delta as WsSpotTransfer;
        
        // Check if this is USDC being received at our address
        if (spotTransfer.token === 'USDC' && 
            spotTransfer.destination.toLowerCase() === this.userAddress.toLowerCase()) {
          
          // Check if we've already processed this transfer (using nonce if available)
          if (spotTransfer.nonce && this.processedNonces.has(spotTransfer.nonce)) {
            console.log(`Skipping already processed transfer (nonce: ${spotTransfer.nonce})`);
            continue;
          }
          
          if (spotTransfer.nonce) {
            this.processedNonces.add(spotTransfer.nonce);
            
            // Clean up old nonces (keep only last 100)
            if (this.processedNonces.size > 100) {
              const noncesArray = Array.from(this.processedNonces);
              this.processedNonces = new Set(noncesArray.slice(-100));
            }
          }
          
          await this.handleUsdcReceived(spotTransfer, update);
        }
      }
    }
  }
  
  private async handleUsdcReceived(transfer: WsSpotTransfer, update: WsUserNonFundingLedgerUpdate): Promise<void> {
    const amount = parseFloat(transfer.amount);
    const usdcValue = parseFloat(transfer.usdcValue);
    const date = new Date(update.time);
    
    console.log('\n=�=�=� USDC RECEIVED! =�=�=�');
    console.log('========================================');
    console.log(`Time: ${date.toISOString()}`);
    console.log(`From: ${transfer.user}`);
    console.log(`Amount: ${amount} USDC`);
    console.log(`Value: $${usdcValue}`);
    console.log(`Fee: $${transfer.fee}`);
    console.log(`Hash: ${update.hash}`);
    console.log('========================================\n');
    
    // Check if amount is sufficient for order
    if (amount < MIN_ORDER_AMOUNT) {
      console.log(`� Received amount $${amount} is below minimum order amount $${MIN_ORDER_AMOUNT}`);
      console.log('   Skipping auto-buy for this transfer.\n');
      return;
    }
    
    // Execute auto-buy
    console.log(`=� Initiating auto-buy of ${TARGET_COIN}...`);
    console.log(`   Amount to spend: $${amount} USDC\n`);
    
    try {
      // Place market buy order for PUP
      await placeSpotMarketOrder(
        TARGET_COIN,
        amount,
        true, // buy
        SLIPPAGE_PERCENT
      );
      
      console.log('\n<� AUTO-BUY COMPLETED SUCCESSFULLY! <�');
      console.log(`Successfully bought ${TARGET_COIN} with ${amount} USDC`);
      console.log('========================================\n');
      
    } catch (error) {
      console.error('\nL AUTO-BUY FAILED');
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
        
        // Log specific error guidance
        if (error.message.includes('Insufficient USDC balance')) {
          console.log('� USDC might not have been credited yet. Will retry on next deposit.');
        } else if (error.message.includes('minimum value')) {
          console.log('� Order amount too small. Waiting for larger deposit.');
        } else if (error.message.includes('rate')) {
          console.log('� Rate limited. Will retry on next deposit.');
        }
      } else {
        console.error('Unknown error:', error);
      }
      console.log('========================================\n');
    }
  }
  
  private startHeartbeat(): void {
    // Send ping every 30 seconds to keep connection alive
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const heartbeat: HeartbeatMessage = { method: 'ping' };
        this.ws.send(JSON.stringify(heartbeat));
      }
    }, 30000);
  }
  
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  
  private attemptReconnect(): void {
    if (this.reconnectInterval) {
      return; // Already attempting to reconnect
    }
    
    console.log('Attempting to reconnect in 5 seconds...');
    this.reconnectInterval = setTimeout(() => {
      this.reconnectInterval = null;
      this.connect();
    }, 5000);
  }
  
  disconnect(): void {
    console.log('Disconnecting Auto-Buy System...');
    
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Main execution
function main() {
  console.log('Starting Hyperliquid Auto-Buy System...\n');
  
  const system = new AutoBuySystem();
  
  // Start the WebSocket connection
  system.connect();
  
  console.log('System is now monitoring for USDC deposits...');
  console.log('When USDC is received, it will automatically buy', TARGET_COIN);
  console.log('\nPress Ctrl+C to stop.\n');
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\nReceived SIGINT, shutting down gracefully...');
    system.disconnect();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n\nReceived SIGTERM, shutting down gracefully...');
    system.disconnect();
    process.exit(0);
  });
}

// Run the system
if (require.main === module) {
  main();
}

export { AutoBuySystem };