/**
 * Check tick size for HYPE spot trading
 */

import { Hyperliquid } from 'hyperliquid';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkTickSize() {
  try {
    const sdk = new Hyperliquid({
      privateKey: process.env.HYPERLIQUID_PRIVATE_KEY!,
      testnet: false,
      enableWs: false
    });

    // Get spot metadata
    console.log('Fetching spot metadata...\n');
    const spotMeta = await sdk.info.spot.getSpotMeta();
    
    if (spotMeta && spotMeta.tokens) {
      // Find HYPE token
      const hypeToken = spotMeta.tokens.find((token: any) => 
        token.name === 'HYPE' || token.name === 'HYPE-SPOT'
      );
      
      if (hypeToken) {
        console.log('HYPE Token Information:');
        console.log('=======================');
        console.log('Name:', hypeToken.name);
        console.log('Index:', hypeToken.index);
        console.log('Token ID:', hypeToken.tokenId);
        console.log('Size Decimals:', hypeToken.szDecimals);
        console.log('Wei Decimals:', hypeToken.weiDecimals);
        console.log('Full Details:', JSON.stringify(hypeToken, null, 2));
      } else {
        console.log('HYPE token not found in spot metadata');
        
        // List all available spot tokens
        console.log('\nAvailable spot tokens:');
        spotMeta.tokens.forEach((token: any) => {
          console.log(`- ${token.name} (index: ${token.index})`);
        });
      }
    }

    // Get universe info for more details
    console.log('\nFetching universe info...');
    const universeInfo = await sdk.info.spot.getSpotMetaAndAssetCtxs();
    
    if (universeInfo && universeInfo[0] && universeInfo[0].universe) {
      const hypeInfo = universeInfo[0].universe.find((asset: any) => 
        asset.name === 'HYPE'
      );
      
      if (hypeInfo) {
        console.log('\nHYPE Universe Information:');
        console.log('=========================');
        console.log('Name:', hypeInfo.name);
        console.log('Full Universe Info:', JSON.stringify(hypeInfo, null, 2));
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkTickSize();