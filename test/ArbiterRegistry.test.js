import { expect } from "chai";
import { ethers } from "hardhat";

describe("ArbiterRegistry", function () {
  let arbiterRegistry;
  let owner;
  let addr1; // Potential Arbiter
  let addr2; // Random user

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const ArbiterRegistryFactory = await ethers.getContractFactory("ArbiterRegistry");
    arbiterRegistry = await ArbiterRegistryFactory.deploy();
  });

  describe("Arbiter Management", function () {
    it("Should allow the owner to add a new arbiter", async function () {
      const arbiterName = "Judge Judy";
      const profileHash = "Qm...";

      await expect(arbiterRegistry.connect(owner).addArbiter(addr1.address, arbiterName, profileHash))
        .to.emit(arbiterRegistry, "ArbiterAdded")
        .withArgs(addr1.address, arbiterName);

      const arbiter = await arbiterRegistry.arbiters(addr1.address);
      expect(arbiter.name).to.equal(arbiterName);
      expect(arbiter.isActive).to.be.true;
    });

    it("Should NOT allow a non-owner to add an arbiter", async function () {
      await expect(
        arbiterRegistry.connect(addr1).addArbiter(addr2.address, "Fake Arbiter", "Qm...")
      ).to.be.revertedWithCustomError(arbiterRegistry, "OwnableUnauthorizedAccount");
    });

    it("Should allow the owner to remove an arbiter", async function () {
      await arbiterRegistry.connect(owner).addArbiter(addr1.address, "Judge Judy", "Qm...");
      
      await expect(arbiterRegistry.connect(owner).removeArbiter(addr1.address))
        .to.emit(arbiterRegistry, "ArbiterRemoved")
        .withArgs(addr1.address);
      
      const arbiter = await arbiterRegistry.arbiters(addr1.address);
      expect(arbiter.isActive).to.be.false;
    });

    it("Should correctly report if an arbiter is active", async function() {
        expect(await arbiterRegistry.isArbiterActive(addr1.address)).to.be.false;
        await arbiterRegistry.connect(owner).addArbiter(addr1.address, "Judge Judy", "Qm...");
        expect(await arbiterRegistry.isArbiterActive(addr1.address)).to.be.true;
    });
  });
});
