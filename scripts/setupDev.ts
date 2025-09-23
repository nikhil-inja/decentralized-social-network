// scripts/setupDev.ts
import { network } from "hardhat";

async function main() {
  console.log("🚀 Starting development setup...");

  const { ethers } = await network.connect();
  const [owner, , , arbiterAccount] = await ethers.getSigners();

  // --- 1. Get Deployed ArbiterRegistry ---
  // Replace with the actual address after you deploy
  const ARBITER_REGISTRY_ADDR = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const arbiterRegistry = await ethers.getContractAt("ArbiterRegistry", ARBITER_REGISTRY_ADDR);
  console.log(`- Attached to ArbiterRegistry at: ${ARBITER_REGISTRY_ADDR}`);

  // --- 2. Add an Arbiter ---
  console.log(`- Registering ${arbiterAccount.address} as an arbiter...`);
  
  // Check if arbiter already exists first
  const isAlreadyArbiter = await arbiterRegistry.isArbiterActive(arbiterAccount.address);
  if (isAlreadyArbiter) {
    console.log("ℹ️ Arbiter already registered and active.");
  } else {
    try {
      const tx = await arbiterRegistry.connect(owner).addArbiter(
        arbiterAccount.address,
        "Dev Arbiter",
        "Qm..."
      );
      await tx.wait();
      console.log("✅ Arbiter registered successfully!");
    } catch (e) {
      if (e instanceof Error && (e.message.includes("Arbiter already exists") || e.message.includes("already exists"))) {
        console.log("ℹ️ Arbiter already registered.");
      } else {
        console.error("❌ Error registering arbiter:", e);
        throw e;
      }
    }
  }

  // --- 3. Deploy a Mock Token ---
  console.log("\n- Deploying a mock ERC20 token for payments...");
  const SocialTokenFactory = await ethers.getContractFactory("SocialToken");
  const socialToken = await SocialTokenFactory.deploy();
  await socialToken.waitForDeployment();
  const tokenAddress = await socialToken.getAddress();
  console.log(`✅ Mock Token deployed at: ${tokenAddress}`);
  
  console.log("\n🎉 Development setup complete! Use the Mock Token address for your deals.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});