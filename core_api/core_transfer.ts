/**
 * Hyperliquid Core Spot Transfer Module
 * Enables transferring various tokens from Core to different wallets
 */

import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { getSpotBalances } from '../core_evm_transfer/core_balance';

// Load environment variables
dotenv.config();

// ===== Type Definitions =====

interface SpotSendAction {
  type: "spotSend";
  hyperliquidChain: "Mainnet" | "Testnet";
  signatureChainId: string;
  destination: string;
  token: string; // Format: "TOKEN_NAME:TOKEN_ID"
  amount: string;
  time: number;
}

interface SpotSendRequest {
  action: SpotSendAction;
  nonce: number;
  signature: {
    r: string;
    s: string;
    v: number;
  };
}

interface ApiResponse {
  status: "ok" | "error";
  response: {
    type: string;
    data?: any;
    error?: string;
  };
}

interface TokenInfo {
  name: string;
  tokenId: string;
  decimals: number;
  minAmount?: string;
}

// Common token configurations (can be expanded)
const TOKENS: Record<string, TokenInfo> = {
  HYPE: {
    name: "HYPE",
    tokenId: "0x0d01dc56dcaaca66ad901c959b4011ec", // HYPE token ID
    decimals: 8,
    minAmount: "0.001"
  },
  USDC: {
    name: "USDC",
    tokenId: "0x6d1e7cde53ba9467b783cb7c530ce054", // USDC token ID
    decimals: 8,
    minAmount: "0.01"
  },
  PURR: {
    name: "PURR",
    tokenId: "0xc1fb593aeffbeb02f85e0308e9956a90", // PURR token ID
    decimals: 5,
    minAmount: "0.001"
  }
  // Add more tokens as needed
};

// ===== Main Transfer Function =====

/**
 * Transfer spot tokens from Core to another address
 * @param tokenSymbol - Token symbol (e.g., "HYPE", "USDC", "PURR")
 * @param destination - Destination address (42-character hex string)
 * @param amount - Amount to send as string
 * @param privateKey - Private key for signing (optional, defaults to env)
 * @returns Transaction result
 */
export async function transferSpotToken(
  tokenSymbol: string,
  destination: string,
  amount: string,
  privateKey?: string
): Promise<ApiResponse> {
  try {
    // Validate inputs
    validateTransferParams(destination, amount, tokenSymbol);

    // Get token info
    const tokenInfo = TOKENS[tokenSymbol.toUpperCase()];
    if (!tokenInfo) {
      throw new Error(`Token ${tokenSymbol} not configured. Available tokens: ${Object.keys(TOKENS).join(", ")}`);
    }

    // Use provided key or from environment
    const key = privateKey || process.env.PRIVATE_KEY;
    if (!key) {
      throw new Error("Private key not provided and not found in environment variables");
    }

    const wallet = new ethers.Wallet(key);
    const senderAddress = wallet.address;

    // Check balance before transfer
    console.log(`Checking balance for ${senderAddress}...`);
    const balances = await getSpotBalances(senderAddress);
    const tokenBalance = balances.find(b => b.coin === tokenInfo.name);
    
    if (!tokenBalance || parseFloat(tokenBalance.total) < parseFloat(amount)) {
      throw new Error(`Insufficient ${tokenInfo.name} balance. Available: ${tokenBalance?.total || "0"}, Required: ${amount}`);
    }

    // Prepare action
    const timestamp = Date.now();
    const action: SpotSendAction = {
      type: "spotSend",
      hyperliquidChain: process.env.NETWORK === "testnet" ? "Testnet" : "Mainnet",
      signatureChainId: "0xa4b1", // Arbitrum chain ID
      destination: destination.toLowerCase(),
      token: `${tokenInfo.name}:${tokenInfo.tokenId}`,
      amount: amount,
      time: timestamp
    };

    // Generate signature
    const signature = await generateSpotSendSignature(wallet, action);

    // Prepare request
    const request: SpotSendRequest = {
      action,
      nonce: timestamp,
      signature
    };

    // Send request
    console.log(`Transferring ${amount} ${tokenInfo.name} to ${destination}...`);
    console.log("Request payload:", JSON.stringify(request, null, 2));
    const response = await sendTransferRequest(request);
    
    console.log("API Response:", JSON.stringify(response, null, 2));
    
    if (response.status === "ok") {
      console.log(`Successfully transferred ${amount} ${tokenInfo.name} to ${destination}`);
    } else {
      console.error("Transfer failed:", response.response?.error || response);
    }

    return response;
  } catch (error) {
    console.error("Transfer error:", error);
    throw error;
  }
}

// ===== Signature Generation =====

/**
 * Generate EIP-712 signature for spot send
 * @param wallet - Ethers wallet instance
 * @param action - SpotSend action object
 * @returns Signature components
 */
async function generateSpotSendSignature(
  wallet: ethers.Wallet,
  action: SpotSendAction
): Promise<{ r: string; s: string; v: number }> {
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

  return {
    r: sig.r,
    s: sig.s,
    v: sig.v
  };
}

// ===== API Communication =====

/**
 * Send transfer request to Hyperliquid API
 * @param request - Transfer request object
 * @returns API response
 */
async function sendTransferRequest(request: SpotSendRequest): Promise<ApiResponse> {
  const apiUrl = "https://api.hyperliquid.xyz/exchange";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    return await response.json() as ApiResponse;
  } catch (error) {
    throw new Error(`Failed to send transfer request: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// ===== Helper Functions =====

/**
 * Validate transfer parameters
 * @param destination - Destination address
 * @param amount - Transfer amount
 * @param tokenSymbol - Token symbol
 */
function validateTransferParams(destination: string, amount: string, tokenSymbol: string): void {
  // Validate destination address
  if (!destination.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error("Invalid destination address format. Expected 42-character hex string starting with 0x");
  }

  // Validate amount
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error("Invalid amount. Must be a positive number");
  }

  // Check minimum amount if configured
  const tokenInfo = TOKENS[tokenSymbol.toUpperCase()];
  if (tokenInfo?.minAmount && amountNum < parseFloat(tokenInfo.minAmount)) {
    throw new Error(`Amount ${amount} is below minimum ${tokenInfo.minAmount} for ${tokenSymbol}`);
  }
}

/**
 * Get list of available tokens for transfer
 * @returns Array of token information
 */
export function getAvailableTokens(): TokenInfo[] {
  return Object.values(TOKENS);
}

/**
 * Format token amount with proper decimals
 * @param amount - Raw amount
 * @param decimals - Number of decimals
 * @returns Formatted amount string
 */
export function formatTokenAmount(amount: number | string, decimals: number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num.toFixed(decimals);
}

/**
 * Batch transfer tokens to multiple addresses
 * @param transfers - Array of transfer configurations
 * @returns Array of results
 */
export async function batchTransferTokens(
  transfers: Array<{
    tokenSymbol: string;
    destination: string;
    amount: string;
  }>,
  privateKey?: string
): Promise<ApiResponse[]> {
  const results: ApiResponse[] = [];
  
  for (const transfer of transfers) {
    try {
      console.log(`\nProcessing transfer ${transfers.indexOf(transfer) + 1}/${transfers.length}`);
      const result = await transferSpotToken(
        transfer.tokenSymbol,
        transfer.destination,
        transfer.amount,
        privateKey
      );
      results.push(result);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to transfer ${transfer.amount} ${transfer.tokenSymbol} to ${transfer.destination}:`, error);
      results.push({
        status: "error",
        response: {
          type: "error",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });
    }
  }
  
  return results;
}

// ===== Example Usage =====

/**
 * Example function demonstrating how to use the transfer functions
 */
/**
 * Get token balance for a specific token
 * @param address - User address
 * @param tokenSymbol - Token symbol
 * @returns Token balance or null if not found
 */
export async function getTokenBalance(address: string, tokenSymbol: string): Promise<string | null> {
  try {
    const balances = await getSpotBalances(address);
    const tokenInfo = TOKENS[tokenSymbol.toUpperCase()];
    if (!tokenInfo) return null;
    
    const balance = balances.find(b => b.coin === tokenInfo.name);
    return balance ? balance.total : "0";
  } catch (error) {
    console.error(`Error getting ${tokenSymbol} balance:`, error);
    return null;
  }
}

/**
 * Add custom token configuration
 * @param symbol - Token symbol
 * @param tokenInfo - Token information
 */
export function addToken(symbol: string, tokenInfo: TokenInfo): void {
  TOKENS[symbol.toUpperCase()] = tokenInfo;
}

async function exampleUsage() {
  try {
    // Load private key from environment
    const privateKey = process.env.HYPERLIQUID_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("Please set HYPERLIQUID_PRIVATE_KEY in your .env file");
    }

    const wallet = new ethers.Wallet(privateKey);
    const myAddress = wallet.address;

    // Example 1: Check balances
    console.log("=== Checking Balances ===");
    console.log(`Address: ${myAddress}`);
    
    for (const tokenSymbol of ["HYPE", "USDC", "PURR"]) {
      const balance = await getTokenBalance(myAddress, tokenSymbol);
      console.log(`${tokenSymbol} Balance: ${balance || "0"}`);
    }

    // Example 2: Single token transfer
    console.log("\n=== Single Transfer Example ===");
    const destinationAddress = "0x4e5aD93D5B73d2F3821960778a61eea2Df408632";
    const transferAmount = "0.001"; // Small test amount
    
    const hypeBalance = await getTokenBalance(myAddress, "HYPE");
    if (hypeBalance && parseFloat(hypeBalance) >= parseFloat(transferAmount)) {
      await transferSpotToken("HYPE", destinationAddress, transferAmount, privateKey);
      console.log(`Successfully transferred ${transferAmount} HYPE`);
    } else {
      console.log(`Insufficient HYPE balance for transfer. Available: ${hypeBalance}`);
    }

    // Example 3: Show available tokens
    console.log("\n=== Available Tokens ===");
    const tokens = getAvailableTokens();
    tokens.forEach(token => {
      console.log(`- ${token.name}: Token ID ${token.tokenId.substring(0, 10)}..., Decimals: ${token.decimals}`);
    });

    // Example 4: Batch transfers (commented out for safety)
    // console.log("\n=== Batch Transfer Example ===");
    // const batchTransfers = [
    //   { tokenSymbol: "USDC", destination: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1", amount: "0.1" },
    //   { tokenSymbol: "HYPE", destination: "0x4e5aD93D5B73d2F3821960778a61eea2Df408632", amount: "0.001" }
    // ];
    
    // const results = await batchTransferTokens(batchTransfers, privateKey);
    // console.log("Batch transfer results:", results.map(r => r.status));

  } catch (error) {
    console.error("Example failed:", error);
  }
}

// Export types for external use
export type { SpotSendAction, SpotSendRequest, ApiResponse, TokenInfo };

// Uncomment to run example
exampleUsage();