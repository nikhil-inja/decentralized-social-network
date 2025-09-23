# Decentralized Escrow Service

A full-stack escrow platform with on-chain arbitration. It includes Solidity smart contracts, a Next.js web app, and a Go caching service.

## What’s Inside

- **Smart Contracts (Hardhat + Ignition)**: `Escrow.sol`, `EscrowFactory.sol`, `ArbiterRegistry.sol`, `UserProfile.sol`, `SocialToken.sol`
- **Web Frontend (Next.js)**: `frontend/`
- **Caching Service (Go)**: `caching-service/` connects to the local Hardhat node and tracks blocks/events
- **Tests**: Mocha/Chai tests under `test/`

## Prerequisites

- Node.js ≥ 18
- npm (or yarn/pnpm)
- Go ≥ 1.22 (for `caching-service`)
- Git

## Quick Start

1) Install dependencies (root + frontend):

```bash
npm install
cd frontend && npm install && cd ..
```

2) Start a local Hardhat node and deploy contracts:

```bash
npx hardhat node
# In a new terminal
npx hardhat ignition deploy ignition/modules/DeployEscrowPlatform.ts --network localhost
```

3) Seed local dev data (register an arbiter, deploy mock token):

```bash
npx ts-node scripts/setupDev.ts
```

4) Run the caching service (optional but recommended):

```bash
cd caching-service
go mod tidy
go run .
```

5) Run the web app:

```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

 

## Environment Variables

Create a `.env` in the project root for testnet deployments:

```
SEPOLIA_RPC_URL=...
SEPOLIA_PRIVATE_KEY=...
ETHERSCAN_API_KEY=...
```

`hardhat.config.ts` already uses safe fallbacks for missing values. For Sepolia deploy:

```bash
npx hardhat ignition deploy ignition/modules/DeployEscrowPlatform.ts --network sepolia
```

## Contract Addresses (local)

Local deployments are recorded by Ignition under `ignition/deployments/chain-31337/deployed_addresses.json`. Copy addresses into `frontend/contracts/config.js` if needed for the web UI.

## Repo Structure

```
contracts/                 # Solidity contracts
frontend/                  # Next.js web app
caching-service/           # Go block/event cache and utilities
ignition/                  # Ignition deployment modules and records
scripts/                   # Dev helpers (e.g., setupDev.ts, send-op-tx.ts)
test/                      # Contract tests
hardhat.config.ts          # Networks + plugins
```

## Common Commands

```bash
# compile and test
npx hardhat compile
npx hardhat test

# clean & recompile
npx hardhat clean && npx hardhat compile

# run a local node
npx hardhat node
```

## Troubleshooting

- Missing Go dependencies when running `caching-service`: run `go mod tidy` first.
- PowerShell chaining: use `;` instead of `&&` (e.g., `go mod tidy; go run .`).
- If frontend can’t find contracts, ensure you’ve deployed locally and updated `frontend/contracts/config.js` with addresses from Ignition.
- If Sepolia deploy fails for lack of funds, get test ETH from a faucet and set `SEPOLIA_PRIVATE_KEY`.

## Notes

- `scripts/setupDev.ts` expects a local `ArbiterRegistry` at `0x5FbDB2...aa3` (Hardhat default first deployment address). If you redeploy, update the address or read it from Ignition’s `deployed_addresses.json`.
