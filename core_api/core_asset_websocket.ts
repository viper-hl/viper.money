// Hyperliquid Core WebSocket Client for userNonFundingLedgerUpdates
// This client subscribes to ledger updates including deposits, withdrawals, transfers, liquidations, and vault operations

import WebSocket = require('ws');
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// WebSocket Types based on Hyperliquid documentation
interface WsUserNonFundingLedgerUpdate {
  time: number;
  hash: string;
  delta: WsLedgerUpdate;
}

interface WsUserNonFundingLedgerUpdates {
  isSnapshot?: boolean;
  user: string;
  updates: Array<WsUserNonFundingLedgerUpdate>;
}

type WsLedgerUpdate = 
  | WsDeposit
  | WsWithdraw 
  | WsInternalTransfer 
  | WsSubAccountTransfer 
  | WsLedgerLiquidation 
  | WsVaultDelta 
  | WsVaultWithdrawal
  | WsVaultLeaderCommission
  | WsSpotTransfer
  | WsAccountClassTransfer
  | WsSpotGenesis
  | WsRewardsClaim;

interface WsDeposit {
  type: "deposit";
  usdc: number;
}

interface WsWithdraw {
  type: "withdraw";
  usdc: number;
  nonce: number;
  fee: number;
}

interface WsInternalTransfer {
  type: "internalTransfer";
  usdc: number;
  user: string;
  destination: string;
  fee: number;
}

interface WsSubAccountTransfer {
  type: "subAccountTransfer";
  usdc: number;
  user: string;
  destination: string;
}

interface WsLedgerLiquidation {
  type: "liquidation";
  accountValue: number;
  leverageType: "Cross" | "Isolated";
  liquidatedPositions: Array<LiquidatedPosition>;
}

interface LiquidatedPosition {
  coin: string;
  szi: number;
}

interface WsVaultDelta {
  type: "vaultCreate" | "vaultDeposit" | "vaultDistribution";
  vault: string;
  usdc: number;
}

interface WsVaultWithdrawal {
  type: "vaultWithdraw";
  vault: string;
  user: string;
  requestedUsd: number;
  commission: number;
  closingCost: number;
  basis: number;
  netWithdrawnUsd: number;
}

interface WsVaultLeaderCommission {
  type: "vaultLeaderCommission";
  user: string;
  usdc: number;
}

interface WsSpotTransfer {
  type: "spotTransfer";
  token: string;
  amount: number;
  usdcValue: number;
  user: string;
  destination: string;
  fee: number;
}

interface WsAccountClassTransfer {
  type: "accountClassTransfer";
  usdc: number;
  toPerp: boolean;
}

interface WsSpotGenesis {
  type: "spotGenesis";
  token: string;
  amount: number;
}

interface WsRewardsClaim {
  type: "rewardsClaim";
  amount: number;
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

class HyperliquidWebSocketClient {
  private ws: WebSocket | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private userAddress: string;
  private isTestnet: boolean;
  
  constructor() {
    // Get user address from environment variable
    this.userAddress = process.env.HYPERLIQUID_WALLET_ADDRESS || '';
    this.isTestnet = process.env.HYPERLIQUID_TESTNET === 'true';
    
    if (!this.userAddress) {
      throw new Error('HYPERLIQUID_WALLET_ADDRESS not set in .env file');
    }
    
    console.log('Initializing WebSocket client...');
    console.log(`User address: ${this.userAddress}`);
    console.log(`Network: ${this.isTestnet ? 'Testnet' : 'Mainnet'}`);
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
  
  private handleMessage(message: string): void {
    try {
      const data = JSON.parse(message);
      console.log('Received message:', JSON.stringify(data, null, 2));
      // Handle subscription response
      if (data.channel === 'subscriptionResponse') {
        console.log('Subscription confirmed:', data.data);
        return;
      }
      
      // Handle pong response
      if (data.channel === 'pong') {
        // Heartbeat response received
        return;
      }
      
      // Handle userNonFundingLedgerUpdates data
      if (data.channel === 'userNonFundingLedgerUpdates') {
        this.processLedgerUpdates(data.data);
        return;
      }
      
    } catch (error) {
      console.error('Error parsing message:', error);
      console.error('Raw message:', message);
    }
  }
  
  private processLedgerUpdates(data: WsUserNonFundingLedgerUpdates): void {
    console.log('\n========== Ledger Updates ==========');
    console.log(`User: ${data.user}`);
    console.log(`Is Snapshot: ${data.isSnapshot || false}`);
    
    if (data.updates && data.updates.length > 0) {
      console.log(`Total updates: ${data.updates.length}`);
      
      data.updates.forEach((update, index) => {
        const date = new Date(update.time);
        console.log(`\n  Update #${index + 1}:`);
        console.log(`    Time: ${date.toISOString()}`);
        console.log(`    Hash: ${update.hash}`);
        
        const delta = update.delta;
        
        // Process different types of ledger updates
        switch (delta.type) {
          case 'deposit':
            console.log(`    Type: DEPOSIT`);
            console.log(`    USDC Amount: $${delta.usdc}`);
            break;
            
          case 'withdraw':
            console.log(`    Type: WITHDRAW`);
            console.log(`    USDC Amount: $${delta.usdc}`);
            console.log(`    Nonce: ${delta.nonce}`);
            console.log(`    Fee: $${delta.fee}`);
            break;
            
          case 'internalTransfer':
            console.log(`    Type: INTERNAL TRANSFER`);
            console.log(`    USDC Amount: $${delta.usdc}`);
            console.log(`    From: ${delta.user}`);
            console.log(`    To: ${delta.destination}`);
            console.log(`    Fee: $${delta.fee}`);
            break;
            
          case 'subAccountTransfer':
            console.log(`    Type: SUBACCOUNT TRANSFER`);
            console.log(`    USDC Amount: $${delta.usdc}`);
            console.log(`    From: ${delta.user}`);
            console.log(`    To: ${delta.destination}`);
            break;
            
          case 'liquidation':
            console.log(`    Type: LIQUIDATION`);
            console.log(`    Account Value: $${delta.accountValue}`);
            console.log(`    Leverage Type: ${delta.leverageType}`);
            if (delta.liquidatedPositions) {
              console.log(`    Liquidated Positions:`);
              delta.liquidatedPositions.forEach((pos, i) => {
                console.log(`      ${i + 1}. ${pos.coin}: ${pos.szi}`);
              });
            }
            break;
            
          case 'vaultCreate':
          case 'vaultDeposit':
          case 'vaultDistribution':
            console.log(`    Type: ${delta.type.toUpperCase()}`);
            console.log(`    Vault: ${delta.vault}`);
            console.log(`    USDC Amount: $${delta.usdc}`);
            break;
            
          case 'vaultWithdraw':
            console.log(`    Type: VAULT WITHDRAW`);
            console.log(`    Vault: ${delta.vault}`);
            console.log(`    User: ${delta.user}`);
            console.log(`    Requested: $${delta.requestedUsd}`);
            console.log(`    Commission: $${delta.commission}`);
            console.log(`    Closing Cost: $${delta.closingCost}`);
            console.log(`    Basis: $${delta.basis}`);
            console.log(`    Net Withdrawn: $${delta.netWithdrawnUsd}`);
            break;
            
          case 'vaultLeaderCommission':
            console.log(`    Type: VAULT LEADER COMMISSION`);
            console.log(`    User: ${delta.user}`);
            console.log(`    USDC Amount: $${delta.usdc}`);
            break;
            
          case 'spotTransfer':
            console.log(`    Type: SPOT TRANSFER`);
            console.log(`    Token: ${delta.token}`);
            console.log(`    Amount: ${delta.amount}`);
            console.log(`    USDC Value: $${delta.usdcValue}`);
            console.log(`    From: ${delta.user}`);
            console.log(`    To: ${delta.destination}`);
            console.log(`    Fee: $${delta.fee}`);
            break;
            
          case 'accountClassTransfer':
            console.log(`    Type: ACCOUNT CLASS TRANSFER`);
            console.log(`    USDC Amount: $${delta.usdc}`);
            console.log(`    Direction: ${delta.toPerp ? 'Spot -> Perp' : 'Perp -> Spot'}`);
            break;
            
          case 'spotGenesis':
            console.log(`    Type: SPOT GENESIS`);
            console.log(`    Token: ${delta.token}`);
            console.log(`    Amount: ${delta.amount}`);
            break;
            
          case 'rewardsClaim':
            console.log(`    Type: REWARDS CLAIM`);
            console.log(`    Amount: ${delta.amount}`);
            break;
            
          default:
            console.log(`    Type: UNKNOWN`);
            console.log(`    Data:`, JSON.stringify(delta));
        }
      });
    } else {
      console.log('No ledger updates in this message');
    }
    
    console.log('=====================================\n');
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
    console.log('Disconnecting WebSocket client...');
    
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
  console.log('===========================================');
  console.log('Hyperliquid Core WebSocket Client');
  console.log('Subscribing to userNonFundingLedgerUpdates');
  console.log('===========================================\n');
  
  const client = new HyperliquidWebSocketClient();
  
  // Start the WebSocket connection
  client.connect();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\nReceived SIGINT, shutting down gracefully...');
    client.disconnect();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n\nReceived SIGTERM, shutting down gracefully...');
    client.disconnect();
    process.exit(0);
  });
}

// Run the client
if (require.main === module) {
  main();
}

export { HyperliquidWebSocketClient };