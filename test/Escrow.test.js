import { expect } from "chai";
import { network } from "hardhat";

describe("Escrow Contract", function () {
  let socialToken;
  let escrowContract;
  let owner;
  let client;
  let freelancer;
  let arbiter;

  let ethers;
  let totalAmount;
  let payouts;
  const detailsHashes = ["QmFirstMilestone", "QmSecondMilestone"];

  beforeEach(async function () {
    const { ethers: ethersInstance } = await network.connect();
    ethers = ethersInstance;
    
    // Initialize amounts after ethers is available
    totalAmount = ethers.parseUnits("1000", 18); // Total escrow amount
    payouts = [ethers.parseUnits("400", 18), ethers.parseUnits("600", 18)];
    [owner, client, freelancer, arbiter] = await ethers.getSigners();

    // 1. Deploy the dependency contract: SocialToken (as a mock ERC20)
    const SocialTokenFactory = await ethers.getContractFactory("SocialToken");
    socialToken = await SocialTokenFactory.deploy();

    // 2. Mint tokens to the client to fund the escrow
    await socialToken.connect(owner).mint(client.address, totalAmount);

    // 3. Deploy the Escrow contract
    const EscrowFactory = await ethers.getContractFactory("Escrow");
    escrowContract = await EscrowFactory.deploy(
      client.address,
      freelancer.address,
      arbiter.address,
      await socialToken.getAddress(),
      payouts,
      detailsHashes
    );
  });

  describe("Deployment and Initialization", function () {
    it("Should set the correct state variables on deployment", async function () {
      expect(await escrowContract.client()).to.equal(client.address);
      expect(await escrowContract.freelancer()).to.equal(freelancer.address);
      expect(await escrowContract.arbiter()).to.equal(arbiter.address);
      expect(await escrowContract.token()).to.equal(await socialToken.getAddress());
      expect(await escrowContract.totalAmount()).to.equal(totalAmount);
      expect(await escrowContract.currentStatus()).to.equal(0); // 0 corresponds to AgreementStatus.CREATED
    });

    it("Should correctly initialize milestones", async function () {
      const milestone1 = await escrowContract.milestones(0);
      expect(milestone1.payoutAmount).to.equal(payouts[0]);
      expect(milestone1.detailsHash).to.equal(detailsHashes[0]);
      expect(milestone1.state).to.equal(0); // 0 corresponds to MilestoneStatus.PENDING

      const milestone2 = await escrowContract.milestones(1);
      expect(milestone2.payoutAmount).to.equal(payouts[1]);
      expect(milestone2.detailsHash).to.equal(detailsHashes[1]);
      expect(milestone2.state).to.equal(0);
    });
  });

  describe("Funding", function () {
    it("Should allow the client to fund the escrow", async function () {
      // Client first approves the Escrow contract to spend the tokens
      await socialToken.connect(client).approve(await escrowContract.getAddress(), totalAmount);

      // Client funds the escrow
      await expect(escrowContract.connect(client).fundEscrow())
        .to.emit(escrowContract, "AgreementFunded")
        .withArgs(totalAmount);

      // Check contract state
      expect(await escrowContract.currentStatus()).to.equal(1); // 1 = FUNDED
      const contractBalance = await socialToken.balanceOf(await escrowContract.getAddress());
      expect(contractBalance).to.equal(totalAmount);
    });

    it("Should NOT allow a non-client to fund the escrow", async function () {
      await socialToken.connect(client).approve(await escrowContract.getAddress(), totalAmount);
      await expect(
        escrowContract.connect(freelancer).fundEscrow()
      ).to.be.revertedWith("ESCROW: Caller is not the client");
    });
  });

  describe("Milestone Workflow", function() {
    beforeEach(async function() {
      // Pre-fund the escrow for these tests
      await socialToken.connect(client).approve(await escrowContract.getAddress(), totalAmount);
      await escrowContract.connect(client).fundEscrow();
    });

    it("Should allow the freelancer to submit work", async function() {
      const workHash = "QmWorkSubmission1";
      await expect(escrowContract.connect(freelancer).submitWork(0, workHash))
        .to.emit(escrowContract, "WorkSubmitted")
        .withArgs(0, workHash);
      
      const milestone = await escrowContract.milestones(0);
      expect(milestone.state).to.equal(1); // 1 = SUBMITTED
      expect(milestone.workHash).to.equal(workHash);
    });

    it("Should allow the client to approve a submitted milestone", async function() {
      await escrowContract.connect(freelancer).submitWork(0, "QmWorkSubmission1");
      
      await expect(escrowContract.connect(client).approveMilestone(0))
        .to.emit(escrowContract, "MilestoneApproved")
        .withArgs(0, payouts[0]);

      const milestone = await escrowContract.milestones(0);
      expect(milestone.state).to.equal(2); // 2 = APPROVED

      // Verify freelancer received payment
      const freelancerBalance = await socialToken.balanceOf(freelancer.address);
      expect(freelancerBalance).to.equal(payouts[0]);
    });

    it("Should transition agreement status to IN_PROGRESS after first approval", async function() {
        await escrowContract.connect(freelancer).submitWork(0, "QmWorkSubmission1");
        await escrowContract.connect(client).approveMilestone(0);
        expect(await escrowContract.currentStatus()).to.equal(2); // 2 = IN_PROGRESS
    });

    it("Should mark the agreement as COMPLETED when all milestones are approved", async function() {
        // Approve milestone 1
        await escrowContract.connect(freelancer).submitWork(0, "QmWork1");
        await escrowContract.connect(client).approveMilestone(0);

        // Approve milestone 2
        await escrowContract.connect(freelancer).submitWork(1, "QmWork2");
        await escrowContract.connect(client).approveMilestone(1);
        
        expect(await escrowContract.currentStatus()).to.equal(4); // 4 = COMPLETED
        
        // Check final freelancer balance
        const freelancerBalance = await socialToken.balanceOf(freelancer.address);
        expect(freelancerBalance).to.equal(totalAmount);
    });
  });

  describe("Dispute Resolution", function() {
    beforeEach(async function() {
      await socialToken.connect(client).approve(await escrowContract.getAddress(), totalAmount);
      await escrowContract.connect(client).fundEscrow();
      await escrowContract.connect(freelancer).submitWork(0, "QmDisputedWork");
    });

    it("Should allow either client or freelancer to raise a dispute", async function() {
      await expect(escrowContract.connect(client).raiseDispute(0))
        .to.emit(escrowContract, "DisputeRaised")
        .withArgs(0, client.address);
      
      expect(await escrowContract.currentStatus()).to.equal(3); // 3 = DISPUTED
    });

    it("Should allow the arbiter to resolve a dispute in favor of the freelancer", async function() {
      await escrowContract.connect(client).raiseDispute(0);
      
      await expect(escrowContract.connect(arbiter).resolveDispute(0, freelancer.address))
        .to.emit(escrowContract, "DisputeResolved")
        .withArgs(0, freelancer.address, payouts[0]);
      
      // Verify freelancer was paid
      const freelancerBalance = await socialToken.balanceOf(freelancer.address);
      expect(freelancerBalance).to.equal(payouts[0]);

      // State should return to IN_PROGRESS
      expect(await escrowContract.currentStatus()).to.equal(2);
    });

    it("Should allow the arbiter to resolve a dispute in favor of the client", async function() {
      await escrowContract.connect(freelancer).raiseDispute(0);

      await expect(escrowContract.connect(arbiter).resolveDispute(0, client.address))
          .to.emit(escrowContract, "DisputeResolved")
          .withArgs(0, client.address, payouts[0]);

      // Verify client was refunded for the milestone
      const clientBalance = await socialToken.balanceOf(client.address);
      expect(clientBalance).to.equal(payouts[0]); // Client gets the milestone amount back

      // State should return to IN_PROGRESS
      expect(await escrowContract.currentStatus()).to.equal(2);
    });

    it("Should NOT allow non-arbiters to resolve disputes", async function() {
        await escrowContract.connect(client).raiseDispute(0);
        await expect(
            escrowContract.connect(client).resolveDispute(0, client.address)
        ).to.be.revertedWith("ESCROW: Caller is not the arbiter");
    });
  });
});