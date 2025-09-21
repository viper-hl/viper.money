/**
 * Hyperliquid Spot Market Order - Simplified Version
 * Using Hyperliquid SDK with proper symbol formatting
 */

import { Hyperliquid } from 'hyperliquid';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Hardcoded price tick sizes for specific tokens
// The number represents decimal places for tick size
const PRICE_TICK_SIZES: { [key: string]: number } = {
  'HYPE': 3,    
  'PUP': 5,    
  'PURR': 5,    
  'SOL': 2,
  'BTC': 0,
  'ETH': 1
};

/**
 * Round price to match tick size requirements
 * @param price - Original price
 * @param tickDecimals - Number of decimal places for tick size
 * @returns Rounded price that matches tick size
 */
function roundToTickSize(price: number, tickDecimals: number): number {
  const tickSize = Math.pow(10, -tickDecimals);
  return Math.round(price / tickSize) * tickSize;
}

/**
 * Place a spot market order using Hyperliquid SDK
 * @param symbol - Token symbol (e.g., 'HYPE', 'SOL', 'BTC')
 * @param usdAmount - Amount in USD to trade
 * @param isBuy - true for buy, false for sell
 * @param slippagePercent - Slippage tolerance (default 5%)
 */
export async function placeSpotMarketOrder(
  symbol: string,
  usdAmount: number,
  isBuy: boolean = true,
  slippagePercent: number = 5
): Promise<any> {
  
  if (!process.env.HYPERLIQUID_PRIVATE_KEY) {
    throw new Error('HYPERLIQUID_PRIVATE_KEY not found in environment variables');
  }
  
  if (usdAmount <= 0) {
    throw new Error('USD amount must be greater than 0');
  }

  console.log('=================================');
  console.log(`   ${symbol} Spot Market Order`);
  console.log('=================================\n');
  console.log(`Type: ${isBuy ? 'BUY' : 'SELL'}`);
  console.log(`Amount: $${usdAmount} USD`);
  console.log(`Slippage: ${slippagePercent}%\n`);

  try {
    // Initialize SDK
    const sdk = new Hyperliquid({
      privateKey: process.env.HYPERLIQUID_PRIVATE_KEY,
      testnet: false,
      enableWs: false
    });

    // Step 1: Create spot symbol
    // SDK automatically handles symbol conversion
    const spotSymbol = `${symbol.toUpperCase()}-SPOT`;
    console.log(`Step 1: Using symbol: ${spotSymbol}\n`);

    // Step 2: Get spot balances using the correct API method
    console.log('Step 2: Checking balance...');
    // Get wallet address from private key
    const { ethers } = await import('ethers');
    const wallet = new ethers.Wallet(process.env.HYPERLIQUID_PRIVATE_KEY);
    const walletAddress = wallet.address;
    console.log(`Wallet: ${walletAddress}`);
    
    // Import core balance functions
    const { getSpotBalances, getNonZeroBalances } = await import('../core_evm_transfer/core_balance');
    
    try {
      // Get balances using the core_balance module
      const balances = await getSpotBalances(walletAddress);
      const nonZeroBalances = getNonZeroBalances(balances);
      
      console.log('Available balances:');
      nonZeroBalances.forEach(balance => {
        // Display USDT0 as USDT
        const coinName = balance.coin === 'USDT0' ? 'USDT' : balance.coin;
        const balanceNum = parseFloat(balance.total);
        if (balanceNum > 0.000001) {
          console.log(`  ${coinName}: ${balanceNum < 1 ? balance.total : balanceNum.toFixed(6)}`);
        }
      });
      
      if (isBuy) {
        // Check USDC balance for buy orders
        const usdcBalance = balances.find(b => b.coin === 'USDC');
        const usdcAmount = usdcBalance ? parseFloat(usdcBalance.total) : 0;
        
        if (usdcAmount < usdAmount) {
          console.log(`\n❌ Insufficient USDC balance`);
          console.log(`Required: $${usdAmount}`);
          console.log(`Available: $${usdcAmount.toFixed(6)}`);
          throw new Error(`Insufficient USDC balance. Required: $${usdAmount}, Available: $${usdcAmount.toFixed(6)}`);
        }
        console.log(`\n✅ USDC balance: $${usdcAmount.toFixed(6)} (sufficient)\n`);
      } else {
        // Check token balance for sell orders
        const tokenToCheck = symbol.toUpperCase() === 'USDT' ? 'USDT0' : symbol.toUpperCase();
        const tokenBalance = balances.find(b => b.coin === tokenToCheck);
        
        if (!tokenBalance || parseFloat(tokenBalance.total) === 0) {
          throw new Error(`No ${symbol} balance found in spot account`);
        }
        console.log(`\n✅ ${symbol} balance: ${tokenBalance.total}\n`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Insufficient')) {
        throw error;
      }
      console.log('\n⚠️ Could not fetch spot balances, account might not exist on Hyperliquid');
      console.log('Please ensure you have deposited funds to this wallet first\n');
      throw new Error('Failed to fetch spot balances');
    }

    // Step 3: Get spot metadata for decimals
    console.log('Step 3: Getting market info...');
    const spotMeta = await sdk.info.spot.getSpotMeta();
    
    let decimals = 2; // default
    if (spotMeta && spotMeta.tokens) {
      const token = spotMeta.tokens.find((t: any) => 
        t.name === symbol.toUpperCase() || 
        t.name === spotSymbol
      );
      if (token) {
        decimals = token.szDecimals || 2;
        console.log(`Token: ${token.name}, Decimals: ${decimals}`);
      }
    }

    // Step 4: Get current price
    console.log('\nStep 4: Fetching current price...');
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
      // List available spot symbols for debugging
      console.log('Available spot symbols:');
      Object.keys(allMids)
        .filter(k => k.includes(symbol.toUpperCase()) || k.includes('SPOT') || k.includes('/'))
        .forEach(k => console.log(`  ${k}: $${allMids[k]}`));
      
      throw new Error(`No price data found for ${symbol}`);
    }
    
    console.log(`Current price for ${actualSymbol}: $${currentPrice.toFixed(4)}\n`);

    // Step 5: Calculate order parameters
    console.log('Step 5: Calculating order parameters...');
    
    // Calculate quantity
    const rawQuantity = usdAmount / currentPrice;
    const quantityTickSize = Math.pow(10, -decimals);
    const orderQuantity = Math.floor(rawQuantity / quantityTickSize) * quantityTickSize;
    
    // Calculate price with slippage
    const slippage = slippagePercent / 100;
    const rawOrderPrice = isBuy 
      ? currentPrice * (1 + slippage)
      : currentPrice * (1 - slippage);
    
    // Apply tick size rounding if available
    const tickDecimals = PRICE_TICK_SIZES[symbol.toUpperCase()];
    const orderPrice = tickDecimals 
      ? roundToTickSize(rawOrderPrice, tickDecimals)
      : rawOrderPrice;
    
    console.log(`Order quantity: ${orderQuantity.toFixed(decimals)} ${symbol}`);
    console.log(`Order price: $${orderPrice.toFixed(tickDecimals || 4)}`);
    if (tickDecimals) {
      console.log(`Price tick size: ${tickDecimals} decimals (${Math.pow(10, -tickDecimals)})`);
    }
    console.log(`Estimated total: $${(orderQuantity * currentPrice).toFixed(2)}\n`);
    
    // Validate quantity
    if (orderQuantity === 0) {
      throw new Error(`Order quantity too small. Minimum: ${quantityTickSize} ${symbol}`);
    }
    
    // Check minimum order value (10 USDC)
    const estimatedValue = orderQuantity * currentPrice;
    if (estimatedValue < 10) {
      console.log(`⚠️ Warning: Estimated order value $${estimatedValue.toFixed(2)} is below the minimum of $10 USDC`);
      console.log(`  The order may be rejected by Hyperliquid`);
    }

    // Step 6: Place order
    console.log('Step 6: Placing order...');
    
    // Use the symbol that worked for price lookup
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
    
    console.log('Order details:', {
      coin: orderRequest.coin,
      is_buy: orderRequest.is_buy,
      sz: orderRequest.sz,
      limit_px: orderRequest.limit_px.toFixed(tickDecimals || 4),
      order_type: 'IOC (market)'
    });
    console.log('\nSubmitting order...\n');
    
    const result = await sdk.exchange.placeOrder(orderRequest);

    // Step 7: Process result
    console.log('Step 7: Processing result...');
    
    if (result.status === 'ok') {
      console.log('\n✅ ORDER SUCCESS!\n');
      
      const response = result.response;
      if (response?.type === 'order' && response?.data) {
        const orderData = response.data;
        
        if (orderData.statuses && orderData.statuses.length > 0) {
          const status = orderData.statuses[0];
          
          if (status.filled) {
            console.log('💰 Order FILLED!');
            const filledQuantity = status.filled.totalSz || orderQuantity;
            console.log(`Filled quantity: ${filledQuantity} ${symbol}`);
            console.log(`Average price: $${status.filled.avgPx || 'N/A'}`);
            
            if (status.filled.avgPx && status.filled.totalSz) {
              const totalCost = parseFloat(status.filled.avgPx) * parseFloat(status.filled.totalSz);
              console.log(`Total cost: $${totalCost.toFixed(2)}`);
            }
            
            // Add filled quantity to result for external use
            result.filledQuantity = filledQuantity;
            result.avgPrice = status.filled.avgPx;
          } else if (status.resting) {
            console.log('📋 Order placed (resting)');
            console.log(`Order ID: ${status.resting.oid}`);
          } else if (status.error) {
            console.error('❌ Order error:', status.error);
          } else {
            console.log('Order status:', JSON.stringify(status, null, 2));
          }
        }
      }
      
      return result;
    } else {
      throw new Error(`Order failed: ${JSON.stringify(result)}`);
    }

  } catch (error) {
    console.error('\n❌ Error placing order:');
    
    if (error instanceof Error) {
      console.error(error.message);
      
      // Helpful error messages
      if (error.message.includes('balance')) {
        console.log('\n💡 Solution: Check your USDC balance in the Spot account');
      } else if (error.message.includes('does not exist')) {
        console.log('\n💡 Solution: Make sure you have deposited funds to this wallet on Hyperliquid');
        console.log('   You need to deposit USDC to your spot account first');
      } else if (error.message.includes('signature')) {
        console.log('\n💡 Solution: Verify your private key in the .env file');
      } else if (error.message.includes('rate')) {
        console.log('\n💡 Solution: Wait a moment and try again');
      } else if (error.message.includes('No price data')) {
        console.log('\n💡 Solution: This token may not be available for spot trading');
        console.log('   Try a different token or check if it\'s listed on Hyperliquid');
      } else if (error.message.includes('minimum value of 10 USDC')) {
        console.log('\n💡 Solution: Increase the order amount to at least $10 USDC');
        console.log('   Hyperliquid requires a minimum order value of $10');
      } else if (error.message.includes('tick size')) {
        console.log('\n💡 Solution: Price tick size issue detected');
        console.log('   The price has been adjusted automatically, but if the error persists,');
        console.log('   please check the tick size requirements for this token');
      }
    } else {
      console.error(error);
    }
    
    throw error;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: ts-node spot_market_order_simple.ts <symbol> <usd_amount> [buy|sell] [slippage]');
    console.log('\nExamples:');
    console.log('  ts-node spot_market_order_simple.ts HYPE 20');
    console.log('  ts-node spot_market_order_simple.ts SOL 100 buy 3');
    console.log('  ts-node spot_market_order_simple.ts PURR 50 sell');
    console.log('\nNote: Make sure you have USDC in your spot account for buy orders');
    process.exit(1);
  }
  
  const symbol = args[0];
  const usdAmount = parseFloat(args[1]);
  const isBuy = args[2] !== 'sell';
  const slippage = args[3] ? parseFloat(args[3]) : 5;
  
  if (isNaN(usdAmount) || usdAmount <= 0) {
    console.error('Error: USD amount must be a positive number');
    process.exit(1);
  }
  
  placeSpotMarketOrder(symbol, usdAmount, isBuy, slippage)
    .then(() => {
      console.log('\n✨ Order completed successfully!');
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}