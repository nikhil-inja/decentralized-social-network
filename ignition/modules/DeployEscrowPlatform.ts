import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// This is the deployment module for our entire Escrow Platform.
const DeployEscrowPlatformModule = buildModule(
  "DeployEscrowPlatformModule",
  (m) => {
    // --- Step 1: Deploy standalone contracts first ---

    // Deploy the UserProfile contract for user identities
    const userProfile = m.contract("UserProfile");

    // Deploy the ArbiterRegistry contract, which will be owned by the deployer
    const arbiterRegistry = m.contract("ArbiterRegistry");

    // --- Step 2: Deploy the EscrowFactory, which depends on the ArbiterRegistry ---

    // Ignition understands that 'escrowFactory' needs the address of 'arbiterRegistry'.
    // It will automatically resolve this, deploy 'arbiterRegistry' first,
    // and then pass its address as a constructor argument to the EscrowFactory.
    const escrowFactory = m.contract("EscrowFactory", [arbiterRegistry]);

    // --- Step 3: Return the deployed contracts for easy access ---
    return { userProfile, arbiterRegistry, escrowFactory };
  }
);

export default DeployEscrowPlatformModule;