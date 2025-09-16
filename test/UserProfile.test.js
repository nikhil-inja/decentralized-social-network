const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UserProfile", function () {
  let userProfile;
  let owner;
  let addr1; // We'll add another account for future tests

  // This hook runs once before all tests in this block
  before(async function () {
    [owner, addr1] = await ethers.getSigners();
    const UserProfileFactory = await ethers.getContractFactory("UserProfile");
    userProfile = await UserProfileFactory.deploy();
  });


  it("Should allow a user to set their profile", async function () {
    const testUsername = "testUser";
    const testBio = "This is a test bio.";
    const testImageHash = "Qm..."; // Example IPFS hash

    // We call the setProfile function and check for the event emission
    await expect(userProfile.connect(owner).setProfile(testUsername, testBio, testImageHash))
      .to.emit(userProfile, "ProfileUpdated")
      .withArgs(owner.address, testUsername, testBio, testImageHash);
  });

  it("Should allow a user to get their profile data", async function () {
     const testUsername = "testUser";
     const testBio = "This is a test bio.";
     const testImageHash = "Qm...";
    
    // Get the profile after it has been set in the previous test
    const retrievedProfile = await userProfile.getProfile(owner.address);

    // Check if the data is correct
    expect(retrievedProfile.username).to.equal(testUsername);
    expect(retrievedProfile.bio).to.equal(testBio);
    expect(retrievedProfile.profileImageHash).to.equal(testImageHash);
  });

});
