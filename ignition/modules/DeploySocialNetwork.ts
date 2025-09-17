import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// This is the deployment module for our entire social network.
const DeploySocialNetworkModule = buildModule(
  "DeploySocialNetworkModule",
  (m) => {
    // --- Step 1: Deploy standalone contracts with no dependencies ---

    // Deploy the UserProfile contract
    const userProfile = m.contract("UserProfile");

    // Deploy the Comment contract
    const comment = m.contract("Comment");

    // Deploy the SocialToken contract
    const socialToken = m.contract("SocialToken");

    // --- Step 2: Deploy the Post contract, which depends on SocialToken ---

    // Ignition understands that 'post' needs the address of 'socialToken'.
    // It will automatically resolve this dependency, deploy 'socialToken' first,
    // and then pass its address as a constructor argument to the 'Post' contract.
    const post = m.contract("Post", [socialToken]);

    // --- Step 3: Return the deployed contracts ---
    // This makes it easy to access them later if needed.
    return { userProfile, comment, socialToken, post };
  }
);

export default DeploySocialNetworkModule;
// ```

// ### How to Run Your Deployment

// With this script in place, deploying your entire smart contract backend is now a single command.

// #### 1. To a Local Test Network:

// This is for a final check to make sure the script works.
// ```shell
// npx hardhat ignition deploy ignition/modules/DeploySocialNetwork.ts --network localhost
// ```

// #### 2. To the Sepolia Testnet (The Real Goal):

// This will make your contracts live and publicly accessible. Before you run this, you need to:
// * Get free Sepolia test ETH from a faucet.
// * Set your environment variables for your `hardhat.config.ts` file. Create a `.env` file in your project root with your Sepolia RPC URL (from a service like Infura or Alchemy) and your private key:
//     ```
//     SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_ID"
//     SEPOLIA_PRIVATE_KEY="YOUR_METAMASK_PRIVATE_KEY"
//     ```

// Once that's set up, run the command:
// ```shell
// npx hardhat ignition deploy ignition/modules/DeploySocialNetwork.ts --network sepolia
