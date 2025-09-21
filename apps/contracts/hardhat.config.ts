import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config();

// TODO: Replace with your actual private key and API keys
const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 999,
      forking:
        process.env.FORK_ENABLED === "true"
          ? {
              url: "https://hlh-builders-jp-mainnet.hyperpc.app?use-upstream=hlnode",
              blockNumber: process.env.FORK_BLOCK_NUMBER
                ? parseInt(process.env.FORK_BLOCK_NUMBER)
                : undefined,
            }
          : undefined,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 999,
    },
    hyperevm: {
      url: "https://hlh-builders-jp-mainnet.hyperpc.app?use-upstream=hlnode",
      accounts: [PRIVATE_KEY],
      chainId: 999,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    outputFile: "gas-report.txt",
    noColors: true,
  },
  etherscan: {
    apiKey: {
      hyperevm: ETHERSCAN_API_KEY,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};

export default config;
