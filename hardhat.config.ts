import { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config"; // This line loads the variables from your .env file

// Read variables directly from process.env, providing safe fallbacks
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org"; // Public fallback
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: "0.8.28",
  verify: {
    etherscan: {
      apiKey: ETHERSCAN_API_KEY,
    },
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
    },
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      type: "http",
      url: SEPOLIA_RPC_URL,
      accounts: SEPOLIA_PRIVATE_KEY !== "" ? [SEPOLIA_PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
};

export default config;

