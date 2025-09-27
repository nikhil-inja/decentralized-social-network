import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  console.log("🚀 Redeploying simplified contracts...");

  try {
    // Deploy ArbiterRegistry first
    console.log("📋 Deploying ArbiterRegistry...");
    const ArbiterRegistryFactory = await ethers.getContractFactory("ArbiterRegistry");
    const arbiterRegistry = await ArbiterRegistryFactory.deploy();
    await arbiterRegistry.waitForDeployment();
    const arbiterRegistryAddress = await arbiterRegistry.getAddress();
    console.log(`✅ ArbiterRegistry deployed at: ${arbiterRegistryAddress}`);

    // Deploy EscrowFactory with simplified interface
    console.log("🏭 Deploying EscrowFactory...");
    const EscrowFactoryFactory = await ethers.getContractFactory("EscrowFactory");
    const escrowFactory = await EscrowFactoryFactory.deploy(arbiterRegistryAddress);
    await escrowFactory.waitForDeployment();
    const escrowFactoryAddress = await escrowFactory.getAddress();
    console.log(`✅ EscrowFactory deployed at: ${escrowFactoryAddress}`);

    // Deploy a test token
    console.log("🪙 Deploying SocialToken...");
    const SocialTokenFactory = await ethers.getContractFactory("SocialToken");
    const socialToken = await SocialTokenFactory.deploy();
    await socialToken.waitForDeployment();
    const tokenAddress = await socialToken.getAddress();
    console.log(`✅ SocialToken deployed at: ${tokenAddress}`);

    // Mint tokens to accounts
    console.log("💰 Minting tokens to test accounts...");
    const [owner, account1, account2] = await ethers.getSigners();
    const mintAmount = ethers.parseEther("1000");
    
    await socialToken.mint(owner.address, mintAmount);
    await socialToken.mint(account1.address, mintAmount);
    await socialToken.mint(account2.address, mintAmount);
    
    console.log(`✅ Minted ${ethers.formatEther(mintAmount)} tokens to 3 accounts`);

    // Register an arbiter
    console.log("👨‍⚖️ Registering test arbiter...");
    const [, , , arbiterAccount] = await ethers.getSigners();
    await arbiterRegistry.addArbiter(arbiterAccount.address, "Test Arbiter", "QmTest");
    console.log(`✅ Registered arbiter: ${arbiterAccount.address}`);

    console.log("\n🎉 Deployment complete!");
    console.log("📋 Update your frontend config with these addresses:");
    console.log(`ARBITER_REGISTRY_ADDRESS: ${arbiterRegistryAddress}`);
    console.log(`ESCROW_FACTORY_ADDRESS: ${escrowFactoryAddress}`);
    console.log(`SOCIAL_TOKEN_ADDRESS: ${tokenAddress}`);
    console.log(`TEST_ARBITER_ADDRESS: ${arbiterAccount.address}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
  }
}

main().catch(console.error);
