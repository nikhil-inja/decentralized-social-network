const { ethers } = require('hardhat');

async function main() {
  console.log('Redeploying ArbiterRegistry with latest version...');
  
  // Get the contract factory
  const ArbiterRegistry = await ethers.getContractFactory("ArbiterRegistry");
  
  // Deploy the contract
  console.log('Deploying ArbiterRegistry...');
  const arbiterRegistry = await ArbiterRegistry.deploy();
  await arbiterRegistry.waitForDeployment();
  
  const address = await arbiterRegistry.getAddress();
  console.log('✅ ArbiterRegistry deployed to:', address);
  
  // Test the contract
  console.log('Testing contract functions...');
  
  // Test owner
  const owner = await arbiterRegistry.owner();
  console.log('✅ Owner:', owner);
  
  // Test isArbiterActive function
  const testAddress = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
  const isActive = await arbiterRegistry.isArbiterActive(testAddress);
  console.log('✅ isArbiterActive test result:', isActive);
  
  // Test getArbiterList
  const arbiterList = await arbiterRegistry.getArbiterList();
  console.log('✅ Arbiter list length:', arbiterList.length);
  
  console.log('\n🎉 New ArbiterRegistry deployed successfully!');
  console.log('Update your frontend config with this address:', address);
}

main().catch(console.error);
