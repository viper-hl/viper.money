import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as WebSocket from 'ws';
import { ethers } from 'ethers';
import { Hyperliquid } from 'hyperliquid';
import { TransactionDto } from './dto/transaction-response.dto';

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


@Injectable()
export class HyperliquidService implements OnModuleDestroy {
  private readonly logger = new Logger(HyperliquidService.name);
  private ws: WebSocket | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private userAddress: string;
  private isTestnet: boolean;
  private processedNonces: Set<number> = new Set();
  private processingTransfers: Set<string> = new Set();
  private isFirstMessage = true;
  private systemStartTime: number = Date.now();
  private transactions: TransactionDto[] = [];
  private isMonitoring = false;
  
  // Configuration
  private targetCoin = 'HYPE';
  private minOrderAmount = 1;
  private slippagePercent = 5;
  private transferDelayMs = 3000;

  // Price tick sizes for tokens
  private readonly PRICE_TICK_SIZES: { [key: string]: number } = {
    'HYPE': 3,
    'PUP': 5,
    'PURR': 5,
    'SOL': 2,
    'BTC': 0,
    'ETH': 1
  };

  constructor(private configService: ConfigService) {
    this.userAddress = this.configService.get('HYPERLIQUID_WALLET_ADDRESS', '');
    this.isTestnet = this.configService.get('HYPERLIQUID_TESTNET', 'false') === 'true';
    
    if (!this.userAddress) {
      this.logger.warn('HYPERLIQUID_WALLET_ADDRESS not configured');
    }
    
    const privateKey = this.configService.get('HYPERLIQUID_PRIVATE_KEY');
    if (!privateKey) {
      this.logger.warn('HYPERLIQUID_PRIVATE_KEY not configured');
    }
  }

  onModuleDestroy() {
    this.disconnect();
  }

  startMonitoring(config?: {
    minOrderAmount?: number;
    targetCoin?: string;
    testnet?: boolean;
  }) {
    if (this.isMonitoring) {
      return { message: 'Monitoring already active' };
    }

    // Apply configuration if provided
    if (config?.minOrderAmount) {
      this.minOrderAmount = config.minOrderAmount;
    }
    if (config?.targetCoin) {
      this.targetCoin = config.targetCoin;
    }
    if (config?.testnet !== undefined) {
      this.isTestnet = config.testnet;
    }

    // Reset system start time
    this.systemStartTime = Date.now();
    this.isFirstMessage = true;
    
    this.logger.log('Starting Hyperliquid Auto-Process System');
    this.logger.log(`User address: ${this.userAddress}`);
    this.logger.log(`Network: ${this.isTestnet ? 'Testnet' : 'Mainnet'}`);
    this.logger.log(`Process: USDC -> ${this.targetCoin} -> Send back`);
    this.logger.log(`Minimum order: $${this.minOrderAmount} USDC`);
    
    this.connect();
    this.isMonitoring = true;
    
    return { 
      message: 'Monitoring started successfully',
      config: {
        userAddress: this.userAddress,
        network: this.isTestnet ? 'testnet' : 'mainnet',
        targetCoin: this.targetCoin,
        minOrderAmount: this.minOrderAmount,
      }
    };
  }

  stopMonitoring() {
    if (!this.isMonitoring) {
      return { message: 'Monitoring not active' };
    }
    
    this.disconnect();
    this.isMonitoring = false;
    
    return { message: 'Monitoring stopped successfully' };
  }

  getStatus() {
    return {
      status: this.isMonitoring ? 'running' : 'stopped',
      wsConnected: this.ws?.readyState === WebSocket.OPEN,
      userAddress: this.userAddress,
      network: this.isTestnet ? 'testnet' : 'mainnet',
      targetCoin: this.targetCoin,
      minOrderAmount: this.minOrderAmount,
      uptime: Math.floor((Date.now() - this.systemStartTime) / 1000),
      transactionsProcessed: this.transactions.filter(t => t.status === 'completed').length,
      startTime: new Date(this.systemStartTime),
    };
  }

  getTransactions(limit?: number) {
    const transactions = [...this.transactions].reverse(); // Most recent first
    return limit ? transactions.slice(0, limit) : transactions;
  }

  async processManual(amount: number, senderAddress: string, targetCoin?: string, slippagePercent?: number) {
    const coin = targetCoin || this.targetCoin;
    const slippage = slippagePercent || this.slippagePercent;
    
    const transactionId = `manual_${Date.now()}`;
    const transaction: TransactionDto = {
      id: transactionId,
      timestamp: new Date(),
      from: senderAddress,
      to: this.userAddress,
      usdcAmount: amount,
      hypeAmount: '0',
      hash: 'manual_process',
      status: 'pending',
    };
    
    this.transactions.push(transaction);
    
    try {
      this.logger.log(`Manual process: $${amount} USDC -> ${coin} for ${senderAddress}`);
      
      // Place spot market order
      const orderResult = await this.placeSpotMarketOrder(coin, amount, true, slippage);
      
      let actualAmount = '0';
      if (orderResult && orderResult.filledQuantity) {
        actualAmount = orderResult.filledQuantity.toString();
        this.logger.log(`Successfully bought ${actualAmount} ${coin}`);
      } else {
        // Estimate based on approximate price
        const estimatedPrice = 55; // Approximate HYPE price
        const estimatedQuantity = (amount / estimatedPrice * 0.98);
        actualAmount = estimatedQuantity.toFixed(4);
        this.logger.log(`Estimated ${actualAmount} ${coin} purchased`);
      }
      
      transaction.hypeAmount = actualAmount;
      
      // Wait for order to settle
      await new Promise(resolve => setTimeout(resolve, this.transferDelayMs));
      
      // Transfer token back to sender
      this.logger.log(`Transferring ${actualAmount} ${coin} to ${senderAddress}...`);
      const privateKey = this.configService.get('HYPERLIQUID_PRIVATE_KEY');
      await this.transferSpotToken(coin, senderAddress, actualAmount, privateKey);
      
      transaction.status = 'completed';
      this.logger.log(`Manual process completed: ${amount} USDC -> ${actualAmount} ${coin} -> ${senderAddress}`);
      
      return transaction;
      
    } catch (error) {
      transaction.status = 'failed';
      transaction.error = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Manual process failed: ${error}`);
      throw error;
    }
  }

  // Direct implementation of placeSpotMarketOrder using SDK
  private async placeSpotMarketOrder(
    symbol: string,
    usdAmount: number,
    isBuy: boolean = true,
    slippagePercent: number = 5
  ): Promise<any> {
    const privateKey = this.configService.get('HYPERLIQUID_PRIVATE_KEY');
    if (!privateKey) {
      throw new Error('HYPERLIQUID_PRIVATE_KEY not found');
    }

    if (usdAmount <= 0) {
      throw new Error('USD amount must be greater than 0');
    }

    this.logger.log(`Placing ${isBuy ? 'BUY' : 'SELL'} order for ${symbol}: $${usdAmount}`);

    try {
      // Initialize SDK
      const sdk = new Hyperliquid({
        privateKey: privateKey,
        testnet: this.isTestnet,
        enableWs: false
      });

      // Get wallet address (unused but kept for potential future use)

      // Create spot symbol
      const spotSymbol = `${symbol.toUpperCase()}-SPOT`;
      this.logger.log(`Using symbol: ${spotSymbol}`);

      // Get spot metadata for decimals
      const spotMeta = await sdk.info.spot.getSpotMeta();
      let decimals = 2; // default
      if (spotMeta && spotMeta.tokens) {
        const token = spotMeta.tokens.find((t: any) => 
          t.name === symbol.toUpperCase() || 
          t.name === spotSymbol
        );
        if (token) {
          decimals = token.szDecimals || 2;
        }
      }

      // Get current price
      const allMids = await sdk.info.getAllMids();
      
      // Try different symbol formats
      let currentPrice = 0;
      let actualSymbol = '';
      
      // Try standard spot format first
      if (allMids[spotSymbol]) {
        currentPrice = parseFloat(allMids[spotSymbol]);
        actualSymbol = spotSymbol;
      }
      // Try without -SPOT suffix
      else if (allMids[symbol.toUpperCase()]) {
        currentPrice = parseFloat(allMids[symbol.toUpperCase()]);
        actualSymbol = symbol.toUpperCase();
      }
      // Try with /USDC format
      else if (allMids[`${symbol.toUpperCase()}/USDC`]) {
        currentPrice = parseFloat(allMids[`${symbol.toUpperCase()}/USDC`]);
        actualSymbol = `${symbol.toUpperCase()}/USDC`;
      }
      
      if (currentPrice === 0) {
        throw new Error(`No price data found for ${symbol}`);
      }

      this.logger.log(`Current price for ${symbol}: $${currentPrice}`);

      // Calculate order parameters
      const rawQuantity = usdAmount / currentPrice;
      const quantityTickSize = Math.pow(10, -decimals);
      const orderQuantity = Math.floor(rawQuantity / quantityTickSize) * quantityTickSize;

      // Calculate price with slippage
      const slippage = slippagePercent / 100;
      const rawOrderPrice = isBuy
        ? currentPrice * (1 + slippage)
        : currentPrice * (1 - slippage);

      // Apply tick size rounding if available
      const tickDecimals = this.PRICE_TICK_SIZES[symbol.toUpperCase()];
      const orderPrice = tickDecimals
        ? this.roundToTickSize(rawOrderPrice, tickDecimals)
        : rawOrderPrice;

      this.logger.log(`Order quantity: ${orderQuantity} ${symbol}, Order price: $${orderPrice}`);

      // Validate quantity
      if (orderQuantity === 0) {
        throw new Error(`Order quantity too small. Minimum: ${quantityTickSize} ${symbol}`);
      }

      // Place order using SDK
      const orderRequest = {
        coin: actualSymbol,
        is_buy: isBuy,
        sz: orderQuantity,
        limit_px: orderPrice,
        order_type: {
          limit: {
            tif: 'Ioc' as const  // Immediate or Cancel for market order
          }
        },
        reduce_only: false,
        post_only: false
      };

      this.logger.log('Submitting order...');
      const result = await sdk.exchange.placeOrder(orderRequest);

      // Process result
      if (result.status === 'ok') {
        this.logger.log('Order placed successfully');
        
        const response = result.response;
        if (response?.type === 'order' && response?.data) {
          const orderData = response.data;
          
          if (orderData.statuses && orderData.statuses.length > 0) {
            const status = orderData.statuses[0];
            
            if (status.filled) {
              const filledQuantity = status.filled.totalSz || orderQuantity;
              this.logger.log(`Order filled: ${filledQuantity} ${symbol} at avg price $${status.filled.avgPx || orderPrice}`);
              return {
                status: 'ok',
                filledQuantity: filledQuantity,
                avgPrice: status.filled.avgPx || orderPrice
              };
            }
          }
        }
        
        // If we don't have detailed fill info, return estimates
        return {
          status: 'ok',
          filledQuantity: orderQuantity,
          avgPrice: orderPrice
        };
      } else {
        throw new Error(`Order failed: ${JSON.stringify(result)}`);
      }

    } catch (error) {
      this.logger.error(`Error placing order: ${error}`);
      throw error;
    }
  }

  // Direct implementation of transferSpotToken using API (SDK transfer has timeout issues)
  private async transferSpotToken(
    tokenSymbol: string,
    destination: string,
    amount: string,
    privateKey?: string
  ): Promise<any> {
    try {
      const key = privateKey || this.configService.get('HYPERLIQUID_PRIVATE_KEY');
      if (!key) {
        throw new Error("Private key not provided");
      }

      const wallet = new ethers.Wallet(key);
      const senderAddress = wallet.address;

      this.logger.log(`Transferring ${amount} ${tokenSymbol} from ${senderAddress} to ${destination}`);

      // Token configurations with IDs for transfer
      const tokenConfigs: Record<string, { name: string; tokenId: string }> = {
        HYPE: { name: "HYPE", tokenId: "0x0d01dc56dcaaca66ad901c959b4011ec" },
        PUP: { name: "PUP", tokenId: "0x4b0374cc43f5bd8b1e9a32cbec1c97e0a6ad4bfc" },
        PURR: { name: "PURR", tokenId: "0xc1fb593aeffbeb02f85e0308e9956a90" },
        USDC: { name: "USDC", tokenId: "0x6d1e7cde53ba9467b783cb7c530ce054" }
      };

      const tokenInfo = tokenConfigs[tokenSymbol.toUpperCase()];
      if (!tokenInfo) {
        throw new Error(`Token ${tokenSymbol} not configured for transfer`);
      }

      // Prepare action
      const timestamp = Date.now();
      const action = {
        type: "spotSend",
        hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
        signatureChainId: "0xa4b1", // Arbitrum chain ID
        destination: destination.toLowerCase(),
        token: `${tokenInfo.name}:${tokenInfo.tokenId}`,
        amount: amount,
        time: timestamp
      };

      // Generate EIP-712 signature
      const types = {
        "HyperliquidTransaction:SpotSend": [
          { name: "hyperliquidChain", type: "string" },
          { name: "destination", type: "string" },
          { name: "token", type: "string" },
          { name: "amount", type: "string" },
          { name: "time", type: "uint64" }
        ]
      };

      const domain = {
        name: "HyperliquidSignTransaction",
        version: "1",
        chainId: parseInt(action.signatureChainId, 16),
        verifyingContract: "0x0000000000000000000000000000000000000000"
      };

      const value = {
        hyperliquidChain: action.hyperliquidChain,
        destination: action.destination,
        token: action.token,
        amount: action.amount,
        time: action.time
      };

      const signature = await wallet.signTypedData(domain, types, value);
      const sig = ethers.Signature.from(signature);

      // Prepare request
      const request = {
        action,
        nonce: timestamp,
        signature: {
          r: sig.r,
          s: sig.s,
          v: sig.v
        }
      };

      // Send request
      this.logger.log('Submitting transfer...');
      const apiUrl = this.isTestnet
        ? 'https://api.hyperliquid-testnet.xyz/exchange'
        : 'https://api.hyperliquid.xyz/exchange';

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
      });

      const result = await response.json();

      if (result.status === "ok") {
        this.logger.log(`Successfully transferred ${amount} ${tokenSymbol} to ${destination}`);
      } else {
        throw new Error(`Transfer failed: ${result.response?.error || JSON.stringify(result)}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`Transfer error: ${error}`);
      throw error;
    }
  }

  // Helper function to round price to tick size
  private roundToTickSize(price: number, tickDecimals: number): number {
    const tickSize = Math.pow(10, -tickDecimals);
    return Math.round(price / tickSize) * tickSize;
  }



  private connect(): void {
    this.isFirstMessage = true;
    
    const wsUrl = this.isTestnet 
      ? 'wss://api.hyperliquid-testnet.xyz/ws'
      : 'wss://api.hyperliquid.xyz/ws';
    
    this.logger.log(`Connecting to: ${wsUrl}`);
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.on('open', () => {
      this.logger.log('WebSocket connection established');
      this.subscribeToUserNonFundingLedgerUpdates();
      this.startHeartbeat();
    });
    
    this.ws.on('message', (data: Buffer) => {
      this.handleMessage(data.toString());
    });
    
    this.ws.on('error', (error: Error) => {
      this.logger.error(`WebSocket error: ${error.message}`);
    });
    
    this.ws.on('close', () => {
      this.logger.log('WebSocket connection closed');
      this.stopHeartbeat();
      if (this.isMonitoring) {
        this.attemptReconnect();
      }
    });
  }

  private subscribeToUserNonFundingLedgerUpdates(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.logger.error('WebSocket is not connected');
      return;
    }
    
    const subscriptionMessage: SubscriptionMessage = {
      method: 'subscribe',
      subscription: {
        type: 'userNonFundingLedgerUpdates',
        user: this.userAddress,
      },
    };
    
    this.logger.log('Subscribing to userNonFundingLedgerUpdates...');
    this.ws.send(JSON.stringify(subscriptionMessage));
  }

  private async handleMessage(message: string): Promise<void> {
    try {
      const data = JSON.parse(message);
      
      if (data.channel === 'subscriptionResponse') {
        this.logger.log('Subscription confirmed');
        return;
      }
      
      if (data.channel === 'pong') {
        return;
      }
      
      if (data.channel === 'userNonFundingLedgerUpdates') {
        await this.processLedgerUpdates(data.data);
        return;
      }
      
    } catch (error) {
      this.logger.error(`Error parsing message: ${error}`);
    }
  }

  private async processLedgerUpdates(data: WsUserNonFundingLedgerUpdates): Promise<void> {
    if (data.isSnapshot || this.isFirstMessage) {
      if (this.isFirstMessage) {
        this.logger.log('Skipping initial snapshot/historical data...');
        this.isFirstMessage = false;
      }
      return;
    }
    
    const updates = data.updates || data.nonFundingLedgerUpdates;
    if (!updates || updates.length === 0) {
      return;
    }
    
    for (const update of updates) {
      if (update.time < this.systemStartTime) {
        continue;
      }
      
      const delta = update.delta;
      
      if (delta.type === 'spotTransfer') {
        const spotTransfer = delta as WsSpotTransfer;
        
        if (spotTransfer.token === 'USDC' && 
            spotTransfer.destination.toLowerCase() === this.userAddress.toLowerCase()) {
          
          if (spotTransfer.nonce && this.processedNonces.has(spotTransfer.nonce)) {
            continue;
          }
          
          const transferId = `${spotTransfer.user}_${spotTransfer.amount}_${update.time}`;
          if (this.processingTransfers.has(transferId)) {
            continue;
          }
          
          if (spotTransfer.nonce) {
            this.processedNonces.add(spotTransfer.nonce);
            
            if (this.processedNonces.size > 100) {
              const noncesArray = Array.from(this.processedNonces);
              this.processedNonces = new Set(noncesArray.slice(-100));
            }
          }
          
          this.processingTransfers.add(transferId);
          await this.handleUsdcReceived(spotTransfer, update);
          this.processingTransfers.delete(transferId);
        }
      }
    }
  }

  private async handleUsdcReceived(transfer: WsSpotTransfer, update: WsUserNonFundingLedgerUpdate): Promise<void> {
    const amount = parseFloat(transfer.amount);
    const senderAddress = transfer.user;
    const date = new Date(update.time);
    
    this.logger.log(`USDC Received: ${amount} from ${senderAddress}`);
    
    const transaction: TransactionDto = {
      id: `auto_${update.time}`,
      timestamp: date,
      from: senderAddress,
      to: this.userAddress,
      usdcAmount: amount,
      hypeAmount: '0',
      hash: update.hash,
      status: 'pending',
    };
    
    this.transactions.push(transaction);
    
    if (amount < this.minOrderAmount) {
      this.logger.warn(`Amount ${amount} below minimum ${this.minOrderAmount}`);
      transaction.status = 'failed';
      transaction.error = 'Amount below minimum';
      return;
    }
    
    try {
      this.logger.log(`Buying ${this.targetCoin} with ${amount} USDC...`);
      const orderResult = await this.placeSpotMarketOrder(
        this.targetCoin,
        amount,
        true,
        this.slippagePercent
      );
      
      let actualHypeAmount = '0';
      if (orderResult && orderResult.filledQuantity) {
        actualHypeAmount = orderResult.filledQuantity.toString();
      } else {
        const estimatedPrice = 55;
        const estimatedQuantity = (amount / estimatedPrice * 0.98);
        actualHypeAmount = estimatedQuantity.toFixed(4);
      }
      
      transaction.hypeAmount = actualHypeAmount;
      
      await new Promise(resolve => setTimeout(resolve, this.transferDelayMs));
      
      this.logger.log(`Transferring ${actualHypeAmount} ${this.targetCoin} to ${senderAddress}...`);
      const privateKey = this.configService.get('HYPERLIQUID_PRIVATE_KEY');
      await this.transferSpotToken(
        this.targetCoin,
        senderAddress,
        actualHypeAmount,
        privateKey
      );
      
      transaction.status = 'completed';
      this.logger.log(`Auto-process completed: ${amount} USDC -> ${actualHypeAmount} ${this.targetCoin} -> ${senderAddress}`);
      
    } catch (error) {
      transaction.status = 'failed';
      transaction.error = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Auto-process failed: ${error}`);
    }
  }

  private startHeartbeat(): void {
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
      return;
    }
    
    this.logger.log('Attempting to reconnect in 5 seconds...');
    this.reconnectInterval = setTimeout(() => {
      this.reconnectInterval = null;
      this.connect();
    }, 5000);
  }

  private disconnect(): void {
    this.logger.log('Disconnecting Auto-Process System...');
    
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