const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SocialToken", function () {
  let socialToken;
  let owner;
  let addr1;
  let addr2;

  // This hook runs before each test, deploying a fresh contract instance
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const SocialTokenFactory = await ethers.getContractFactory("SocialToken");
    socialToken = await SocialTokenFactory.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await socialToken.name()).to.equal("Social Token");
      expect(await socialToken.symbol()).to.equal("SCL");
    });

    it("Should assign the deployer as the owner", async function () {
      expect(await socialToken.owner()).to.equal(owner.address);
    });

    it("Should have an initial total supply of 0", async function () {
        expect(await socialToken.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should allow the owner to mint tokens", async function () {
      // Mint 1000 tokens to addr1
      // Note: ERC20 tokens have decimals, so we multiply by 10**18
      const amount = ethers.parseUnits("1000", 18);
      await socialToken.connect(owner).mint(addr1.address, amount);

      // Check addr1's balance
      expect(await socialToken.balanceOf(addr1.address)).to.equal(amount);
      
      // Check that total supply has increased
      expect(await socialToken.totalSupply()).to.equal(amount);
    });

    it("Should NOT allow a non-owner to mint tokens", async function () {
      const amount = ethers.parseUnits("1000", 18);
      
      // We expect this transaction to fail (revert) because addr1 is not the owner.
      // The error message comes from OpenZeppelin's Ownable contract.
      await expect(
        socialToken.connect(addr1).mint(addr2.address, amount)
      ).to.be.revertedWithCustomError(socialToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Transfers", function () {
    it("Should allow users to transfer tokens", async function () {
      // Mint 1000 tokens to the owner first
      const amount = ethers.parseUnits("1000", 18);
      await socialToken.connect(owner).mint(owner.address, amount);

      // Owner transfers 200 tokens to addr1
      const transferAmount = ethers.parseUnits("200", 18);
      await socialToken.connect(owner).transfer(addr1.address, transferAmount);

      // Check balances
      const ownerBalance = await socialToken.balanceOf(owner.address);
      const addr1Balance = await socialToken.balanceOf(addr1.address);

      expect(ownerBalance).to.equal(ethers.parseUnits("800", 18));
      expect(addr1Balance).to.equal(transferAmount);
    });

    it("Should fail if a user tries to transfer more tokens than they have", async function () {
        // Mint 100 tokens to owner
        const initialAmount = ethers.parseUnits("100", 18);
        await socialToken.connect(owner).mint(owner.address, initialAmount);

        // Owner tries to transfer 101 tokens
        const transferAmount = ethers.parseUnits("101", 18);

        // Expect the transaction to be reverted by the ERC20 contract logic
        await expect(
            socialToken.connect(owner).transfer(addr1.address, transferAmount)
        ).to.be.revertedWithCustomError(socialToken, "ERC20InsufficientBalance");
    });
  });
});
