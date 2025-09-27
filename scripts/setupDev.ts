// scripts/setupDev.ts
import { network } from "hardhat";

async function main() {
  console.log("🚀 Starting development setup...");

  const { ethers } = await network.connect();
  const [owner, , , arbiterAccount] = await ethers.getSigners();

  // --- 1. Get Deployed ArbiterRegistry ---
  const ARBITER_REGISTRY_ADDR = "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82";
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
  
  // --- 4. Mint tokens to test accounts ---
  console.log("\n- Minting tokens to test accounts...");
  const mintAmount = ethers.parseEther("1000"); // 1000 tokens each
  
  const signers = await ethers.getSigners();
  const client = signers[1];
  const freelancer = signers[2];
  
  await socialToken.connect(owner).mint(owner.address, mintAmount);
  await socialToken.connect(owner).mint(client.address, mintAmount);
  await socialToken.connect(owner).mint(freelancer.address, mintAmount);
  
  console.log(`✅ Minted ${ethers.formatEther(mintAmount)} tokens to:`);
  console.log(`  - Owner: ${owner.address}`);
  console.log(`  - Client: ${client.address}`);
  console.log(`  - Freelancer: ${freelancer.address}`);
  
  console.log("\n🎉 Development setup complete! Use the Mock Token address for your deals.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});