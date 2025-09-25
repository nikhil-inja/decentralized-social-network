import { ethers } from "hardhat";

async function main() {
  const arbiterAddress = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
  
  const provider = ethers.provider;
  const balance = await provider.getBalance(arbiterAddress);
  
  console.log(`Arbiter Address: ${arbiterAddress}`);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  console.log(`Balance (Wei): ${balance.toString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
