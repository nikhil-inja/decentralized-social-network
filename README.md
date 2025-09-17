# Decentralized Social Network

A decentralized social network built with Solidity smart contracts, featuring user profiles, posts, comments, and a social token economy.

## Project Overview

This project includes:

- **Smart Contracts**: UserProfile, Post, Comment, and SocialToken contracts
- **Testing**: Comprehensive test suite using Mocha and Chai
- **Deployment**: Hardhat Ignition deployment scripts
- **TypeScript**: Full TypeScript support for development

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd decentralized-social-network
```

### 2. Install dependencies
```bash
npm install
```

### 3. Compile contracts
```bash
npm run compile
```

### 4. Run tests
```bash
npm test
```

### 5. Deploy to local network
```bash
npm run deploy:local
```

## Environment Setup

### For Sepolia Testnet Deployment

1. **Create a `.env` file** in the project root:
```bash
# Copy the example file and fill in your values
cp .env.example .env
# Then edit .env with your actual values
```

Required environment variables:
- `SEPOLIA_RPC_URL`: Your Sepolia RPC endpoint (Infura, Alchemy, etc.)
- `SEPOLIA_PRIVATE_KEY`: Your wallet's private key
- `ETHERSCAN_API_KEY`: Your Etherscan API key (optional, for contract verification)

2. **Get Sepolia ETH** from a faucet:
   - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - [Chainlink Sepolia Faucet](https://faucets.chain.link/sepolia)

3. **Deploy to Sepolia**:
```bash
npm run deploy:sepolia
```

## Troubleshooting

### Common Issues

**"Gas estimation failed: gas required exceeds allowance (0)"**
- This means your account has no ETH. Get test ETH from a Sepolia faucet.

**"Cannot find module" errors**
- Run `npm install` to install all dependencies
- Make sure you're using Node.js v16 or higher

**"Contract compilation failed"**
- Run `npx hardhat clean` then `npx hardhat compile`
- Check that all Solidity files are in the `contracts/` directory

**Test failures**
- Ensure all dependencies are installed: `npm install`
- Run tests with: `npx hardhat test`

## Project Structure

```
├── contracts/           # Solidity smart contracts
│   ├── UserProfile.sol  # User profile management
│   ├── Post.sol        # Post creation and management
│   ├── Comment.sol     # Comment system
│   └── SocialToken.sol # ERC20 token for the platform
├── test/               # Test files
├── ignition/           # Deployment scripts
├── scripts/            # Utility scripts
└── hardhat.config.ts   # Hardhat configuration
```

## Usage

### Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

You can also selectively run the Solidity or `mocha` tests:

```shell
npx hardhat test solidity
npx hardhat test mocha
```

### Make a deployment to Sepolia

This project includes an example Ignition module to deploy the contract. You can deploy this module to a locally simulated chain or to Sepolia.

To run the deployment to a local chain:

```shell
npx hardhat ignition deploy ignition/modules/Counter.ts
```

To run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

You can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

After setting the variable, you can run the deployment with the Sepolia network:

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts
```
