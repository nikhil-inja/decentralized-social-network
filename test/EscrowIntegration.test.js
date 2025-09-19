import { expect } from "chai";
import { network } from "hardhat";

describe("Escrow Platform Integration Tests", function () {
  let arbiterRegistry, escrowFactory, socialToken;
  let owner, client, freelancer, arbiter, otherUser;
  let ethers;

  // This setup runs before each test, deploying all contracts for a clean state
  beforeEach(async function () {
    const { ethers: ethersInstance } = await network.connect();
    ethers = ethersInstance;
    [owner, client, freelancer, arbiter, otherUser] = await ethers.getSigners();

    // Deploy ArbiterRegistry
    const ArbiterRegistryFactory = await ethers.getContractFactory("ArbiterRegistry");
    arbiterRegistry = await ArbiterRegistryFactory.deploy();

    // Deploy EscrowFactory, linking it to the registry
    const EscrowFactory = await ethers.getContractFactory("EscrowFactory");
    escrowFactory = await EscrowFactory.deploy(await arbiterRegistry.getAddress());

    // Deploy a mock ERC20 token for payments
    const SocialTokenFactory = await ethers.getContractFactory("SocialToken");
    socialToken = await SocialTokenFactory.deploy();

    // Add a valid arbiter to the registry for the tests
    await arbiterRegistry.connect(owner).addArbiter(arbiter.address, "Senior Arbiter", "QmArbiterProfile");
  });

  // --- HAPPY PATH SCENARIOS ---

  describe("Happy Path: Successful Deals", function () {
    it("Should handle a single-milestone project from creation to completion", async function () {
      const dealAmount = ethers.parseUnits("500", 18);
      const tokenAddress = await socialToken.getAddress();

      // 1. Create Escrow
      await expect(escrowFactory.connect(client).createEscrow(
        freelancer.address,
        arbiter.address,
        tokenAddress,
        [dealAmount],
        ["QmWebsiteDesignSpec"]
      )).to.emit(escrowFactory, "EscrowCreated");

      const escrowAddress = (await escrowFactory.getEscrowContracts())[0];
      const escrowContract = await ethers.getContractAt("Escrow", escrowAddress);

      // 2. Fund Escrow
      await socialToken.connect(owner).mint(client.address, dealAmount);
      await socialToken.connect(client).approve(escrowAddress, dealAmount);
      await escrowContract.connect(client).fundEscrow();
      expect(await escrowContract.currentStatus()).to.equal(1); // FUNDED

      // 3. Submit & Approve Work
      await escrowContract.connect(freelancer).submitWork(0, "QmFinalWebsiteFiles");
      await escrowContract.connect(client).approveMilestone(0);

      // 4. Verify Completion
      expect(await escrowContract.currentStatus()).to.equal(4); // COMPLETED
      expect(await socialToken.balanceOf(freelancer.address)).to.equal(dealAmount);
      expect(await socialToken.balanceOf(escrowAddress)).to.equal(0);
    });

    it("Should handle a multi-milestone project correctly", async function () {
        const payouts = [
            ethers.parseUnits("100", 18), // Milestone 1: Text content
            ethers.parseUnits("300", 18), // Milestone 2: Image assets
            ethers.parseUnits("600", 18)  // Milestone 3: Video animation
        ];
        const totalAmount = ethers.parseUnits("1000", 18);
        const tokenAddress = await socialToken.getAddress();

        // 1. Create & Fund
        await escrowFactory.connect(client).createEscrow(freelancer.address, arbiter.address, tokenAddress, payouts, ["QmText", "QmImage", "QmVideo"]);
        const escrowAddress = (await escrowFactory.getEscrowContracts())[0];
        const escrowContract = await ethers.getContractAt("Escrow", escrowAddress);
        await socialToken.connect(owner).mint(client.address, totalAmount);
        await socialToken.connect(client).approve(escrowAddress, totalAmount);
        await escrowContract.connect(client).fundEscrow();

        // 2. Process Milestones
        // Milestone 1
        await escrowContract.connect(freelancer).submitWork(0, "QmActualTextContent");
        await escrowContract.connect(client).approveMilestone(0);
        expect(await escrowContract.currentStatus()).to.equal(2); // IN_PROGRESS
        expect(await socialToken.balanceOf(freelancer.address)).to.equal(payouts[0]);

        // Milestone 2
        await escrowContract.connect(freelancer).submitWork(1, "QmActualImageContent");
        await escrowContract.connect(client).approveMilestone(1);
        
        // Milestone 3
        await escrowContract.connect(freelancer).submitWork(2, "QmActualVideoContent");
        await escrowContract.connect(client).approveMilestone(2);

        // 3. Verify Completion
        expect(await escrowContract.currentStatus()).to.equal(4); // COMPLETED
        expect(await socialToken.balanceOf(freelancer.address)).to.equal(totalAmount);
    });
  });

  // --- UNHAPPY PATH SCENARIOS ---

  describe("Unhappy Path: Disputes and Errors", function () {
    let escrowContract;
    const totalAmount = ethers.parseUnits("1000", 18);

    beforeEach(async function() {
        // Create a standard 2-milestone escrow for dispute tests
        const payouts = [ethers.parseUnits("400", 18), ethers.parseUnits("600", 18)];
        await escrowFactory.connect(client).createEscrow(freelancer.address, arbiter.address, await socialToken.getAddress(), payouts, ["M1", "M2"]);
        const escrowAddress = (await escrowFactory.getEscrowContracts())[0];
        escrowContract = await ethers.getContractAt("Escrow", escrowAddress);
        
        // Fund it
        await socialToken.connect(owner).mint(client.address, totalAmount);
        await socialToken.connect(client).approve(escrowAddress, totalAmount);
        await escrowContract.connect(client).fundEscrow();
    });

    it("Should handle a dispute raised by Client and resolved for Freelancer", async function() {
        await escrowContract.connect(freelancer).submitWork(0, "QmWorkForDispute");
        await escrowContract.connect(client).raiseDispute(0);
        expect(await escrowContract.currentStatus()).to.equal(3); // DISPUTED

        // Arbiter resolves in favor of the freelancer
        await escrowContract.connect(arbiter).resolveDispute(0, freelancer.address);
        
        expect(await escrowContract.currentStatus()).to.equal(2); // Back to IN_PROGRESS
        expect(await socialToken.balanceOf(freelancer.address)).to.equal(ethers.parseUnits("400", 18));
    });

    it("Should handle a dispute raised by Freelancer and resolved for Client (refund)", async function() {
        await escrowContract.connect(freelancer).submitWork(0, "QmWorkForDispute");
        await escrowContract.connect(freelancer).raiseDispute(0); // Freelancer raises dispute
        expect(await escrowContract.currentStatus()).to.equal(3); // DISPUTED

        // Arbiter resolves in favor of the client
        await escrowContract.connect(arbiter).resolveDispute(0, client.address);
        
        const clientBalance = await socialToken.balanceOf(client.address);
        // Client started with 1000, funded 1000, and got 400 back.
        expect(clientBalance).to.equal(ethers.parseUnits("400", 18));
    });

    it("Should fail to create an escrow with an inactive arbiter", async function() {
      // Deactivate the arbiter first
      await arbiterRegistry.connect(owner).removeArbiter(arbiter.address);

      await expect(
        escrowFactory.connect(client).createEscrow(
            freelancer.address,
            arbiter.address,
            await socialToken.getAddress(),
            [100],
            ["QmDetails"]
        )
      ).to.be.revertedWith("FACTORY: Invalid or inactive arbiter.");
    });
  });
});