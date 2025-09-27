import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  console.log("👨‍⚖️ Registering arbiter...");

  const arbiterRegistryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const arbiterAddress = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";

  try {
    const [owner] = await ethers.getSigners();
    const arbiterRegistry = await ethers.getContractAt("ArbiterRegistry", arbiterRegistryAddress);

    // Check if already registered
    const isActive = await arbiterRegistry.isArbiterActive(arbiterAddress);
    console.log(`Arbiter ${arbiterAddress} is currently active:`, isActive);

    if (!isActive) {
      console.log("Registering arbiter...");
      const tx = await arbiterRegistry.addArbiter(
        arbiterAddress,
        "Dev Arbiter", 
        "QmTestHash"
      );
      await tx.wait();
      console.log("✅ Arbiter registered successfully!");
      
      // Verify
      const nowActive = await arbiterRegistry.isArbiterActive(arbiterAddress);
      console.log("Arbiter is now active:", nowActive);
    } else {
      console.log("✅ Arbiter is already registered and active");
    }

  } catch (error) {
    console.error("❌ Error registering arbiter:", error);
  }
}

main().catch(console.error);
