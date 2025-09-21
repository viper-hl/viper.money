/**
 * Get Hyperliquid Spot Token Information
 * Retrieves token metadata including token IDs
 */

interface SpotMeta {
  universe: Array<{
    name: string;
    szDecimals: number;
    weiDecimals: number;
    index: number;
    tokenId: string;
    evmContract?: string;
  }>;
  tokens: Array<{
    name: string;
    index: number;
    tokenId: string;
  }>;
}

async function getSpotTokenInfo(): Promise<void> {
  try {
    // Get spot meta information
    const metaResponse = await fetch("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "spotMeta"
      })
    });

    if (!metaResponse.ok) {
      throw new Error(`Failed to fetch spot meta: ${metaResponse.status}`);
    }

    const spotMeta = await metaResponse.json() as any;
    
    console.log("=== Raw Spot Meta Response ===");
    console.log(JSON.stringify(spotMeta, null, 2).substring(0, 5000));
    
    // Check tokens array
    if (spotMeta.tokens && Array.isArray(spotMeta.tokens)) {
      console.log("\n=== Tokens Array ===");
      spotMeta.tokens.forEach((token: any, idx: number) => {
        if (token.name === "HYPE" || token.name === "USDC" || token.name === "PURR") {
          console.log(`${token.name}: Index=${idx}, Details=${JSON.stringify(token)}`);
        }
      });
    }
    
    // Also check if the tokens are indexed by number
    console.log("\n=== Looking for specific tokens ===");
    const hype = spotMeta.tokens?.find((t: any) => t.name === "HYPE");
    const usdc = spotMeta.tokens?.find((t: any) => t.name === "USDC");
    const purr = spotMeta.tokens?.find((t: any) => t.name === "PURR");
    
    console.log("HYPE:", hype);
    console.log("USDC:", usdc);
    console.log("PURR:", purr);
    
  } catch (error) {
    console.error("Error fetching token info:", error);
  }
}

// Run the function
getSpotTokenInfo();