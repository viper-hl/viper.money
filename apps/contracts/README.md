# Viper Money Smart Contracts

This package contains the smart contracts for the Viper Money platform built with Hardhat.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Copy the example environment file and configure:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
   - `PRIVATE_KEY`: Your wallet private key for deployments
   - `ALCHEMY_API_KEY`: Your Alchemy API key for RPC access
   - `ETHERSCAN_API_KEY`: Your Etherscan API key for contract verification
   - Other API keys as needed

## Commands

### Compile Contracts
```bash
pnpm compile
```

### Run Tests
```bash
pnpm test
```

### Run Tests with Coverage
```bash
pnpm test:coverage
```

### Start Local Node
```bash
pnpm node
```

### Deploy Contracts

Deploy to local network:
```bash
pnpm deploy:localhost
```

Deploy to specific network:
```bash
pnpm hardhat run scripts/deploy.ts --network <network-name>
```

### Deploy with Ignition
```bash
pnpm hardhat ignition deploy ignition/modules/Lock.ts --network <network-name>
```

### Verify Contracts
```bash
pnpm hardhat verify --network <network-name> <contract-address> <constructor-args>
```

### Gas Report
```bash
REPORT_GAS=true pnpm test
```

### Clean
```bash
pnpm clean
```

## Project Structure

```
contracts/
├── contracts/          # Solidity contracts
├── scripts/           # Deployment scripts
├── test/              # Test files
├── ignition/          # Ignition deployment modules
└── typechain-types/   # Generated TypeScript types
```

## Networks

Configured networks:
- `hardhat` - Local Hardhat network
- `localhost` - Local node (run with `pnpm node`)
- `ethereum` - Ethereum Mainnet
- `sepolia` - Ethereum Testnet
- `polygon` - Polygon Mainnet
- `mumbai` - Polygon Testnet
- `arbitrum` - Arbitrum One
- `optimism` - Optimism Mainnet
- `bsc` - Binance Smart Chain
- `bscTestnet` - BSC Testnet

## Testing

Tests are written using Hardhat's testing framework with Chai matchers. Example test structure:

```typescript
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("ContractName", function () {
  async function deployFixture() {
    // Deploy and return contract instances
  }

  it("Should do something", async function () {
    const { contract } = await loadFixture(deployFixture);
    // Test logic
  });
});
```

## Security

- Never commit your `.env` file
- Use hardware wallets for mainnet deployments
- Always test on testnets before mainnet deployment
- Run security audits before production deployment

## License

UNLICENSED
