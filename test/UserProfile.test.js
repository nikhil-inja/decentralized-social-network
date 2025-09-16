import { expect } from "chai";
import { network } from "hardhat";

describe("UserProfile (Refactored)", function () {
  let userProfile;
  let owner;
  let addr1;

  let ethers;

  // This hook runs before each test, deploying a fresh contract for test isolation.
  beforeEach(async function () {
    const { ethers: ethersInstance } = await network.connect();
    ethers = ethersInstance;
    [owner, addr1] = await ethers.getSigners();
    const UserProfileFactory = await ethers.getContractFactory("UserProfile");
    userProfile = await UserProfileFactory.deploy();
  });

  describe("Profile Creation and Management", function() {
    it("Should allow a user to set their profile and verify it is active", async function () {
      const testUsername = "testUser";
      const testBio = "This is a test bio.";
      const testImageHash = "Qm...";

      // --- ACT: Set the profile ---
      await expect(userProfile.connect(owner).setProfile(testUsername, testBio, testImageHash))
        .to.emit(userProfile, "ProfileUpdated")
        .withArgs(owner.address, testUsername, testBio, testImageHash);

      // --- ASSERT: Get the profile and verify its data ---
      const retrievedProfile = await userProfile.getProfile(owner.address);

      expect(retrievedProfile.username).to.equal(testUsername);
      expect(retrievedProfile.bio).to.equal(testBio);
      expect(retrievedProfile.profileImageHash).to.equal(testImageHash);
      expect(retrievedProfile.isActive).to.be.true; // Verify it's active on creation
    });
  });

  // --- NEW TEST SUITE for the delete functionality ---
  describe("Profile Deletion", function() {
    beforeEach(async function() {
      // Create a profile for 'owner' before each deletion test
      await userProfile.connect(owner).setProfile("UserToDelete", "Bio", "QmHash");
    });

    it("Should allow a user to soft-delete their own profile", async function() {
      // --- ACT: Delete the profile ---
      await expect(userProfile.connect(owner).deleteProfile())
        .to.emit(userProfile, "ProfileDeleted")
        .withArgs(owner.address);

      // --- ASSERT: Verify the profile is now inactive ---
      const retrievedProfile = await userProfile.getProfile(owner.address);
      expect(retrievedProfile.isActive).to.be.false;
    });

    it("Should still return profile data after deletion (soft delete)", async function() {
        await userProfile.connect(owner).deleteProfile();
        const retrievedProfile = await userProfile.getProfile(owner.address);

        // Data is preserved, only the isActive flag is changed
        expect(retrievedProfile.username).to.equal("UserToDelete");
        expect(retrievedProfile.isActive).to.be.false;
    });

    it("Should allow a user to reactivate their profile by setting it again", async function() {
        await userProfile.connect(owner).deleteProfile(); // First, delete it
        let retrievedProfile = await userProfile.getProfile(owner.address);
        expect(retrievedProfile.isActive).to.be.false; // Confirm it's inactive

        // --- ACT: User sets their profile again ---
        await userProfile.connect(owner).setProfile("NewUsername", "NewBio", "QmNewHash");
        
        // --- ASSERT: Profile should be active again ---
        retrievedProfile = await userProfile.getProfile(owner.address);
        expect(retrievedProfile.isActive).to.be.true;
        expect(retrievedProfile.username).to.equal("NewUsername");
    });
  });
});

