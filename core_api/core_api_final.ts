/**
 * Hyperliquid Auto-Process System
 * Monitors USDC deposits, automatically buys HYPE token, and sends it back to sender
 */

import WebSocket = require('ws');
import * as dotenv from 'dotenv';
import { placeSpotMarketOrder } from './spot_market_order_simple';
import { transferSpotToken } from './core_transfer';

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
const TARGET_COIN = 'HYPE'; // Coin to buy when USDC received
const MIN_ORDER_AMOUNT = 1; // Minimum order amount in USDC
const SLIPPAGE_PERCENT = 5; // Slippage tolerance for market orders
const TRANSFER_DELAY_MS = 3000; // Delay before transferring HYPE (to ensure purchase is complete)

class AutoProcessSystem {
  private ws: WebSocket | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private userAddress: string;
  private isTestnet: boolean;
  private processedNonces: Set<number> = new Set(); // Track processed transfers to avoid duplicates
  private processingTransfers: Set<string> = new Set(); // Track transfers being processed
  private isFirstMessage: boolean = true; // Flag to skip initial snapshot
  private systemStartTime: number = Date.now(); // System start time to filter old transactions
  
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
    
    // Reset system start time
    this.systemStartTime = Date.now();
    
    console.log('===========================================');
    console.log('  Hyperliquid Auto-Process System Started ');
    console.log('===========================================');
    console.log(`User address: ${this.userAddress}`);
    console.log(`Network: ${this.isTestnet ? 'Testnet' : 'Mainnet'}`);
    console.log(`Process: USDC -> ${TARGET_COIN} -> Send back`);
    console.log(`Minimum order: $${MIN_ORDER_AMOUNT} USDC`);
    console.log(`Slippage: ${SLIPPAGE_PERCENT}%`);
    console.log(`System start time: ${new Date(this.systemStartTime).toISOString()}`);
    console.log('Note: Ignoring historical transactions, processing only new deposits\n');
  }
  
  connect(): void {
    // Reset first message flag on new connection
    this.isFirstMessage = true;
    
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
    // Skip initial snapshot data
    if (data.isSnapshot || this.isFirstMessage) {
      if (this.isFirstMessage) {
        console.log('Skipping initial snapshot/historical data...');
        console.log('Now monitoring for real-time USDC deposits only.\n');
        this.isFirstMessage = false;
      }
      return;
    }
    
    // Get updates array (handle both field names)
    const updates = data.updates || data.nonFundingLedgerUpdates;
    
    if (!updates || updates.length === 0) {
      return;
    }
    
    for (const update of updates) {
      // Additional time filter - skip transactions before system start
      if (update.time < this.systemStartTime) {
        console.log(`Skipping old transaction from ${new Date(update.time).toISOString()}`);
        continue;
      }
      
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
          
          // Create unique transfer ID
          const transferId = `${spotTransfer.user}_${spotTransfer.amount}_${update.time}`;
          if (this.processingTransfers.has(transferId)) {
            console.log(`Transfer already being processed: ${transferId}`);
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
          
          // Mark transfer as being processed
          this.processingTransfers.add(transferId);
          
          // Process the transfer
          await this.handleUsdcReceived(spotTransfer, update);
          
          // Remove from processing set
          this.processingTransfers.delete(transferId);
        }
      }
    }
  }
  
  private async handleUsdcReceived(transfer: WsSpotTransfer, update: WsUserNonFundingLedgerUpdate): Promise<void> {
    const amount = parseFloat(transfer.amount);
    const usdcValue = parseFloat(transfer.usdcValue);
    const senderAddress = transfer.user;
    const date = new Date(update.time);
    
    console.log('\n========== USDC RECEIVED ==========');
    console.log(`Time: ${date.toISOString()}`);
    console.log(`From: ${senderAddress}`);
    console.log(`Amount: ${amount} USDC`);
    console.log(`Value: $${usdcValue}`);
    console.log(`Fee: $${transfer.fee}`);
    console.log(`Hash: ${update.hash}`);
    console.log('====================================\n');
    
    // Check if amount is sufficient for order
    if (amount < MIN_ORDER_AMOUNT) {
      console.log(`Warning: Received amount $${amount} is below minimum order amount $${MIN_ORDER_AMOUNT}`);
      console.log('Skipping auto-process for this transfer.\n');
      return;
    }
    
    // Execute the three-step process
    console.log(`Starting auto-process: USDC -> ${TARGET_COIN} -> Send back to ${senderAddress}`);
    console.log(`Amount to process: $${amount} USDC\n`);
    
    try {
      // Step 1: Buy HYPE with received USDC
      console.log(`[Step 1/3] Buying ${TARGET_COIN} with ${amount} USDC...`);
      
      const orderResult = await placeSpotMarketOrder(
        TARGET_COIN,
        amount,
        true, // buy
        SLIPPAGE_PERCENT
      );
      
      // Extract actual filled quantity from order result
      let actualHypeAmount = '0';
      
      if (orderResult && orderResult.filledQuantity) {
        actualHypeAmount = orderResult.filledQuantity.toString();
        console.log(`[Step 1/3] Successfully bought ${actualHypeAmount} ${TARGET_COIN} with ${amount} USDC`);
      } else {
        // Fallback: estimate based on current price (~$55 per HYPE)
        const estimatedPrice = 55; // Approximate HYPE price
        const estimatedQuantity = (amount / estimatedPrice * 0.98); // 2% for fees/slippage
        actualHypeAmount = estimatedQuantity.toFixed(4);
        console.log(`[Step 1/3] Order completed. Estimated ${actualHypeAmount} ${TARGET_COIN} purchased`);
      }
      
      // Step 2: Wait a moment for the order to settle and balance to update
      console.log(`[Step 2/3] Waiting ${TRANSFER_DELAY_MS/1000} seconds for order to settle...`);
      await new Promise(resolve => setTimeout(resolve, TRANSFER_DELAY_MS));
      
      // Step 3: Transfer HYPE back to sender
      console.log(`[Step 3/3] Transferring ${actualHypeAmount} ${TARGET_COIN} back to sender: ${senderAddress}...`);
      
      try {
        await transferSpotToken(
          TARGET_COIN,
          senderAddress,
          actualHypeAmount,
          process.env.HYPERLIQUID_PRIVATE_KEY
        );
        
        console.log(`[Step 3/3] Successfully transferred ${actualHypeAmount} ${TARGET_COIN} to ${senderAddress}`);
        
        console.log('\n========== AUTO-PROCESS COMPLETED ==========');
        console.log(`Process flow completed successfully:`);
        console.log(`1. Received: ${amount} USDC from ${senderAddress}`);
        console.log(`2. Bought: ${actualHypeAmount} ${TARGET_COIN} with ${amount} USDC`);
        console.log(`3. Sent: ${actualHypeAmount} ${TARGET_COIN} back to ${senderAddress}`);
        console.log('============================================\n');
        
      } catch (transferError) {
        console.error('\n[Step 3/3] TRANSFER FAILED');
        if (transferError instanceof Error) {
          console.error(`Error: ${transferError.message}`);
          
          // Log specific error guidance
          if (transferError.message.includes('Insufficient')) {
            console.log('Note: HYPE balance might be insufficient. Check actual purchase amount.');
          } else if (transferError.message.includes('rate')) {
            console.log('Note: Rate limited. Transfer will be retried on next cycle.');
          }
        } else {
          console.error('Unknown transfer error:', transferError);
        }
        console.log('Manual intervention may be required to complete the transfer.');
      }
      
    } catch (error) {
      console.error('\nAUTO-PROCESS FAILED');
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
        
        // Log specific error guidance
        if (error.message.includes('Insufficient USDC balance')) {
          console.log('Note: USDC might not have been credited yet. Will retry on next deposit.');
        } else if (error.message.includes('minimum value')) {
          console.log('Note: Order amount too small. Waiting for larger deposit.');
        } else if (error.message.includes('rate')) {
          console.log('Note: Rate limited. Will retry on next deposit.');
        }
      } else {
        console.error('Unknown error:', error);
      }
      console.log('====================================\n');
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
    console.log('Disconnecting Auto-Process System...');
    
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
  console.log('Starting Hyperliquid Auto-Process System...\n');
  
  const system = new AutoProcessSystem();
  
  // Start the WebSocket connection
  system.connect();
  
  console.log('System is now monitoring for USDC deposits...');
  console.log(`Process: USDC received -> Buy ${TARGET_COIN} -> Send ${TARGET_COIN} back to sender`);
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

export { AutoProcessSystem };