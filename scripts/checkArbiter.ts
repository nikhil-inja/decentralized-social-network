// scripts/checkArbiter.ts
import { network } from "hardhat";

const { ethers } = await network.connect();


async function main() {
  const ARBITER_REGISTRY_ADDR = process.env.ARBITER_REGISTRY_ADDRESS as string;

  console.log(`Checking ArbiterRegistry at: ${ARBITER_REGISTRY_ADDR}`);
  const arbiterRegistry = await ethers.getContractAt("ArbiterRegistry", ARBITER_REGISTRY_ADDR as string);

  try {
    const arbiterAddresses = [];
    let i = 0;
    try {
      while (true) {
        const address = await arbiterRegistry.arbiterList(i);
        arbiterAddresses.push(address);
        i++;
      }
    } catch {

    }
    const arbiterCount = arbiterAddresses.length;
    console.log(`Found ${arbiterCount} arbiter(s) in the list.`);

    if (arbiterCount > 0) {
      for (const address of arbiterAddresses) {
        const arbiter = await arbiterRegistry.arbiters(address);
        console.log(`- Arbiter Address: ${address}`);
        console.log(`  - Name: ${arbiter.name}`);
        console.log(`  - IsActive: ${arbiter.isActive}`);
      }
    }
  } catch (error) {
    console.error("Error fetching arbiters:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});