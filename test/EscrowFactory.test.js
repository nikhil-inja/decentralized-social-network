import { expect } from "chai";
import { ethers } from "hardhat";

describe("EscrowFactory", function () {
  let arbiterRegistry;
  let escrowFactory;
  let owner;
  let client;
  let freelancer;
  let arbiter;

  beforeEach(async function () {
    [owner, client, freelancer, arbiter] = await ethers.getSigners();

    // Deploy the ArbiterRegistry dependency
    const ArbiterRegistryFactory = await ethers.getContractFactory("ArbiterRegistry");
    arbiterRegistry = await ArbiterRegistryFactory.deploy();

    // Deploy the EscrowFactory, linking it to the registry
    const EscrowFactory = await ethers.getContractFactory("EscrowFactory");
    escrowFactory = await EscrowFactory.deploy(await arbiterRegistry.getAddress());

    // Add a valid arbiter to the registry for testing
    await arbiterRegistry.connect(owner).addArbiter(arbiter.address, "Valid Arbiter", "Qm...");
  });

  it("Should create a new Escrow contract with a valid arbiter", async function () {
    const mockTokenAddress = ethers.Wallet.createRandom().address; // Mock USDC address
    
    await expect(
      escrowFactory.connect(client).createEscrow(
        freelancer.address,
        arbiter.address,
        mockTokenAddress,
        [100],
        ["QmDetails"]
      )
    ).to.emit(escrowFactory, "EscrowCreated");

    const createdEscrows = await escrowFactory.getEscrowContracts();
    expect(createdEscrows.length).to.equal(1);
  });

  it("Should FAIL to create an Escrow contract with an invalid/inactive arbiter", async function () {
    const invalidArbiter = ethers.Wallet.createRandom().address;
    const mockTokenAddress = ethers.Wallet.createRandom().address;

    await expect(
      escrowFactory.connect(client).createEscrow(
        freelancer.address,
        invalidArbiter, // This arbiter is not in the registry
        mockTokenAddress,
        [100],
        ["QmDetails"]
      )
    ).to.be.revertedWith("FACTORY: Invalid or inactive arbiter.");
  });
});
